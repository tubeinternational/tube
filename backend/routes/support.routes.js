const express = require("express");
const router = express.Router();
const supportController = require("../controllers/support.controller");
const authMiddleware = require("../middleware/auth");

/**
 * ADMIN ROLE CHECK
 * (same pattern as admin.routes.js)
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }

  next();
}

/**
 * PUBLIC ROUTES
 */
router.post("/contact", supportController.contactUs);
router.post("/content-removal", supportController.contentRemovalRequest);

/**
 * ADMIN ROUTES
 */
router.get(
  "/admin/contact-requests",
  authMiddleware,
  requireAdmin,
  supportController.getContactRequests
);

router.get(
  "/admin/content-removal-requests",
  authMiddleware,
  requireAdmin,
  supportController.getContentRemovalRequests
);

router.patch(
  "/admin/content-removal-requests/:id/status",
  authMiddleware,
  requireAdmin,
  supportController.updateContentRemovalStatus
);

module.exports = router;
