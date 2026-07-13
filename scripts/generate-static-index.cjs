const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), '.output', 'public');
const assetsDir = path.join(publicDir, 'assets');

if (!fs.existsSync(publicDir)) {
  console.error('.output/public not found — run build first');
  process.exit(1);
}

let jsFile = '';
let cssFile = '';
try {
  const files = fs.readdirSync(assetsDir);
  jsFile = files.find((f) => f.endsWith('.js')) || '';
  cssFile = files.find((f) => f.endsWith('.css')) || '';
} catch (e) {
  console.error('Could not read assets directory', e);
}

const cssLink = cssFile ? `<link rel="stylesheet" href="./assets/${cssFile}">` : '';
const scriptTag = jsFile ? `<script type="module" src="./assets/${jsFile}" defer></script>` : '';

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Daily Plan</title>
  ${cssLink}
</head>
<body>
  <div id="root"></div>
  ${scriptTag}
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), html, 'utf8');
console.log('Wrote', path.join(publicDir, 'index.html'));