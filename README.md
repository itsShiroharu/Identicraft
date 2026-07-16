## Notes for Users and Developer before using this tool

**This tool supports Premium/Paid Minecraft names (the one you buy from Microsoft). This tool does not support cracked names! I repeat, This tool does not support cracked names! That means, if your Minecraft names is from TLauncher, Ely.by, SKLauncher, or other cracked launcher, and the name isn't exist on Microsoft Database, this tool cannot render your skin, avatar, or anything else. Is that simple.**

If you wish to add the support for cracked (stubborn aren't you?), a [Fork](https://github.com/itsShiroharu/Identicraft/fork) will always be welcome, and publish it yourself for this purpose.

# Identicraft

A Minecraft avatar rendering library, CLI, and serverless API.

## Features
1. 🎨 Custom rendering using @napi-rs/canvas
2. ⚡ Serverless deployment on Vercel
3. 🔄 Automatic UUID resolution from usernames
4. 💾 Built-in caching
5. 🖼️ Multiple rendering modes
6. 🖥️ CLI tool for local rendering

## API Endpoints

### 1. Avatar (2D Head)
```
GET /avatar/{username_or_uuid}/{size}.png
GET /avatar/{username_or_uuid}  # Defaults to 512px
```
Returns a 2D front-facing avatar head with overlay (hat layer).

**Example:** 
- `/avatar/itsShiroharu/256.png`
- `/avatar/itsShiroharu` (returns 512px)

### 2. Cube (3D Isometric Head)
```
GET /cube/{username_or_uuid}/{size}.png
GET /cube/{username_or_uuid}  # Defaults to 512px
```
Returns a 3D isometric view of the player's head.

**Example:** 
- `/cube/itsShiroharu/256.png`
- `/cube/itsShiroharu` (returns 512px)

### 3. Full Body
```
GET /body/{username_or_uuid}/{size}.png
GET /body/{username_or_uuid}  # Defaults to 512px
```
Returns a full-body render (head, torso, arms, legs).

**Example:** 
- `/body/itsShiroharu/256.png`
- `/body/itsShiroharu` (returns 512px)

### 4. Bust (Half Body)
```
GET /bust/{username_or_uuid}/{size}.png
GET /bust/{username_or_uuid}  # Defaults to 512px
```
Returns a bust render (head, torso, arms).

**Example:** 
- `/bust/itsShiroharu/256.png`
- `/bust/itsShiroharu` (returns 512px)

### 5. Skin (Raw Texture)
```
GET /skin/{username_or_uuid}
```
Returns the raw Minecraft skin texture.

**Example:** `/skin/itsShiroharu/itsShiroharu.png`

## Size Constraints

- Minimum: 8px
- Maximum: 512px
- Recommended: 64px, 128px, or 256px

## Installation

1. Download or Fork the repository
2. Install dependencies:
```bash
npm install
```

3. **For API:** Run locally:
```bash
npm start
```
This will start the dev server at `http://localhost:3000`

4. **For CLI:** Link globally (recommended):
```bash
npm link
```
Now you can use `identicraft` or `idc` commands globally!

**OR** run directly with npm (pass arguments after `--`):
```bash
npm run cli -- cube itsShiroharu -o shiroharu-cube.png
```

Test the CLI:
```bash
npm run cli:test
```

5. Deploy to Vercel:
```bash
npm run deploy
```

## Usage

### 🌐 Web API

Once deployed to `yourdomain.vercel.app`:

- `yourdomain.vercel.app/avatar/itsShiroharu/256.png`
- `yourdomain.vercel.app/cube/itsShiroharu/256.png`
- `yourdomain.vercel.app/body/itsShiroharu/256.png`
- `yourdomain.vercel.app/bust/itsShiroharu/256.png`
- `yourdomain.vercel.app/skin/itsShiroharu`

### 🖥️ CLI Tool

After running `npm link`, use the CLI:

```bash
# Long form
identicraft cube YOUR_USERNAME -output ANY_FILENAME_YOU_WANT.png

# Short form
idc cube YOUR_USERNAME -o ANY_FILENAME_YOU_WANT.png

# With custom size
idc avatar itsShiroharu -o shiroharu_face.png -s 256

# Full body render
idc body itsShiroharu -o shiroharu_body.png

# Get raw skin
idc skin itsShiroharu -o shiroharu_skin.png
```

**CLI Options:**
- `-o, --output <file>` - Output file path (default: output.png)
- `-s, --size <size>` - Size in pixels 8-512 (default: 512)
- `-h, --help` - Display help
- `-V, --version` - Display version

**Render Types:**
- `avatar` - 2D head (front-facing)
- `cube` - 3D isometric head
- `body` - Full body render
- `bust` - Half body (torso + head)
- `skin` - Raw skin texture

### 📦 NPM Library (Programmatic Usage)

Install in your project:
```bash
npm install identicraft
```

**ES6 Imports (Recommended):**
```javascript
import Identicraft from 'identicraft';
import { writeFileSync } from 'fs';

// Render avatar
const avatar = await Identicraft.renderAvatar('itsShiroharu', 256);
writeFileSync('shiroharu-avatar.png', avatar);

// Render cube
const cube = await Identicraft.renderCube('itsShiroharu', 128);
writeFileSync('shiroharu-cube.png', cube);

// Render body
const body = await Identicraft.renderBody('itsShiroharu', 256);
writeFileSync('shiroharu-body.png', body);

// Render bust
const bust = await Identicraft.renderBust('itsShiroharu', 128);
writeFileSync('shiroharu-bust.png', bust);

// Get raw skin
const skin = await Identicraft.getSkin('itsShiroharu');
writeFileSync('shiroharu-skin.png', skin);

// Universal render method
const image = await Identicraft.render('cube', 'itsShiroharu', 256);
writeFileSync('shiroharu-cube.png', image);

// Resolve UUID
const uuid = await Identicraft.resolveUUID('itsShiroharu');
console.log(uuid); // 4648016c70bc4c7dba73523ad5a30802

// Get skin URL
const skinURL = await Identicraft.getSkinURL(uuid);
console.log(skinURL);
```

**CommonJS (require):**
```javascript
const Identicraft = require('identicraft').default;
const { writeFileSync } = require('fs');

(async () => {
  const avatar = await Identicraft.renderAvatar('itsShiroharu', 256);
  writeFileSync('itsShiroharu.png', avatar);
})();
```

**Named Imports:**
```javascript
import { renderAvatar, renderCube, resolveUUID } from 'identicraft';

const uuid = await resolveUUID('itsShiroharu');
const avatar = await renderAvatar('itsShiroharu', 128);
const cube = await renderCube('itsShiroharu', 256);
```

**API Reference:**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `renderAvatar(username, size?)` | username: string, size: number | Promise\<Buffer\> | Render 2D avatar head |
| `renderCube(username, size?)` | username: string, size: number | Promise\<Buffer\> | Render 3D isometric head |
| `renderBody(username, size?)` | username: string, size: number | Promise\<Buffer\> | Render full body |
| `renderBust(username, size?)` | username: string, size: number | Promise\<Buffer\> | Render half body |
| `getSkin(username)` | username: string | Promise\<Buffer\> | Get raw skin texture |
| `render(type, username, size?)` | type: string, username: string, size: number | Promise\<Buffer\> | Universal render method |
| `resolveUUID(username)` | username: string | Promise\<string\> | Convert username to UUID |
| `getSkinURL(uuid)` | uuid: string | Promise\<string\> | Get skin texture URL |

## How It Works

1. **UUID Resolution**: Converts username to UUID using Mojang's API
2. **Skin Fetching**: Retrieves skin texture from Mojang's session servers
3. **Image Rendering**: Uses @napi-rs/canvas to render different views
4. **Caching**: Implements aggressive caching for performance

## Caching Strategy

- **Browser Cache**: 1 hour (`max-age=3600`)
- **CDN Cache**: 24 hours (`CDN-Cache-Control: max-age=86400`)
- Reduces load on Mojang's API
- Improves response times significantly

## Error Handling

The API returns proper HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid parameters)
- `404`: Player or skin not found
- `500`: Internal server error

## Environment Variables

No environment variables required! The API works out of the box.

## Rate Limits

Respects Mojang's API rate limits. Consider implementing your own rate limiting for production use.

## Credits

Many Thanks for making this project possible.

- [![canvas](https://img.shields.io/badge/CANVAS-for_image_rendering-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://github.com/Brooooooklyn/canvas)
- [![commander.js](https://img.shields.io/badge/COMMANDER.js-for_cli_tool-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://github.com/tj/commander.js)
- [![js.org](https://img.shields.io/badge/JS.ORG-for_Custom_Domain_Branding-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://github.com/js-org/js.org)
- [![npm](https://img.shields.io/badge/NPM-for_package_distribution-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/identicraft)
- [![mojang_api](https://img.shields.io/badge/MOJANG_API-for_player_data-%23CB3837.svg?style=for-the-badge&logo=mojang&logoColor=white)](https://api.mojang.com)
- [![vercel](https://img.shields.io/badge/VERCEL-for_serverless_hosting-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
