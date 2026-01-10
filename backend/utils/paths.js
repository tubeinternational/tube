const path = require("path");

// MUST MATCH multer destination
const UPLOADS_ROOT = "/app/uploads";

const VIDEOS_DIR = path.join(UPLOADS_ROOT, "videos");
const THUMBS_DIR = path.join(UPLOADS_ROOT, "thumbnails");

function resolveUploadPath(publicPath) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return null;

  // /uploads/videos/x.mp4 → /app/uploads/videos/x.mp4
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
