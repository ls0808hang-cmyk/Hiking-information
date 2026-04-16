export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const mountainName = searchParams.get('searchWrd') || '';

  if (!mountainName) {
    return new Response(JSON.stringify({ error: 'Mountain name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const GEMINI_API_KEY = context.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Cloudflare environment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${mountainName}에 대해 아래 JSON 형식으로만 답해주세요. 다른 말은 절대 하지 마세요. 마크다운 코드블록도 쓰지 마세요:
{"mntnNm":"산이름","mntnAdd":"위치(도/시 단위)","mntnHght":"높이(숫자만)","mntnInfo":"산 유래와 특징 3~4문장"}`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || `Gemini API error: ${response.statusText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      throw new Error('Invalid response structure from Gemini API');
    }

    let text = data.candidates[0].content.parts[0].text.trim();
    
    // Clean up markdown code blocks if present
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    // Validate if it's valid JSON
    try {
      JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error:', text);
      throw new Error('Gemini returned an invalid JSON format');
    }

    return new Response(text, {
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
