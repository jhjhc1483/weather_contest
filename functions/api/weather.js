/* Cloudflare Pages Function: /api/weather */
export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    const dataUrl = `${url.origin}/data/latest_weather.json`;
    const res = await fetch(dataUrl);
    
    if (res.ok) {
      const json = await res.json();
      return new Response(JSON.stringify(json), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=300'
        }
      });
    }
  } catch (e) {
    console.error('Cloudflare function error fetching weather:', e);
  }

  return new Response(JSON.stringify({
    status: 'CLIMATOLOGY_1YR_FALLBACK',
    message: 'Local Fallback Climatology Mode'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
