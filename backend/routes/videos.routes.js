const express = require("express");
const router = express.Router();
const authOptional = require("../middleware/authOptional");
const videosController = require("../controllers/videos.controller");

router.get("/", videosController.getVideos);
router.get("/slug/:slug", videosController.getVideoBySlug);
router.post("/:id/view", videosController.incrementViews);
router.get("/:id/related", videosController.getRelatedVideos);

// SHORTS ROUTE

router.get("/shorts", authOptional, videosController.getShorts);
router.get("/shorts/slug/:slug", authOptional, videosController.getShortBySlug);

// LIKE ROUTE
router.post("/:id/like", authOptional, videosController.likeVideo);

// video categories
router.get("/categories", videosController.listCategories);

module.exports = router;
