const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (src.endsWith('FormDataType.tsx')) {
    console.log(`Skipping adapted component: ${src}`);
    return;
  }

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  }
}

try {
  const baseDir = path.resolve(__dirname, '..');
  const srcComponents = path.join(baseDir, 'rust-old', 'src', 'components');
  const destComponents = path.join(baseDir, 'frontend', 'src', 'components');
  const srcAssets = path.join(baseDir, 'rust-old', 'src', 'assets');
  const destAssets = path.join(baseDir, 'frontend', 'src', 'assets');

  console.log('Copying components...');
  copyRecursiveSync(srcComponents, destComponents);

  console.log('Copying assets...');
  copyRecursiveSync(srcAssets, destAssets);

  console.log('Finished copying successfully.');
} catch (err) {
  console.error('Error during copying:', err);
  process.exit(1);
}
