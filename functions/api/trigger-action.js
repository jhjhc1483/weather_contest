/* Cloudflare Pages Function: /api/trigger-action */
export async function onRequestPost(context) {
  try {
    const ghToken = context.env.GITHUB_TOKEN || context.env.GH_PAT_TOKEN;
    const ghOwner = context.env.GITHUB_OWNER || 'jhjhc1483';
    const ghRepo = context.env.GITHUB_REPO || 'weather_contest';

    if (!ghToken) {
      return new Response(JSON.stringify({
        triggered: false,
        message: 'GitHub Token이 설정되지 않았습니다. Cloudflare Pages 환경 변수(GITHUB_TOKEN)를 등록해 주세요.'
      }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
    }

    const res = await fetch(`https://api.github.com/repos/${ghOwner}/${ghRepo}/actions/workflows/fetch_weather.yml/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${ghToken}`,
        'User-Agent': 'Cloudflare-Pages-App'
      },
      body: JSON.stringify({ ref: 'main' })
    });

    if (res.status === 204) {
      return new Response(JSON.stringify({
        triggered: true,
        message: 'GitHub Actions 파이프라인 수집 요청 성공'
      }), { headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({
        triggered: false,
        message: `GitHub API 응답 오류 (${res.status})`
      }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
    }
  } catch (e) {
    return new Response(JSON.stringify({
      triggered: false,
      error: e.message
    }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
}
