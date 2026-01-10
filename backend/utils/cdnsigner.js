// utils/cdnSigner.js
function generateSignedUrl(originalUrl) {
  const expires = Math.floor(Date.now() / 1000) + 300; // 5 min
  return `${originalUrl}?sig=dummy&exp=${expires}`;
}

module.exports = { generateSignedUrl };
