const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Dynamically resolve uploads directory
// Works in both Docker (/app/uploads mounted to root/uploads) and local dev
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

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
    } else if (file.fieldname === "category_image") {
      uploadPath = path.join(UPLOADS_ROOT, "category");
    } else {
      return cb(new Error("Invalid field name"));
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

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB (shared)
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "video") {
      if (!file.mimetype.startsWith("video/")) {
        return cb(new Error("Only video files allowed"), false);
      }
    }

    if (
      file.fieldname === "thumbnail" ||
      file.fieldname === "category_image"
    ) {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files allowed"), false);
      }
    }

    cb(null, true);
  },
});

const uploadVideoAndThumbnail = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

const uploadCategoryImage = upload.single("category_image");

module.exports = {
  uploadVideoAndThumbnail,
  uploadCategoryImage,
};
