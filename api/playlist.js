// /pages/api/playlist.js

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  const result = await fetch(`https://teaching-mongoose-18450.upstash.io/get/${token}`, {
    headers: {
      Authorization: 'Bearer AUgSAAIjcDE3MGE5NjEwY2NiZmE0YTZmYWY2ZjNhODJmNDI5ODliOXAxMA',
    },
  }).then(res => res.json());

  const expires = parseInt(result.result);
  if (!expires || Date.now() > expires) {
    return res.status(403).send("Token expired or invalid");
  }

  // One-time token usage
  await fetch(`https://teaching-mongoose-18450.upstash.io/del/${token}`, {
    headers: {
      Authorization: 'Bearer AUgSAAIjcDE3MGE5NjEwY2NiZmE0YTZmYWY2ZjNhODJmNDI5ODliOXAxMA',
    },
  });

  const chRes = await fetch("https://tvphfree.pages.dev/ch.js");
  const chText = await chRes.text();
  const json = chText.match(/\[\s*\{[\s\S]*\}\s*\]/)?.[0];

  if (!json) return res.status(500).send("Channel data parse error");

  const channels = JSON.parse(json);
  let m3u = "#EXTM3U\n";
  for (const ch of channels) {
    m3u += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="TV",${ch.title}\n${ch.file}\n`;
  }

  res.setHeader("Content-Type", "application/x-mpegURL");
  res.send(m3u);
}
