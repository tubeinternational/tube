const pool = require("../db");

/**
 * POST /api/support/contact
 * Public
 */
exports.contactUs = async (req, res) => {
  const { fullName, email, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    await pool.query(
      `
      INSERT INTO contact_requests (full_name, email, message)
      VALUES ($1, $2, $3)
      `,
      [fullName, email, message]
    );

    res.json({
      success: true,
      message: "Your message has been received",
    });
  } catch (err) {
    console.error("Contact request error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit message",
    });
  }
};

/**
 * POST /api/support/content-removal
 * Public
 */
exports.contentRemovalRequest = async (req, res) => {
  const { fullName, email, contentUrl, reason } = req.body;

  if (!fullName || !email || !contentUrl || !reason) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    await pool.query(
      `
      INSERT INTO content_removal_requests
      (full_name, email, content_url, reason)
      VALUES ($1, $2, $3, $4)
      `,
      [fullName, email, contentUrl, reason]
    );

    res.json({
      success: true,
      message: "Content removal request received",
    });
  } catch (err) {
    console.error("Content removal error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit request",
    });
  }
};

/**
 * GET /api/support/admin/contact-requests
 * Admin (paginated)
 */
exports.getContactRequests = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const [data, count] = await Promise.all([
      pool.query(
        `SELECT * FROM contact_requests
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM contact_requests`)
    ]);

    res.json({
      success: true,
      data: data.rows,
      pagination: {
        page,
        limit,
        total: Number(count.rows[0].count),
      },
    });
  } catch (err) {
    console.error("Get contact requests error:", err);
    res.status(500).json({ success: false });
  }
};

/**
 * GET /api/support/admin/content-removal-requests
 * Admin (paginated)
 */
exports.getContentRemovalRequests = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const [data, count] = await Promise.all([
      pool.query(
        `SELECT * FROM content_removal_requests
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM content_removal_requests`)
    ]);

    res.json({
      success: true,
      data: data.rows,
      pagination: {
        page,
        limit,
        total: Number(count.rows[0].count),
      },
    });
  } catch (err) {
    console.error("Get content removal requests error:", err);
    res.status(500).json({ success: false });
  }
};

/**
 * PATCH /api/support/admin/content-removal-requests/:id/status
 */
exports.updateContentRemovalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["open", "resolved"].includes(status)) {
    return res.status(400).json({ success: false });
  }

  await pool.query(
    `UPDATE content_removal_requests SET status=$1 WHERE id=$2`,
    [status, id]
  );

  res.json({ success: true });
};
