const LOCAL_MOUNTAINS = [
  {
    name: "아차산",
    location: "서울 광진구 · 경기 구리시",
    height: "295.7",
    summary: "도심에서 가볍게 오르기 좋은 대표 입문 산입니다.",
    story: "아차산은 서울 동부와 구리시에 걸쳐 있는 산으로, 접근성이 매우 좋아 초보자와 가족 산행 코스로 많이 찾습니다. 비교적 짧은 시간 안에 정상부 전망을 볼 수 있어 가벼운 산행에 적합합니다."
  },
  {
    name: "관악산",
    location: "서울 관악구 · 경기 안양시 · 과천시",
    height: "632",
    summary: "암릉과 경사가 섞인 서울권 대표 중급 산행지입니다.",
    story: "관악산은 바위 능선과 오르막 구간이 비교적 뚜렷해 초보자에게는 약간 도전적인 산입니다. 정상부 주변 조망이 좋고 등산 코스가 다양해 많은 등산객이 찾습니다."
  },
  {
    name: "북한산",
    location: "서울 강북구 · 은평구 · 경기 고양시",
    height: "836.5",
    summary: "서울 대표 명산으로 코스별 난이도 차이가 큰 산입니다.",
    story: "북한산은 서울을 대표하는 산으로, 암봉과 계곡, 성곽길이 어우러져 경관이 뛰어납니다. 쉬운 탐방로부터 난이도 높은 암릉 코스까지 다양하게 선택할 수 있습니다."
  },
  {
    name: "도봉산",
    location: "서울 도봉구 · 경기 의정부시",
    height: "739.5",
    summary: "바위 구간과 경치가 인상적인 중급 이상 산행지입니다.",
    story: "도봉산은 기암괴석과 능선 조망으로 유명하며, 일부 코스는 경사와 바위 구간이 있어 주의가 필요합니다. 날씨가 좋을 때 정상부 조망 만족도가 높은 편입니다."
  },
  {
    name: "인왕산",
    location: "서울 종로구",
    height: "338.2",
    summary: "짧은 시간에 오를 수 있는 도심형 산행 코스입니다.",
    story: "인왕산은 서울 도심과 가까워 접근성이 좋고, 비교적 짧은 코스로 성곽길과 전망을 함께 즐길 수 있습니다. 초보자도 무리 없이 도전하기 좋은 편입니다."
  },
  {
    name: "청계산",
    location: "서울 서초구 · 경기 성남시 · 의왕시",
    height: "618",
    summary: "흙길과 숲길이 비교적 잘 정비된 인기 산행지입니다.",
    story: "청계산은 비교적 등산로가 잘 정비되어 있어 초보자부터 중급자까지 많이 찾습니다. 계단 구간과 오르막이 있는 코스도 있어 체력 안배가 중요합니다."
  },
  {
    name: "설악산",
    location: "강원 속초시 · 인제군 · 양양군",
    height: "1708",
    summary: "장거리와 암릉 코스가 많은 국내 대표 상급 산행지입니다.",
    story: "설악산은 웅장한 암봉과 계곡으로 유명한 국립공원입니다. 쉬운 탐방 구간도 있지만, 대청봉이나 공룡능선 같은 코스는 체력과 준비가 충분해야 하며 기상 변화에 특히 주의해야 합니다."
  },
  {
    name: "지리산",
    location: "전남 구례군 · 전북 남원시 · 경남 하동군 · 산청군 · 함양군",
    height: "1915",
    summary: "국내 대표 장거리 종주 산행지로 체력 소모가 큰 편입니다.",
    story: "지리산은 우리나라에서 가장 넓은 산악권 중 하나로, 능선 길이 길고 코스가 다양합니다. 천왕봉, 노고단 등 대표 코스가 있으며 장거리 산행 준비가 중요합니다."
  },
  {
    name: "한라산",
    location: "제주특별자치도 제주시 · 서귀포시",
    height: "1947",
    summary: "사계절 인기가 높은 국내 최고봉입니다.",
    story: "한라산은 우리나라 최고봉으로, 성판악·관음사 등 대표 탐방 코스가 있습니다. 계절과 날씨에 따라 난이도가 크게 달라질 수 있어 사전 통제가 있는지 꼭 확인해야 합니다."
  },
  {
    name: "소백산",
    location: "충북 단양군 · 경북 영주시",
    height: "1439.5",
    summary: "능선 조망이 좋은 중급 산행지입니다.",
    story: "소백산은 비교적 넓은 능선과 탁 트인 조망으로 유명합니다. 겨울 설경이 특히 아름답고, 계절에 따라 바람이 강할 수 있어 방풍 준비가 중요합니다."
  }
];

function makeJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function decodeXml(text = "") {
  return String(text)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function normalizeServiceKey(value = "") {
  const key = String(value).trim();
  if (!key) return "";
  try {
    return /%[0-9A-Fa-f]{2}/.test(key) ? decodeURIComponent(key) : key;
  } catch {
    return key;
  }
}

function normalizeName(value = "") {
  return String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(/산$/i, "")
    .toLowerCase();
}

function findLocalMountain(name = "") {
  const q = normalizeName(name);
  if (!q) return null;

  const exact = LOCAL_MOUNTAINS.find((item) => normalizeName(item.name) === q);
  if (exact) return exact;

  const partial = LOCAL_MOUNTAINS.find((item) => {
    const n = normalizeName(item.name);
    return n.includes(q) || q.includes(n);
  });

  return partial || null;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function buildMountainFromXml(itemXml, fallbackName) {
  return {
    name: getTag(itemXml, "Mntiname") || getTag(itemXml, "mntiname") || fallbackName,
    location: getTag(itemXml, "mntiadd") || "-",
    height: getTag(itemXml, "mntihigh") || "-",
    summary: getTag(itemXml, "mntisummary") || "-",
    story: getTag(itemXml, "mntidetails") || getTag(itemXml, "mntitop") || "-"
  };
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const name = (url.searchParams.get("name") || "").trim();
    const serviceKey = normalizeServiceKey(context.env.FOREST_API_KEY || "");

    if (!name) {
      return makeJson({ ok: false, error: "산 이름을 입력해주세요." }, 400);
    }

    const localMountain = findLocalMountain(name);

    // 1) 외부 API 먼저 시도
    if (serviceKey) {
      try {
        const apiUrl = new URL("https://api.forest.go.kr/openapi/service/trailInfoService/getforeststoryservice");
        apiUrl.searchParams.set("serviceKey", serviceKey);
        apiUrl.searchParams.set("mntnNm", name);
        apiUrl.searchParams.set("numOfRows", "10");
        apiUrl.searchParams.set("pageNo", "1");

        const upstream = await fetchWithTimeout(
          apiUrl.toString(),
          {
            method: "GET",
            headers: {
              "Accept": "application/xml,text/xml,application/json;q=0.9,*/*;q=0.8"
            }
          },
          7000
        );

        const raw = await upstream.text();

        if (upstream.ok) {
          const itemMatch = raw.match(/<item>([\s\S]*?)<\/item>/i);

          if (itemMatch) {
            const mountain = buildMountainFromXml(itemMatch[1], name);
            return makeJson({
              ok: true,
              source: "forest_api",
              mountain
            });
          }
        }
      } catch (e) {
        // 외부 API 실패 시 아래 로컬 데이터로 자동 전환
      }
    }

    // 2) 외부 API 실패 시 로컬 데이터 반환
    if (localMountain) {
      return makeJson({
        ok: true,
        source: "local_backup",
        mountain: localMountain
      });
    }

    // 3) 둘 다 실패하면 에러
    return makeJson({
      ok: false,
      error: "검색 결과가 없습니다. 현재 백업 데이터에도 없는 산 이름입니다."
    }, 404);

  } catch (error) {
    return makeJson({
      ok: false,
      error: "서버 함수 실행 오류",
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
}
