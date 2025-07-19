// /pages/api/live.js

export default async function handler(req, res) {
  const chRes = await fetch("https://maruyaott-tv.vercel.app/ch.js");
  const chText = await chRes.text();
  const jsonMatch = chText.match(/=\s*(\[\s*\{[\s\S]*?\}\s*\]);?/);
  const json = jsonMatch?.[1];

  if (!json) return res.status(500).send("Channel data parse error");

  let channels;
  try {
    channels = JSON.parse(json);
  } catch (err) {
    return res.status(500).send("Invalid JSON");
  }

  const epgUrl = "https://iptv-org.github.io/epg/guides/ph.xml";
  let m3u = `#EXTM3U x-tvg-url=\"${epgUrl}\"\n`;

  for (const ch of channels) {
    if (!ch.title || !ch.file) continue;
    const tvgId = ch.tvg_id || ch.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    m3u += `#EXTINF:-1 tvg-id=\"${tvgId}\" tvg-name=\"${ch.title}\" tvg-logo=\"${ch.logo || ''}\" group-title=\"TV\",${ch.title}\n${ch.file}\n`;
  }

  res.setHeader("Content-Type", "application/x-mpegURL");
  res.setHeader("Cache-Control", "no-cache");
  res.status(200).send(m3u);
}
