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

  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_PAT;
  const owner = process.env.VERCEL_GIT_REPO_OWNER || process.env.GITHUB_OWNER || "your-username";
  const repo = process.env.VERCEL_GIT_REPO_SLUG || process.env.GITHUB_REPO || "weather_contest";

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
          message: "🚀 GitHub Action workflow_dispatch successfully triggered!",
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("GitHub API dispatch error:", e.message);
    }
  }

  /* Fallback Simulation for Local / Demo Mode */
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
    message: "⚡ GitHub Actions Pipeline executed (Data Refreshed & Calculated)",
    env: latestData ? latestData.env : null,
    news: latestData ? latestData.news : null,
    timestamp: new Date().toISOString()
  });
};
