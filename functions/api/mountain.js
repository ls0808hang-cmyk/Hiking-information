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

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const name = (url.searchParams.get("name") || "").trim();
    const serviceKey = (context.env.FOREST_API_KEY || "").trim();

    if (!name) {
      return makeJson({ ok: false, error: "산 이름을 입력해주세요." }, 400);
    }

    if (!serviceKey) {
      return makeJson({ ok: false, error: "FOREST_API_KEY가 없습니다." }, 500);
    }

    const apiUrl = new URL("http://api.forest.go.kr/openapi/service/trailInfoService/getforeststoryservice");
    apiUrl.searchParams.set("serviceKey", serviceKey);
    apiUrl.searchParams.set("mntnNm", name);
    apiUrl.searchParams.set("numOfRows", "10");
    apiUrl.searchParams.set("pageNo", "1");

    const upstream = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/xml,text/xml,application/json;q=0.9,*/*;q=0.8"
      }
    });

    const raw = await upstream.text();

    if (!upstream.ok) {
      return makeJson({
        ok: false,
        error: "산림청 API 호출 실패",
        status: upstream.status,
        raw: raw.slice(0, 300)
      }, 502);
    }

    const itemMatch = raw.match(/<item>([\s\S]*?)<\/item>/i);

    if (!itemMatch) {
      return makeJson({
        ok: false,
        error: "검색 결과가 없거나 응답 파싱 실패",
        raw: raw.slice(0, 300)
      }, 404);
    }

    const itemXml = itemMatch[1];

    const mountain = {
      name: getTag(itemXml, "Mntiname") || getTag(itemXml, "mntiname") || name,
      location: getTag(itemXml, "mntiadd") || "-",
      height: getTag(itemXml, "mntihigh") || "-",
      summary: getTag(itemXml, "mntisummary") || "-",
      story: getTag(itemXml, "mntidetails") || getTag(itemXml, "mntitop") || "-"
    };

    return makeJson({ ok: true, mountain });
  } catch (error) {
    return makeJson({
      ok: false,
      error: "서버 함수 실행 오류",
      detail: error instanceof Error ? error.message : String(error)
    }, 500);
  }
}
