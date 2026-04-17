function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function normalizeText(value = "") {
  return String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();
}

function heightToNumber(height = "") {
  const num = Number(String(height).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

function localGuideFromMountain(mountain) {
  const h = heightToNumber(mountain.height);
  const difficulty = mountain.difficulty || "정보 없음";

  let quickTip = "물과 간단한 간식을 준비하고, 해 지기 전 하산 계획을 먼저 잡아두세요.";

  if (difficulty.includes("초급")) {
    quickTip = "운동화보다는 가벼운 등산화를 추천하고, 처음 가는 경우 1~2시간 안쪽 코스로 시작해보세요.";
  } else if (difficulty.includes("중급")) {
    quickTip = "경사 구간과 바위 구간이 섞일 수 있으니 미끄럼에 주의하고, 물과 스틱을 챙기면 훨씬 편합니다.";
  } else if (difficulty.includes("상급")) {
    quickTip = "체력 안배가 중요합니다. 기상 확인, 충분한 물, 방풍·보온 준비, 무리한 일정 피하기가 핵심입니다.";
  }

  let courseHint = "대표 코스를 미리 확인하고 입산·하산 시간을 먼저 정하는 것이 좋습니다.";
  if (h >= 1500) {
    courseHint = "해발이 높고 산행 시간이 길어질 수 있어 새벽 출발과 여유 있는 하산 계획이 중요합니다.";
  } else if (h >= 700) {
    courseHint = "오르막이 길어질 수 있으니 초반 속도를 낮추고 중간 휴식을 짧게 여러 번 가져가세요.";
  }

  return {
    difficulty,
    shortGuide: `${mountain.name}은(는) ${difficulty} 수준으로 보는 것이 무난합니다. ${quickTip} ${courseHint}`
  };
}

async function loadMountains(request) {
  // In Cloudflare Pages, we can fetch from the same origin
  const dataUrl = new URL("/data/mountains.json", request.url);
  const res = await fetch(dataUrl.toString());

  if (!res.ok) {
    throw new Error("mountains.json 파일을 읽지 못했습니다.");
  }

  return res.json();
}

function findLocalMountain(query, mountains) {
  const q = normalizeText(query);
  if (!q) return null;

  const exact = mountains.find((m) => normalizeText(m.name) === q);
  if (exact) return exact;

  const aliasExact = mountains.find((m) =>
    Array.isArray(m.aliases) && m.aliases.some((a) => normalizeText(a) === q)
  );
  if (aliasExact) return aliasExact;

  const partial = mountains.find((m) => {
    const n = normalizeText(m.name);
    if (n.includes(q) || q.includes(n)) return true;

    if (Array.isArray(m.aliases)) {
      return m.aliases.some((a) => {
        const aa = normalizeText(a);
        return aa.includes(q) || q.includes(aa);
      });
    }

    return false;
  });

  return partial || null;
}

/**
 * Enhanced callOpenAI function using standard OpenAI Chat Completions API with Structured Outputs.
 */
async function callOpenAI({ apiKey, schemaName, schema, systemPrompt, userPrompt }) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5.4-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: schemaName,
          strict: true,
          schema: schema
        }
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`OpenAI 호출 실패: ${JSON.stringify(data.error || data)}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI 응답에서 내용을 찾지 못했습니다.");
  }

  return JSON.parse(content);
}

async function chooseMountainWithOpenAI(query, mountains, apiKey) {
  const candidateNames = mountains.map((m) => m.name);

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      mountainName: {
        type: "string",
        enum: candidateNames
      },
      reason: {
        type: "string"
      }
    },
    required: ["mountainName", "reason"]
  };

  const systemPrompt = [
    "너의 역할은 사용자 입력에서 가장 알맞은 산 이름 1개를 고르는 것이다.",
    "반드시 후보 목록 안에서만 선택한다.",
    "없는 산을 만들지 않는다.",
    "오타, 띄어쓰기, 비슷한 표현, 초보자용 요청도 가장 가까운 후보 1개로 매칭한다."
  ].join("\n");

  const userPrompt = [
    `후보 목록: ${candidateNames.join(", ")}`,
    `사용자 입력: ${query}`
  ].join("\n");

  const parsed = await callOpenAI({
    apiKey,
    schemaName: "mountain_match",
    schema,
    systemPrompt,
    userPrompt
  });

  return mountains.find((m) => m.name === parsed.mountainName) || null;
}

async function makeGuideWithOpenAI(mountain, query, apiKey) {
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      difficulty: { type: "string" },
      shortGuide: { type: "string" }
    },
    required: ["difficulty", "shortGuide"]
  };

  const systemPrompt = [
    "너는 초보자에게 등산 정보를 쉽게 설명하는 도우미다.",
    "반드시 제공된 산 데이터만 사용한다.",
    "위치, 높이, 난이도, 요약 정보를 바꾸거나 추가로 지어내지 않는다.",
    "짧고 실용적인 안내문만 작성한다."
  ].join("\n");

  const userPrompt = [
    `사용자 입력: ${query}`,
    `산 이름: ${mountain.name}`,
    `위치: ${mountain.location}`,
    `높이: ${mountain.height}m`,
    `난이도: ${mountain.difficulty}`,
    `요약: ${mountain.summary}`,
    `상세 설명: ${mountain.story}`,
    "출력 규칙:",
    "- difficulty에는 제공된 난이도를 유지",
    "- shortGuide는 2~3문장, 초보자도 이해하기 쉽게 작성"
  ].join("\n");

  return callOpenAI({
    apiKey,
    schemaName: "mountain_guide",
    schema,
    systemPrompt,
    userPrompt
  });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = (url.searchParams.get("name") || "").trim();

    if (!query) {
      return json({ ok: false, error: "산 이름을 입력해주세요." }, 400);
    }

    const mountains = await loadMountains(request);
    const apiKey = String(env.OPENAI_API_KEY || "").trim();

    let matchedMountain = null;
    let matchedBy = "local";

    if (apiKey) {
      try {
        matchedMountain = await chooseMountainWithOpenAI(query, mountains, apiKey);
        if (matchedMountain) matchedBy = "openai";
      } catch (e) {
        console.error("OpenAI Match Error:", e);
        matchedMountain = null;
      }
    }

    if (!matchedMountain) {
      matchedMountain = findLocalMountain(query, mountains);
      matchedBy = "local";
    }

    if (!matchedMountain) {
      return json(
        {
          ok: false,
          error: "해당 산을 찾지 못했습니다. 예: 아차산, 관악산, 북한산, 설악산"
        },
        404
      );
    }

    let guide = localGuideFromMountain(matchedMountain);
    let guideBy = "local";

    if (apiKey) {
      try {
        const aiGuide = await makeGuideWithOpenAI(matchedMountain, query, apiKey);
        if (aiGuide?.shortGuide) {
          guide = {
            difficulty: aiGuide.difficulty || matchedMountain.difficulty || guide.difficulty,
            shortGuide: aiGuide.shortGuide
          };
          guideBy = "openai";
        }
      } catch (e) {
        console.error("OpenAI Guide Error:", e);
        guideBy = "local";
      }
    }

    return json({
      ok: true,
      source: {
        mountainMatch: matchedBy,
        guide: guideBy,
        data: "local_json"
      },
      mountain: {
        name: matchedMountain.name,
        location: matchedMountain.location,
        height: matchedMountain.height,
        difficulty: guide.difficulty || matchedMountain.difficulty || "정보 없음",
        summary: matchedMountain.summary,
        story: matchedMountain.story,
        guide: guide.shortGuide
      }
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: "서버 오류가 발생했습니다.",
        detail: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}
