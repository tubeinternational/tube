const path = require("path");

/**
 * __dirname => backend/utils
 * project root => two levels up
 */
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const UPLOADS_DIR = path.join(PROJECT_ROOT, "uploads");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");
const THUMBS_DIR = path.join(UPLOADS_DIR, "thumbnails");

function resolveUploadPath(publicPath) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return null;

  // Remove leading slash for Windows compatibility
  const relativePath = publicPath.replace(/^\/+/, "");
  return path.join(PROJECT_ROOT, relativePath);
}

module.exports = {
  PROJECT_ROOT,
  UPLOADS_DIR,
  VIDEOS_DIR,
  THUMBS_DIR,
  resolveUploadPath,
};
