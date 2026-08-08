"use strict";

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const owner = process.env.VERCEL_GIT_REPO_OWNER || process.env.GITHUB_OWNER || "jhjhc1483";
  const repo = process.env.VERCEL_GIT_REPO_SLUG || process.env.GITHUB_REPO || "weather_contest";
  const rawToken = process.env.GITHUB_TOKEN || process.env.GH_PAT;
  const githubToken = rawToken ? rawToken.trim() : null;

  if (!githubToken) {
    return res.status(200).json({
      success: false,
      triggered: false,
      error: "MISSING_GITHUB_TOKEN",
      message: "Vercel Environment Variables에 GITHUB_TOKEN이 설정되지 않았거나 활성화되지 않았습니다. Vercel에서 Redeploy를 실행해 주세요."
    });
  }

  try {
    const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/fetch_weather.yml/dispatches`;
    const response = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${githubToken}`,
        'User-Agent': 'Vercel-Serverless-Function'
      },
      body: JSON.stringify({ ref: 'main' })
    });

    if (response.status === 204 || response.ok) {
      return res.status(200).json({
        success: true,
        triggered: true,
        message: `🚀 GitHub Action (fetch_weather.yml) 트리거 성공! https://github.com/${owner}/${repo}/actions 에서 구동 중입니다.`,
        timestamp: new Date().toISOString()
      });
    } else {
      const errorText = await response.text();
      return res.status(200).json({
        success: false,
        triggered: false,
        status: response.status,
        error: "GITHUB_API_ERROR",
        message: `GitHub API 응답 에러 (HTTP ${response.status}): ${errorText}`,
        details: "토큰의 repo 및 workflow 권한 체크 필요"
      });
    }
  } catch (e) {
    return res.status(200).json({
      success: false,
      triggered: false,
      error: "SERVER_EXCEPTION",
      message: `서버 통신 예외 발생: ${e.message}`
    });
  }
};
