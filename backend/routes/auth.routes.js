const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/log-in", authController.login);
router.post("/signin", authController.signin);
router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.get("/me", authController.me);

module.exports = router;
