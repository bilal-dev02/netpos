const fs = require('fs');
const path = require('path');

// Copy public and .next/static to standalone folder
const standalonePath = path.join(__dirname, '..', '.next', 'standalone');
const publicPath = path.join(__dirname, '..', 'public');
const staticPath = path.join(__dirname, '..', '.next', 'static');

console.log('Copying public folder to standalone...');
copyDir(publicPath, path.join(standalonePath, 'public'));

console.log('Copying .next/static to standalone...');
const standaloneStaticPath = path.join(standalonePath, '.next', 'static');
if (!fs.existsSync(path.dirname(standaloneStaticPath))) {
  fs.mkdirSync(path.dirname(standaloneStaticPath), { recursive: true });
}
copyDir(staticPath, standaloneStaticPath);

console.log('Post-build complete!');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source not found: ${src}`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
