const multer = require("multer");
const path = require("path");
const fs = require("fs");

// absolute uploads root (outside backend)
const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    if (file.fieldname === "video") {
      uploadPath = path.join(UPLOADS_ROOT, "videos");
    } else if (file.fieldname === "thumbnail") {
      uploadPath = path.join(UPLOADS_ROOT, "thumbnails");
    }

    ensureDir(uploadPath);
    cb(null, uploadPath);
  },

  filename: (_, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    );
  },
});

module.exports = {
  uploadVideoAndThumbnail: multer({ storage }).fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
};
