import { resolveUUID, getSkinURL, getSkin, PlayerNotFoundError, MojangRateLimitError } from '../lib/minecraft.js';

export default async function handler(req, res) {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Missing username parameter' });
    }

    const uuid = await resolveUUID(username);
    const skinURL = await getSkinURL(uuid);

    if (!skinURL) {
      res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
      return res.status(404).json({ error: 'Skin not found' });
    }

    const skinBuffer = await getSkin(skinURL);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('CDN-Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Disposition', `inline; filename="${username}.png"`);
    return res.send(skinBuffer);

  } catch (error) {
    if (error instanceof PlayerNotFoundError) {
      res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
      return res.status(404).json({ error: 'Player not found' });
    }
    if (error instanceof MojangRateLimitError) {
      res.setHeader('Retry-After', '5');
      return res.status(429).json({ error: 'Upstream rate limited, retry shortly' });
    }
    console.error('Skin error:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Upstream error, try again' });
  }
}