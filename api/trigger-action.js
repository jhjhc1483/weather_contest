"use strict";

const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Explicitly bound to user repository: jhjhc1483 / weather_contest
  const owner = process.env.VERCEL_GIT_REPO_OWNER || process.env.GITHUB_OWNER || "jhjhc1483";
  const repo = process.env.VERCEL_GIT_REPO_SLUG || process.env.GITHUB_REPO || "weather_contest";
  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_PAT;

  console.log(`Triggering GitHub Actions for repo: ${owner}/${repo}`);

  if (githubToken) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/fetch_weather.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${githubToken}`,
          'User-Agent': 'Vercel-Serverless-Function'
        },
        body: JSON.stringify({ ref: 'main' })
      });

      if (response.ok || response.status === 204) {
        return res.status(200).json({
          success: true,
          triggered: true,
          message: `🚀 GitHub Action workflow_dispatch successfully triggered on https://github.com/${owner}/${repo}/actions!`,
          timestamp: new Date().toISOString()
        });
      } else {
        const errorText = await response.text();
        console.error("GitHub API Response Not OK:", response.status, errorText);
      }
    } catch (e) {
      console.error("GitHub API dispatch error:", e.message);
    }
  }

  /* Local / Client Fallback Response when Token is not yet present */
  let latestData = null;
  try {
    const dataPath = path.join(process.cwd(), 'data', 'latest_weather.json');
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      latestData = JSON.parse(rawData);
    }
  } catch (e) {
    console.error("Local file read fallback error:", e.message);
  }

  return res.status(200).json({
    success: true,
    triggered: false,
    reason: "GITHUB_TOKEN_REQUIRED",
    message: `⚡ Calculated using latest parsed dataset. (To run live Actions on GitHub, please set GITHUB_TOKEN in Vercel Environment Variables)`,
    env: latestData ? latestData.env : null,
    news: latestData ? latestData.news : null,
    timestamp: new Date().toISOString()
  });
};
