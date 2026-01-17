const db = require("../db");
const fs = require("fs");
const path = require("path");
const { resolveUploadPath } = require("../utils/paths");
const { absoluteUrl } = require("../utils/url");

const VALID_STORAGE = ["local", "cloudflare"];
const VALID_VIDEO_TYPES = ["normal", "short"];

/**
 * =========================
 * HELPERS
 * =========================
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * =========================
 * ADD VIDEO
 * =========================
 */
exports.addVideo = async (req, res) => {
  try {
    const {
      title,
      description = "",
      category = null,
      country,
      storage_type,
      video_type = "normal",
      video_url,
      meta_title,
      meta_description,
      focus_keywords,
    } = req.body;

    const videoFile = req.files?.video?.[0];
    const thumbFile = req.files?.thumbnail?.[0];

    // =========================
    // BASIC VALIDATION
    // =========================
    if (!title || !storage_type || !thumbFile) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!VALID_STORAGE.includes(storage_type)) {
      return res.status(400).json({ error: "Invalid storage_type" });
    }

    if (!VALID_VIDEO_TYPES.includes(video_type)) {
      return res.status(400).json({ error: "Invalid video_type" });
    }

    const slug = generateSlug(title);

    const keywordsArray = focus_keywords
      ? focus_keywords.split(",").map((k) => k.trim())
      : [];

    // =========================
    // LOCAL VIDEO UPLOAD
    // =========================
    if (storage_type === "local") {
      if (!videoFile) {
        return res.status(400).json({ error: "Video file required" });
      }

      await db.query(
        `
        INSERT INTO videos (
          title,
          description,
          category,
          country,
          video_type,
          video_url,
          thumbnail_url,
          storage_type,
          slug,
          meta_title,
          meta_description,
          focus_keywords
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,'local',$8,$9,$10,$11
        )
        `,
        [
          title, // $1
          description, // $2
          category, // $3
          country, // $4
          video_type, // $5
          `/uploads/videos/${videoFile.filename}`, // $6
          `/uploads/thumbnails/${thumbFile.filename}`, // $7
          slug, // $8
          meta_title || title, // $9
          meta_description || description, // $10
          keywordsArray, // $11
        ]
      );
    }

    // =========================
    // CLOUDFLARE VIDEO
    // =========================
    if (storage_type === "cloudflare") {
      if (!video_url || !video_url.startsWith("http")) {
        return res
          .status(400)
          .json({ error: "Valid external MP4 URL required" });
      }

      await db.query(
        `
        INSERT INTO videos (
          title,
          description,
          category,
          country,
          video_type,
          video_url,
          thumbnail_url,
          storage_type,
          slug,
          meta_title,
          meta_description,
          focus_keywords
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,'cloudflare',$8,$9,$10,$11
        )
        `,
        [
          title, // $1
          description, // $2
          category, // $3
          country, // $4
          video_type, // $5
          video_url, // $6
          `/uploads/thumbnails/${thumbFile.filename}`, // $7
          slug, // $8
          meta_title || title, // $9
          meta_description || description, // $10
          keywordsArray, // $11
        ]
      );
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Upload error:", err.message, err);
    return res.status(500).json({
      error: err.message || "Upload failed",
    });
  }
};

/**
 * =========================
 * LIST VIDEOS (ADMIN)
 * =========================
 */
exports.listVideos = async (req, res) => {
  try {
    const page = Math.max(+req.query.page || 1, 1);
    const limit = Math.min(+req.query.limit || 20, 50);
    const offset = (page - 1) * limit;
    const q = req.query.q?.trim();

    const params = [];
    let where = `WHERE 1=1`;

    if (q) {
      params.push(`%${q}%`);
      where += ` AND title ILIKE $1`;
    }

    params.push(limit, offset);

    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const { rows } = await db.query(
      `
      SELECT
        id,
        title,
        slug,
        description,
        video_type,
        thumbnail_url,
        video_url,
        storage_type,
        views,
        category,
        meta_title,
        meta_description,
        focus_keywords,
        is_active,
        created_at
      FROM videos
      ${where}
      ORDER BY created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      params
    );

    res.json({
      results: rows.map((v) => ({
        ...v,
        thumbnail_url: absoluteUrl(v.thumbnail_url, req),
        video_url:
          v.storage_type === "local"
            ? absoluteUrl(`/api/stream/${v.id}`, req)
            : absoluteUrl(v.video_url, req),
      })),
    });
  } catch (err) {
    console.error("Admin list error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
};

/**
 * =========================
 * UPDATE VIDEO
 * =========================
 */
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      country,
      video_type,
      meta_title,
      meta_description,
      focus_keywords,
    } = req.body;

    if (video_type && !VALID_VIDEO_TYPES.includes(video_type)) {
      return res.status(400).json({ error: "Invalid video_type" });
    }

    const thumbFile = req.files?.thumbnail?.[0];

    const { rows } = await db.query(
      `SELECT thumbnail_url FROM videos WHERE id = $1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Video not found" });
    }

    let newThumbnailUrl = rows[0].thumbnail_url;

    if (thumbFile) {
      newThumbnailUrl = `/uploads/thumbnails/${thumbFile.filename}`;
      const oldPath = resolveUploadPath(rows[0].thumbnail_url);
      if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const keywordsArray = focus_keywords
      ? focus_keywords.split(",").map((k) => k.trim())
      : null;

    await db.query(
      `
      UPDATE videos SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        country = COALESCE($4, country),
        video_type = COALESCE($5, video_type),
        meta_title = COALESCE($6, meta_title),
        meta_description = COALESCE($7, meta_description),
        focus_keywords = COALESCE($8, focus_keywords),
        thumbnail_url = $9,
        updated_at = NOW()
      WHERE id = $10
      `,
      [
        title,
        description,
        category,
        country,
        video_type,
        meta_title,
        meta_description,
        keywordsArray,
        newThumbnailUrl,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

/**
 * =========================
 * DELETE VIDEO
 * =========================
 */
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `SELECT video_url, thumbnail_url, storage_type FROM videos WHERE id = $1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Video not found" });
    }

    const video = rows[0];

    if (video.storage_type === "local") {
      const videoPath = resolveUploadPath(video.video_url);
      if (videoPath && fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    const thumbPath = resolveUploadPath(video.thumbnail_url);
    if (thumbPath && fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }

    await db.query(`DELETE FROM videos WHERE id = $1`, [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

/**
 * =========================
 * CREATE CATEGORY
 * =========================
 */
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name required" });
    }

    const slug = generateSlug(name);

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/category/${req.file.filename}`;
    }

    await db.query(
      `
      INSERT INTO video_categories (name, slug, image_path)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO NOTHING
      `,
      [name.trim(), slug, imagePath]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
};

/**
 * =========================
 * BULK DELETE CATEGORIES
 * =========================
 */

exports.deleteCategories = async (req, res) => {
  const { categoryIds } = req.body;

  if (!Array.isArray(categoryIds) || !categoryIds.length) {
    return res.status(400).json({ error: "Category IDs required" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Fetch image paths
    const { rows } = await client.query(
      `
      SELECT image_path
      FROM video_categories
      WHERE id = ANY($1)
      `,
      [categoryIds]
    );

    // 2️⃣ Delete DB records
    await client.query(
      `
      DELETE FROM video_categories
      WHERE id = ANY($1)
      `,
      [categoryIds]
    );

    // 3️⃣ Delete images from disk
    for (const row of rows) {
      if (!row.image_path) continue;

      const filePath = resolveUploadPath(row.image_path);
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete categories error:", err);
    res.status(500).json({ error: "Failed to delete categories" });
  } finally {
    client.release();
  }
};
