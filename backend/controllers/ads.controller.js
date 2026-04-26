// backend/controllers/ads.controller.js

const db = require("../db");

/**
 * =========================
 * CREATE AD
 * =========================
 */
exports.createAd = async (req, res) => {
  try {
    const {
      name,
      placement,
      type,
      code,
      device,
      is_active,
      priority,
      start_date,
      end_date,
    } = req.body;

    if (!name || !placement || !code) {
      return res.status(400).json({
        error: "Name, placement and code are required",
      });
    }

    const { rows } = await db.query(
      `
      INSERT INTO ads 
      (name, placement, type, code, device, is_active, priority, start_date, end_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        name,
        placement,
        type || "SCRIPT",
        code,
        device || "ALL",
        is_active ?? true,
        priority || 0,
        start_date || null,
        end_date || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create ad error:", err);
    res.status(500).json({ error: "Failed to create ad" });
  }
};

/**
 * =========================
 * GET ADS (FILTERED)
 * =========================
 */
exports.getAds = async (req, res) => {
  try {
    const {
      placement,
      device,
      active,
      page = 1,
      limit = 20,
    } = req.query;

    const params = [];
    let where = `WHERE 1=1`;

    if (placement) {
      params.push(placement);
      where += ` AND placement = $${params.length}`;
    }

    if (device && device !== "ALL") {
      params.push(device);
      where += ` AND (device = $${params.length} OR device = 'ALL')`;
    }

    if (active !== undefined) {
      params.push(active === "true");
      where += ` AND is_active = $${params.length}`;
    }

    // Date-based filtering (important for ads)
    where += `
      AND (start_date IS NULL OR start_date <= NOW())
      AND (end_date IS NULL OR end_date >= NOW())
    `;

    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM ads
      ${where}
    `;

    const dataQuery = `
      SELECT *
      FROM ads
      ${where}
      ORDER BY priority DESC, created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const { rows: countRows } = await db.query(countQuery, params);

    const { rows } = await db.query(dataQuery, [
      ...params,
      limit,
      offset,
    ]);

    res.json({
      results: rows,
      page: Number(page),
      limit: Number(limit),
      total: countRows[0].total,
      totalPages: Math.ceil(countRows[0].total / limit),
    });
  } catch (err) {
    console.error("Fetch ads error:", err);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
};

/**
 * =========================
 * GET SINGLE AD
 * =========================
 */
exports.getAdById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `SELECT * FROM ads WHERE id = $1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Ad not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Fetch ad error:", err);
    res.status(500).json({ error: "Failed to fetch ad" });
  }
};

/**
 * =========================
 * UPDATE AD
 * =========================
 */
exports.updateAd = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      placement,
      type,
      code,
      device,
      is_active,
      priority,
      start_date,
      end_date,
    } = req.body;

    const { rows } = await db.query(
      `
      UPDATE ads SET
        name = $1,
        placement = $2,
        type = $3,
        code = $4,
        device = $5,
        is_active = $6,
        priority = $7,
        start_date = $8,
        end_date = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
      `,
      [
        name,
        placement,
        type,
        code,
        device,
        is_active,
        priority,
        start_date,
        end_date,
        id,
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Ad not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Update ad error:", err);
    res.status(500).json({ error: "Failed to update ad" });
  }
};

/**
 * =========================
 * DELETE AD
 * =========================
 */
exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM ads WHERE id = $1`, [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete ad error:", err);
    res.status(500).json({ error: "Failed to delete ad" });
  }
};

/**
 * =========================
 * TOGGLE ACTIVE
 * =========================
 */
exports.toggleAdStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `
      UPDATE ads
      SET is_active = NOT is_active,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Toggle ad error:", err);
    res.status(500).json({ error: "Failed to toggle ad" });
  }
};