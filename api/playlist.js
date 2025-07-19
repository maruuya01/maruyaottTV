export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  // Validate token
  const tokenRes = await fetch(`https://teaching-mongoose-18450.upstash.io/get/${token}`, {
    headers: {
      Authorization: 'Bearer AUgSAAIjcDE3MGE5NjEwY2NiZmE0YTZmYWY2ZjNhODJmNDI5ODliOXAxMA',
    },
  });

  const tokenData = await tokenRes.json();
  const expires = parseInt(tokenData.result);
  if (!expires || Date.now() > expires) {
    return res.status(403).send("Token expired or invalid");
  }

  // Invalidate token
  await fetch(`https://teaching-mongoose-18450.upstash.io/del/${token}`, {
    headers: {
      Authorization: 'Bearer AUgSAAIjcDE3MGE5NjEwY2NiZmE0YTZmYWY2ZjNhODJmNDI5ODliOXAxMA',
    },
  });

  // Get channel list
  const chRes = await fetch("https://tvphfree.pages.dev/ch.js");
  const chText = await chRes.text();
  const jsonStr = chText.match(/\[\s*\{[\s\S]*?\}\s*\]/)?.[0];

  if (!jsonStr) return res.status(500).send("Channel data parse error");

  const channels = JSON.parse(jsonStr);

  // Build M3U playlist
  let m3u = "#EXTM3U\n";
  for (const ch of channels) {
    m3u += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="TV",${ch.title}\n${ch.file}\n`;
  }

  // Respond with raw M3U
  res.setHeader("Content-Type", "application/x-mpegURL");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(m3u);
}
