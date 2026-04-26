// backend/routes/ads.routes.js

const express = require("express");
const router = express.Router();
const adsController = require("../controllers/ads.controller");

// =========================
// CREATE
// =========================
router.post("/", adsController.createAd);

// =========================
// LIST (with filters)
// =========================
router.get("/", adsController.getAds);

// =========================
// GET BY ID
// =========================
router.get("/:id", adsController.getAdById);

// =========================
// UPDATE
// =========================
router.put("/:id", adsController.updateAd);

// =========================
// DELETE
// =========================
router.delete("/:id", adsController.deleteAd);

// =========================
// TOGGLE ACTIVE
// =========================
router.patch("/:id/toggle", adsController.toggleAdStatus);

module.exports = router;
