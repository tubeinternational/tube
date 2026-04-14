const path = require("path");

// Dynamically resolve to root uploads directory
// Works in both Docker (/app/uploads mounted to root/uploads) and local dev
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

const VIDEOS_DIR = path.join(UPLOADS_ROOT, "videos");
const THUMBS_DIR = path.join(UPLOADS_ROOT, "thumbnails");

function resolveUploadPath(publicPath) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return null;

  // /uploads/videos/x.mp4 → /path/to/root/uploads/videos/x.mp4
  return path.join(
    UPLOADS_ROOT,
    publicPath.replace("/uploads/", "")
  );
}

module.exports = {
  UPLOADS_ROOT,
  VIDEOS_DIR,
  THUMBS_DIR,
  resolveUploadPath,
};
