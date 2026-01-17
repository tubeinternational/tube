const db = require("../db");
const crypto = require("crypto");
const { absoluteUrl } = require("../utils/url");

/**
 * =========================
 * GET /api/videos
 * =========================
 */
exports.getVideos = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 25, 50);
    const offset = (page - 1) * limit;

    const q = req.query.q?.trim();
    const category = req.query.category?.trim();
    const country = req.query.country?.trim(); // ✅ ADD THIS

    const params = [];
    let whereSql = `
      WHERE is_active = true
        AND video_type = 'normal'
    `;

    if (q) {
      params.push(`%${q}%`);
      whereSql += `
        AND (
          title ILIKE $${params.length}
          OR description ILIKE $${params.length}
          OR meta_title ILIKE $${params.length}
        )
      `;
    }

    if (category) {
      params.push(category);
      whereSql += ` AND category = $${params.length}`;
    }

    if (country) {
      params.push(country);
      whereSql += ` AND country ILIKE $${params.length}`;
    }

    params.push(limit, offset);

    const { rows } = await db.query(
      `
      SELECT
        id,
        title,
        slug,
        thumbnail_url,
        storage_type,
        video_url,
        video_type,
        duration,
        views,
        created_at
      FROM videos
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    res.json({
      results: rows.map((v) => ({
        ...v,
        thumbnail_url: absoluteUrl(v.thumbnail_url, req),
        stream_url:
          v.storage_type === "local" ? `/api/stream/${v.id}` : v.video_url,
      })),
      page,
      totalPages: Math.ceil(rows.length / limit),
      total: rows.length,
    });
  } catch (err) {
    console.error("Fetch videos error:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

/**
 * =========================
 * GET /api/videos/slug/:slug
 * =========================
 */
exports.getVideoBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const guestHash = req.cookies?.guest_id
      ? crypto.createHash("sha256").update(req.cookies.guest_id).digest("hex")
      : null;

    const { rows } = await db.query(
      `
      SELECT
        v.id,
        v.title,
        v.slug,
        v.description,
        v.meta_title,
        v.meta_description,
        v.focus_keywords,
        v.thumbnail_url,
        v.video_type,
        v.video_url,
        v.storage_type,
        v.duration,
        v.views,
        v.category,
        v.country,
        v.created_at,

        COUNT(vl.id)::int AS likes_count,

        BOOL_OR(
          (vl.user_id = $2 AND $2 IS NOT NULL)
          OR
          (vl.guest_hash = $3 AND $3 IS NOT NULL)
        ) AS is_liked

      FROM videos v
      LEFT JOIN video_likes vl ON vl.video_id = v.id
      WHERE v.slug = $1
        AND v.is_active = true
        AND v.video_type = 'normal'
      GROUP BY
        v.id, v.title, v.slug, v.description,
        v.meta_title, v.meta_description, v.focus_keywords,
        v.thumbnail_url, v.video_type, v.video_url,
        v.storage_type, v.duration, v.views,
        v.category, v.country, v.created_at
      LIMIT 1
      `,
      [slug, req.user?.id || null, guestHash]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Video not found" });
    }

    const video = rows[0];

    res.json({
      ...video,
      thumbnail_url: absoluteUrl(video.thumbnail_url, req),
      stream_url:
        video.storage_type === "local"
          ? `/api/stream/${video.id}`
          : video.video_url,
    });
  } catch (err) {
    console.error("Fetch video by slug error:", err);
    res.status(500).json({ error: "Failed to fetch video" });
  }
};

/**
 * =========================
 * POST /api/videos/:id/view
 * =========================
 */
exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      UPDATE videos
      SET views = COALESCE(views, 0) + 1
      WHERE id = $1
        AND is_active = true
      `,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Increment views error:", err);
    res.status(500).json({ error: "Failed to increment views" });
  }
};

/**
 * =========================
 * GET /api/videos/:id/related
 * =========================
 */
exports.getRelatedVideos = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      SELECT
        id,
        title,
        slug,
        thumbnail_url,
        storage_type,
        video_url,
        video_type,
        duration,
        views,
        created_at
      FROM videos
      WHERE is_active = true
        AND video_type = 'normal'
        AND id != $1
      ORDER BY created_at DESC
      LIMIT 6
      `,
      [id]
    );

    res.json(
      rows.map((v) => ({
        ...v,
        thumbnail_url: absoluteUrl(v.thumbnail_url, req),
        stream_url:
          v.storage_type === "local" ? `/api/stream/${v.id}` : v.video_url,
      }))
    );
  } catch (err) {
    console.error("Related videos error:", err);
    res.status(500).json({ error: "Failed to fetch related videos" });
  }
};

/**
 * =========================
 * GET /api/videos/shorts
 * =========================
 */
exports.getShorts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 30);
    const offset = (page - 1) * limit;

    const guestHash = req.cookies?.guest_id
      ? crypto.createHash("sha256").update(req.cookies.guest_id).digest("hex")
      : null;

    const { rows } = await db.query(
      `
      SELECT
        v.id,
        v.title,
        v.slug,
        v.description,
        v.thumbnail_url,
        v.video_url,
        v.storage_type,
        v.duration,
        v.views,
        v.created_at,

        COUNT(vl.id)::int AS likes_count,

        BOOL_OR(
          (vl.user_id = $3 AND $3 IS NOT NULL)
          OR
          (vl.guest_hash = $4 AND $4 IS NOT NULL)
        ) AS is_liked

      FROM videos v
      LEFT JOIN video_likes vl ON vl.video_id = v.id
      WHERE v.is_active = true
        AND v.video_type = 'short'
      GROUP BY
        v.id, v.title, v.slug, v.description,
        v.thumbnail_url, v.video_url, v.storage_type,
        v.duration, v.views, v.created_at
      ORDER BY v.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset, req.user?.id || null, guestHash]
    );

    res.json({
      page,
      limit,
      hasMore: rows.length === limit,
      items: rows.map((v) => ({
        ...v,
        thumbnail_url: absoluteUrl(v.thumbnail_url, req),
        stream_url:
          v.storage_type === "local" ? `/api/stream/${v.id}` : v.video_url,
      })),
    });
  } catch (err) {
    console.error("Fetch shorts error:", err);
    res.status(500).json({ error: "Failed to fetch shorts" });
  }
};

/**
 * =========================
 * GET /api/videos/shorts/slug/:slug
 * =========================
 */
exports.getShortBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const guestHash = req.cookies?.guest_id
      ? crypto.createHash("sha256").update(req.cookies.guest_id).digest("hex")
      : null;

    const { rows } = await db.query(
      `
      SELECT
        v.id,
        v.title,
        v.slug,
        v.description,
        v.thumbnail_url,
        v.video_url,
        v.storage_type,
        v.duration,
        v.views,
        v.created_at,

        COUNT(vl.id)::int AS likes_count,

        BOOL_OR(
          (vl.user_id = $2 AND $2 IS NOT NULL)
          OR
          (vl.guest_hash = $3 AND $3 IS NOT NULL)
        ) AS is_liked

      FROM videos v
      LEFT JOIN video_likes vl ON vl.video_id = v.id
      WHERE v.slug = $1
        AND v.video_type = 'short'
        AND v.is_active = true
      GROUP BY
        v.id, v.title, v.slug, v.description,
        v.thumbnail_url, v.video_url, v.storage_type,
        v.duration, v.views, v.created_at
      LIMIT 1
      `,
      [slug, req.user?.id || null, guestHash]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Short not found" });
    }

    const v = rows[0];

    res.json({
      ...v,
      thumbnail_url: absoluteUrl(v.thumbnail_url, req),
      stream_url:
        v.storage_type === "local" ? `/api/stream/${v.id}` : v.video_url,
    });
  } catch (err) {
    console.error("Fetch short by slug error:", err);
    res.status(500).json({ error: "Failed to fetch short" });
  }
};

/**
 * =========================
 * POST /api/videos/:id/like
 * =========================
 */
exports.likeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user?.id || null;

    let guestHash = null;

    if (!userId) {
      if (!req.cookies.guest_id) {
        const newGuestId = crypto.randomUUID();
        res.cookie("guest_id", newGuestId, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        guestHash = crypto
          .createHash("sha256")
          .update(newGuestId)
          .digest("hex");
      } else {
        guestHash = crypto
          .createHash("sha256")
          .update(req.cookies.guest_id)
          .digest("hex");
      }
    }

    await db.query(
      `
      INSERT INTO video_likes (video_id, user_id, guest_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
      `,
      [videoId, userId, guestHash]
    );

    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS likes_count FROM video_likes WHERE video_id = $1`,
      [videoId]
    );

    res.json({
      liked: true,
      likes_count: rows[0].likes_count,
    });
  } catch (err) {
    console.error("Like video error:", err);
    res.status(500).json({ error: "Failed to like video" });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        id,
        name,
        image_path
      FROM video_categories
      WHERE is_active = true
      ORDER BY name
    `);

    const categories = rows.map((c) => ({
      id: c.id,
      name: c.name,
      image_url: absoluteUrl(c.image_path, req),
    }));

    res.json(categories);
  } catch (err) {
    console.error("Fetch categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};
