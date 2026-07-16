import { resolveUUID, getSkinURL, renderAvatar, PlayerNotFoundError, MojangRateLimitError } from '../lib/minecraft.js';

export default async function handler(req, res) {
  try {
    const { username, size = '512' } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Missing username parameter' });
    }

    const sizeNum = parseInt(size);
    if (isNaN(sizeNum) || sizeNum < 8 || sizeNum > 512) {
      return res.status(400).json({ error: 'Size must be between 8 and 512' });
    }

    const uuid = await resolveUUID(username);
    const skinURL = await getSkinURL(uuid);

    if (!skinURL) {
      res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
      return res.status(404).json({ error: 'Skin not found' });
    }

    const imageBuffer = await renderAvatar(skinURL, sizeNum);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('CDN-Cache-Control', 'public, max-age=86400');
    return res.send(imageBuffer);

  } catch (error) {
    if (error instanceof PlayerNotFoundError) {
      res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
      return res.status(404).json({ error: '404 Error! Player is not exist. It could be a cracked Minecraft names, in which we do not support.' });
    }
    if (error instanceof MojangRateLimitError) {
      res.setHeader('Retry-After', '5');
      return res.status(429).json({ error: '429 Error! You are rate-limited. Please slow down from making any request! Or better yet, Deploy your own!' });
    }
    console.error('Avatar error:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: '502 Error! We got a weird response from the server. That means the server is broken for a while. Please do try again in a moment.' });
  }
}