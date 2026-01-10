const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { uploadVideoAndThumbnail } = require("../middleware/upload");
const adminController = require("../controllers/admin.controller");

/**
 * ADMIN ROLE CHECK
 */
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}

/**
 * APPLY AUTH + ROLE
 */
router.use(authMiddleware, requireAdmin);

/**
 * ROUTES
 */
router.post("/video", uploadVideoAndThumbnail, adminController.addVideo);
router.get("/videos", adminController.listVideos);
router.put("/video/:id", uploadVideoAndThumbnail, adminController.updateVideo);
router.delete("/video/:id", adminController.deleteVideo);
router.post("/categories", adminController.createCategory);

module.exports = router;
