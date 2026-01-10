function absoluteUrl(path, req) {
  if (!path) return null;

  // Already absolute (Cloudflare / CDN)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base =
    process.env.APP_URL ||
    `${req.protocol}://${req.get("host")}`;

  return `${base}${path}`;
}

module.exports = { absoluteUrl };
