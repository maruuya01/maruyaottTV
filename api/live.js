// /pages/api/live.js

export default async function handler(req, res) {
  try {
    const chRes = await fetch("https://maruyaott-tv.vercel.app/ch.js");
    const chText = await chRes.text();

    let channels;
    try {
      if (chText.trim().startsWith("[")) {
        channels = JSON.parse(chText);
      } else {
        const match = chText.match(/=\s*(\[\s*\{[\s\S]*?\}\s*\]);?/);
        const json = match?.[1];
        if (!json) throw new Error("No array match");
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
    res.status(200).send(m3u);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
}
