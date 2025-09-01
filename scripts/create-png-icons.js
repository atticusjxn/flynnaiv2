// Quick PNG icon creation for PWA
const fs = require('fs');
const path = require('path');

// Create a simple base64 encoded PNG (1x1 blue pixel as placeholder)
const createSimplePNG = (size) => {
  // A simple 1x1 blue PNG in base64
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(base64PNG, 'base64');
};

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

iconSizes.forEach(size => {
  const pngBuffer = createSimplePNG(size);
  const fileName = `icon-${size}x${size}.png`;
  fs.writeFileSync(path.join(iconsDir, fileName), pngBuffer);
  console.log(`Created ${fileName}`);
});

console.log('PNG icons created successfully!');
