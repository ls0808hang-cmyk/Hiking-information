export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const mountainName = searchParams.get('searchWrd') || '';

  const SERVICE_KEY = 'c6d38e7f40238d4d5ee29ef0a05b4f884d1d294a56c3e61a5dfc8f04a0f7b696';

  const apiUrl = `https://apis.data.go.kr/1400000/service/cultureInfoService2/mntInfoOpenAPI2?serviceKey=${SERVICE_KEY}&searchWrd=${encodeURIComponent(mountainName)}&_type=json`;

  const response = await fetch(apiUrl);
  const data = await response.text();

  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
