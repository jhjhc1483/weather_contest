/* Cloudflare Pages Function: /api/action-status */
export async function onRequestGet(context) {
  try {
    const ghToken = context.env.GITHUB_TOKEN || context.env.GH_PAT_TOKEN;
    const ghOwner = context.env.GITHUB_OWNER || 'jhjhc1483';
    const ghRepo = context.env.GITHUB_REPO || 'weather_contest';

    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Cloudflare-Pages-App'
    };
    if (ghToken) headers['Authorization'] = `Bearer ${ghToken}`;

    const res = await fetch(`https://api.github.com/repos/${ghOwner}/${ghRepo}/actions/workflows/fetch_weather.yml/runs?per_page=1`, { headers });

    if (res.ok) {
      const data = await res.json();
      const latestRun = data.workflow_runs && data.workflow_runs[0];
      if (latestRun) {
        return new Response(JSON.stringify({
          status: latestRun.status === 'completed' ? latestRun.conclusion : latestRun.status,
          conclusion: latestRun.conclusion,
          updated_at: latestRun.updated_at
        }), { headers: { 'Content-Type': 'application/json' } });
      }
    }
  } catch (e) {
    console.error('Action status error:', e);
  }

  return new Response(JSON.stringify({ status: 'unknown' }), { headers: { 'Content-Type': 'application/json' } });
}
