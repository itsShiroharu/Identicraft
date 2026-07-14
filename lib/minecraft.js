import { createCanvas, loadImage } from '@napi-rs/canvas';

const MOJANG_API = 'https://api.mojang.com';
const SESSION_API = 'https://sessionserver.mojang.com';
function isUUID(str) {return /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(str);}

export class PlayerNotFoundError extends Error {
  constructor(usernameOrUUID) {
    super(`Player not found: ${usernameOrUUID}`);
    this.name = 'PlayerNotFoundError';
  }
}

export class MojangRateLimitError extends Error {
  constructor() {
    super('Rate limited by Mojang API');
    this.name = 'MojangRateLimitError';
  }
}

const uuidCache = new Map();
const TTL_HIT = 10 * 60 * 1000;
const TTL_MISS = 5 * 60 * 1000;

function getCached(map, key) {
  const entry = map.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    map.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCached(map, key, value, ttl) {
  map.set(key, { value, expires: Date.now() + ttl });
}

export async function resolveUUID(usernameOrUUID) {
  if (isUUID(usernameOrUUID)) {
    return usernameOrUUID.replace(/-/g, '');
  }

  const key = usernameOrUUID.toLowerCase();
  const cached = getCached(uuidCache, key);
  if (cached !== undefined) {
    if (cached === null) throw new PlayerNotFoundError(usernameOrUUID);
    return cached;
  }

  const res = await fetch(`${MOJANG_API}/users/profiles/minecraft/${usernameOrUUID}`);

  if (res.status === 404) {
    setCached(uuidCache, key, null, TTL_MISS);
    throw new PlayerNotFoundError(usernameOrUUID);
  }
  if (res.status === 429) {
    throw new MojangRateLimitError();
  }
  if (!res.ok) {
    throw new Error(`Mojang API error: ${res.status}`);
  }

  const data = await res.json();
  setCached(uuidCache, key, data.id, TTL_HIT);
  return data.id;
}

export async function getSkinURL(uuid) {
  const res = await fetch(`${SESSION_API}/session/minecraft/profile/${uuid}`);

  if (res.status === 404) {
    throw new PlayerNotFoundError(uuid);
  }
  if (res.status === 429) {
    throw new MojangRateLimitError();
  }
  if (!res.ok) {
    throw new Error(`Session API error: ${res.status}`);
  }

  const profile = await res.json();
  const textureProperty = profile.properties.find(p => p.name === 'textures');
  if (!textureProperty) return null;

  const textures = JSON.parse(Buffer.from(textureProperty.value, 'base64').toString());
  return textures.textures.SKIN?.url || null;
}

export async function renderAvatar(skinURL, size) {
  const skin = await loadImage(skinURL);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(skin, 8, 8, 8, 8, 0, 0, size, size);
  ctx.drawImage(skin, 40, 8, 8, 8, 0, 0, size, size);
  
  return canvas.toBuffer('image/png');
}

export async function renderCube(skinURL, size) {
  const skin = await loadImage(skinURL);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;

  const S = size * 0.45;
  const cx = size / 2;
  const cy = size * 0.5;

  function iso(x, y, z) {
    return {
      x: cx + (x - z) * S * Math.sqrt(3) / 2,
      y: cy + (x + z) * S * 0.5 - y * S
    };
  }

  function drawFace(srcX, srcY, points) {
    const EPS = 0.6;
    const cx = (points[0].x + points[1].x + points[2].x + points[3].x) / 4;
    const cy = (points[0].y + points[1].y + points[2].y + points[3].y) / 4;
    const p = points.map(pt => {
      const dx = pt.x - cx;
      const dy = pt.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      return {
        x: pt.x + (dx / len) * EPS,
        y: pt.y + (dy / len) * EPS
      };
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(p[i].x, p[i].y);
    ctx.closePath();
    ctx.clip();

    const dx1 = p[1].x - p[0].x;
    const dy1 = p[1].y - p[0].y;
    const dx2 = p[3].x - p[0].x;
    const dy2 = p[3].y - p[0].y;

    ctx.transform(dx1, dy1, dx2, dy2, p[0].x, p[0].y);
    ctx.drawImage(skin, srcX, srcY, 8, 8, 0, 0, 1, 1);
    ctx.restore();
  }

  const v000 = iso(0, 0, 0);
  const v100 = iso(1, 0, 0);
  const v110 = iso(1, 1, 0);
  const v010 = iso(0, 1, 0);

  const v001 = iso(0, 0, 1);
  const v101 = iso(1, 0, 1);
  const v111 = iso(1, 1, 1);
  const v011 = iso(0, 1, 1);

  drawFace(0, 8, [v011, v111, v101, v001]);
  drawFace(8, 8, [v110, v111, v101, v100]);
  drawFace(8, 0, [v011, v010, v110, v111]);

  return canvas.toBuffer('image/png');
}

export async function renderBody(skinURL, size) {
  const skin = await loadImage(skinURL);
  const bodyWidth = size;
  const bodyHeight = size * 2;
  const canvas = createCanvas(bodyWidth, bodyHeight);
  const ctx = canvas.getContext('2d');
  
  ctx.imageSmoothingEnabled = false;
  
  const scale = size / 16;
  
  ctx.drawImage(skin, 8, 8, 8, 8, 4 * scale, 0, 8 * scale, 8 * scale);
  ctx.drawImage(skin, 40, 8, 8, 8, 4 * scale, 0, 8 * scale, 8 * scale);
  
  ctx.drawImage(skin, 20, 20, 8, 12, 4 * scale, 8 * scale, 8 * scale, 12 * scale);
  ctx.drawImage(skin, 20, 36, 8, 12, 4 * scale, 8 * scale, 8 * scale, 12 * scale);
  
  ctx.drawImage(skin, 44, 20, 4, 12, 0, 8 * scale, 4 * scale, 12 * scale);
  ctx.drawImage(skin, 44, 36, 4, 12, 0, 8 * scale, 4 * scale, 12 * scale);
  
  ctx.drawImage(skin, 36, 52, 4, 12, 12 * scale, 8 * scale, 4 * scale, 12 * scale);
  ctx.drawImage(skin, 52, 52, 4, 12, 12 * scale, 8 * scale, 4 * scale, 12 * scale);
  
  ctx.drawImage(skin, 4, 20, 4, 12, 4 * scale, 20 * scale, 4 * scale, 12 * scale);
  ctx.drawImage(skin, 4, 36, 4, 12, 4 * scale, 20 * scale, 4 * scale, 12 * scale);
  
  ctx.drawImage(skin, 20, 52, 4, 12, 8 * scale, 20 * scale, 4 * scale, 12 * scale);
  ctx.drawImage(skin, 4, 52, 4, 12, 8 * scale, 20 * scale, 4 * scale, 12 * scale);
  
  return canvas.toBuffer('image/png');
}

export async function renderBust(skinURL, size) {
  const skin = await loadImage(skinURL);
  const bustWidth = size;
  const bustHeight = size * 1.25;
  const canvas = createCanvas(bustWidth, bustHeight);
  const ctx = canvas.getContext('2d');
  
  ctx.imageSmoothingEnabled = false;
  
  const scale = size / 16;
  
  ctx.drawImage(skin, 8, 8, 8, 8, 4 * scale, 0, 8 * scale, 8 * scale);
  ctx.drawImage(skin, 40, 8, 8, 8, 4 * scale, 0, 8 * scale, 8 * scale);
  
  ctx.drawImage(skin, 20, 20, 8, 12, 4 * scale, 8 * scale, 8 * scale, 12 * scale);
  ctx.drawImage(skin, 20, 36, 8, 12, 4 * scale, 8 * scale, 8 * scale, 12 * scale);
  
  ctx.drawImage(skin, 44, 20, 4, 12, 0, 8 * scale, 4 * scale, 12 * scale);
  ctx.drawImage(skin, 44, 36, 4, 12, 0, 8 * scale, 4 * scale, 12 * scale);
  
  ctx.drawImage(skin, 36, 52, 4, 12, 12 * scale, 8 * scale, 4 * scale, 12 * scale);
  ctx.drawImage(skin, 52, 52, 4, 12, 12 * scale, 8 * scale, 4 * scale, 12 * scale);
  
  return canvas.toBuffer('image/png');
}

export async function getSkin(skinURL) {
  const res = await fetch(skinURL);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer);
}