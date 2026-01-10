function absoluteUrl(path, req) {
  if (!path) return null;

  // Already absolute
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Static uploads stay relative
  if (path.startsWith("/uploads/")) {
    return path;
  }

  // Correct host + port from proxy
  const protocol =
    req.headers["x-forwarded-proto"] || req.protocol;

  const host =
    req.headers["x-forwarded-host"] ||
    req.headers["host"];

  return `${protocol}://${host}${path}`;
}

module.exports = { absoluteUrl };
