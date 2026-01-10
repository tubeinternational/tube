const express = require("express");
const router = express.Router();
const db = require("../db");
const fs = require("fs");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const { resolveUploadPath } = require("../utils/paths");

const streamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

router.get("/stream/:id", streamLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `SELECT video_url, storage_type FROM videos WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (!rows.length) return res.sendStatus(404);

    const { video_url, storage_type } = rows[0];
    const range = req.headers.range;

    // ================= LOCAL =================
    if (storage_type === "local") {
      const filePath = resolveUploadPath(video_url);
      if (!filePath || !fs.existsSync(filePath)) return res.sendStatus(404);

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;

      if (!range) {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

      if (start >= fileSize) {
        return res.status(416).send("Requested range not satisfiable");
      }

      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    // ================= CLOUDFLARE =================
    if (storage_type === "cloudflare") {
      const response = await axios({
        url: video_url,
        method: "GET",
        responseType: "stream",
        headers: range ? { Range: range } : {},
      });

      res.writeHead(response.status, response.headers);
      response.data.pipe(res);
      return;
    }

    res.sendStatus(400);
  } catch (err) {
    console.error("[STREAM ERROR]", err);
    res.status(500).json({ error: "Failed to stream video" });
  }
});

module.exports = router;
