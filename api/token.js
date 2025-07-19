export default async function handler(req, res) {
  const token = Math.random().toString(36).substring(2, 10);

  await fetch(`https://teaching-mongoose-18450.upstash.io/set/${token}/valid`, {
    headers: {
      Authorization: 'Bearer AUgSAAIjcDE3MGE5NjEwY2NiZmE0YTZmYWY2ZjNhODJmNDI5ODliOXAxMA',
    },
  });

  res.status(200).json({ usage: `/api/playlist?token=${token}` });
}
