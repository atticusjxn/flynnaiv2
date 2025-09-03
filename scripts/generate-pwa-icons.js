// Generate PWA icons for Flynn.ai v2
// Creates placeholder icons in required sizes

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for Flynn.ai
const createIcon = (
  size
) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366F1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#gradient)"/>
  <path d="M${size * 0.3} ${size * 0.25}L${size * 0.7} ${size * 0.5}L${size * 0.3} ${size * 0.75}Z" fill="white"/>
  <circle cx="${size * 0.75}" cy="${size * 0.3}" r="${size * 0.08}" fill="white"/>
  <circle cx="${size * 0.75}" cy="${size * 0.7}" r="${size * 0.08}" fill="white"/>
</svg>`;

// Required PWA icon sizes
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate each icon size
iconSizes.forEach((size) => {
  const svgContent = createIcon(size);
  const fileName = `icon-${size}x${size}.png`;

  // For now, save as SVG (in production you'd convert to PNG)
  // This is a placeholder approach for immediate fix
  const svgFileName = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, svgFileName), svgContent);

  console.log(`Generated ${svgFileName}`);
});

// Also create the main icon-144x144.png as SVG for immediate fix
const mainIconContent = createIcon(144);
fs.writeFileSync(path.join(iconsDir, 'icon-144x144.svg'), mainIconContent);

console.log('PWA icons generated successfully!');
