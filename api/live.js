export default async function handler(req, res) {
  const chUrl = "https://maruyaott-tv.vercel.app/ch.js";

  try {
    const chText = await fetch(chUrl).then(r => r.text());
    const match = chText.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (!match) return res.status(500).send("Channel data parse error");

    const channels = JSON.parse(match[0]);

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
  } catch (e) {
    res.status(500).send("Failed to load channel list");
  }
}
