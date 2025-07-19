// /pages/api/playlist.js
import fetch from 'node-fetch';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  const result = await fetch(`${UPSTASH_URL}/get/${token}`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
  }).then(res => res.json());

  const expires = parseInt(result.result);
  if (!expires || Date.now() > expires) {
    return res.status(403).send("Token expired or invalid");
  }

  // Delete token after use
  await fetch(`${UPSTASH_URL}/del/${token}`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
  });

  // Fetch live channel list
  const chRes = await fetch("https://tvphfree.pages.dev/ch.js");
  const chText = await chRes.text();
  const json = chText.match(/\[\s*\{[\s\S]*\}\s*\]/)[0];
  const channels = JSON.parse(json);

  let m3u = "#EXTM3U\n";
  for (const ch of channels) {
    m3u += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="TV",${ch.title}\n${ch.file}\n`;
  }

  res.setHeader("Content-Type", "application/x-mpegURL");
  res.send(m3u);
}
