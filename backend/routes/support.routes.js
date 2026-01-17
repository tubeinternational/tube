const express = require("express");
const router = express.Router();
const supportController = require("../controllers/support.controller");

router.post("/contact", supportController.contactUs);
router.post("/content-removal", supportController.contentRemovalRequest);

module.exports = router;
