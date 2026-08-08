"use strict";

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const owner = (process.env.VERCEL_GIT_REPO_OWNER || process.env.GITHUB_OWNER || "jhjhc1483").trim();
  const repo = (process.env.VERCEL_GIT_REPO_SLUG || process.env.GITHUB_REPO || "weather_contest").trim();

  let rawToken = process.env.GITHUB_TOKEN || process.env.GH_PAT || "";
  let githubToken = rawToken.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '');

  if (!githubToken) {
    return res.status(200).json({ status: 'unknown', message: '토큰 미설정' });
  }

  try {
    // Get the latest workflow runs for fetch_weather.yml
    const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/fetch_weather.yml/runs?per_page=1`;
    const response = await fetch(runsUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'Vercel-Serverless-Function'
      }
    });

    if (!response.ok) {
      return res.status(200).json({ status: 'unknown', message: `API 응답 에러 (${response.status})` });
    }

    const data = await response.json();
    const runs = data.workflow_runs || [];

    if (runs.length === 0) {
      return res.status(200).json({ status: 'idle', message: '실행 이력 없음' });
    }

    const latest = runs[0];
    const runStatus = latest.status;       // queued, in_progress, completed
    const conclusion = latest.conclusion;  // success, failure, cancelled, null (if still running)
    const startedAt = latest.created_at;
    const updatedAt = latest.updated_at;

    let uiStatus, uiMessage, uiIcon;

    if (runStatus === 'queued') {
      uiStatus = 'queued';
      uiIcon = '⏳';
      uiMessage = '데이터 수집 대기열에 등록됨';
    } else if (runStatus === 'in_progress') {
      uiStatus = 'running';
      uiIcon = '🔄';
      uiMessage = '데이터 수집 진행 중...';
    } else if (runStatus === 'completed') {
      if (conclusion === 'success') {
        uiStatus = 'success';
        uiIcon = '✅';
        uiMessage = '데이터 수집 완료!';
      } else if (conclusion === 'failure') {
        uiStatus = 'failed';
        uiIcon = '❌';
        uiMessage = '데이터 수집 실패';
      } else {
        uiStatus = 'cancelled';
        uiIcon = '⚠️';
        uiMessage = `수집 종료 (${conclusion || 'unknown'})`;
      }
    } else {
      uiStatus = 'unknown';
      uiIcon = '❓';
      uiMessage = `상태: ${runStatus}`;
    }

    return res.status(200).json({
      status: uiStatus,
      icon: uiIcon,
      message: uiMessage,
      runStatus,
      conclusion,
      startedAt,
      updatedAt
    });

  } catch (e) {
    return res.status(200).json({
      status: 'error',
      message: `상태 확인 오류: ${e.message}`
    });
  }
};
