export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const mountainName = searchParams.get('searchWrd') || '';

  const SERVICE_KEY = 'c6d38e7f40238d4d5ee29ef0a05b4f884d1d294a56c3e61a5dfc8f04a0f7b696';

  const apiUrl = `https://api.forest.go.kr/openapi/service/cultureInfoService/mntInfoOpenAPI?serviceKey=${SERVICE_KEY}&searchWrd=${encodeURIComponent(mountainName)}&_type=json`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    const data = await response.text();

    return new Response(data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
