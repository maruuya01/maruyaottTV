export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  const upstashHeaders = {
    Authorization: 'Bearer AUgSAAIjcDE3MGE5NjEwY2NiZmE0YTZmYWY2ZjNhODJmNDI5ODliOXAxMA',
  };

  // Validate token
  const result = await fetch(`https://teaching-mongoose-18450.upstash.io/get/${token}`, {
    headers: upstashHeaders,
  }).then(r => r.json()).catch(() => null);

  const expires = parseInt(result?.result);
  if (!expires || Date.now() > expires) {
    return res.status(403).send("Token expired or invalid");
  }

  // Delete token after use
  await fetch(`https://teaching-mongoose-18450.upstash.io/del/${token}`, {
    headers: upstashHeaders,
  });

  // Fetch channel list
  const chRes = await fetch("https://tvphfree.pages.dev/ch.js");
  const chText = await chRes.text();

  // Extract the JSON array from JavaScript assignment
  const jsonMatch = chText.match(/=\s*(\[\s*\{[\s\S]*?\}\s*\]);?/);
  const json = jsonMatch?.[1];

  if (!json) return res.status(500).send("Channel data parse error");

  let channels;
  try {
    channels = JSON.parse(json);
  } catch (err) {
    return res.status(500).send("Invalid JSON in channel list");
  }

  // Build the M3U playlist
  let m3u = "#EXTM3U\n";
  for (const ch of channels) {
    if (!ch.title || !ch.file) continue;
    m3u += `#EXTINF:-1 tvg-logo="${ch.logo || ''}" group-title="TV",${ch.title}\n${ch.file}\n`;
  }

  res.setHeader("Content-Type", "application/x-mpegURL");
  res.setHeader("Cache-Control", "no-cache");
  res.status(200).send(m3u);
}
