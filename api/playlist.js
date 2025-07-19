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

  if (!result || result.result !== "valid") {
    return res.status(403).send("Token invalid");
  }

  // One-time delete
  await fetch(`https://teaching-mongoose-18450.upstash.io/del/${token}`, {
    headers: upstashHeaders,
  });

  // Fetch channel file
  const chRes = await fetch("https://maruyaott-tv.vercel.app/ch.js");
  const chText = await chRes.text();

  // Attempt JSON parse directly, fallback to regex match
  let channels;
  try {
    if (chText.trim().startsWith("[")) {
      // pure JSON file
      channels = JSON.parse(chText);
    } else {
      // assume js assignment
      const match = chText.match(/=\s*(\[\s*\{[\s\S]*?\}\s*\]);?/);
      const json = match?.[1];
      if (!json) throw new Error("Invalid format");
      channels = JSON.parse(json);
    }
  } catch (err) {
    return res.status(500).send("Channel data parse error");
  }

  const epgUrl = "https://iptv-org.github.io/epg/guides/ph.xml";
  let m3u = `#EXTM3U x-tvg-url="${epgUrl}"\n`;

  for (const ch of channels) {
    if (!ch.title || !ch.file) continue;
    const tvgId = ch.tvg_id || ch.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    m3u += `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${ch.title}" tvg-logo="${ch.logo || ''}" group-title="TV",${ch.title}\n${ch.file}\n`;
  }

  res.setHeader("Content-Type", "application/x-mpegURL");
  res.setHeader("Cache-Control", "no-cache");
  res.status(200).send(m3u);
}
