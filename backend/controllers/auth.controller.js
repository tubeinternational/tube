const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { sendEmail } = require("../utils/sendEmail");

/**
 * POST /api/auth/log-in
 */
exports.login = async (req, res) => {
  console.log("🔥 SIGNIN ROUTE HIT");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("JWT_ACCESS_SECRET present:", !!process.env.JWT_ACCESS_SECRET);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const result = await pool.query(
      `
      SELECT id, email, password_hash, role, is_active
      FROM users
      WHERE email = $1
      `,
      [email.toLowerCase().trim()]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    console.log("SIGNIN: user found ->", {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });

    const role = (user.role || "").toUpperCase();
    if (!user.is_active || role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "4h" }
    );

    res.json({
      status: "SIGNED_IN",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/auth/register (DEV ONLY)
 */
exports.register = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password too short" });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users (
        email,
        password_hash,
        role,
        is_active,
        two_factor_enabled
      )
      VALUES ($1, $2, 'ADMIN', true, true)
      `,
      [email, passwordHash]
    );

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/auth/signin
 * (alias of login – kept intentionally)
 */
exports.signin = exports.login;

/**
 * POST /api/auth/verify-otp
 */
exports.verifyOtp = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const { otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, role, otp_hash, otp_expires_at
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const user = result.rows[0];

    if (!user.otp_hash || new Date() > user.otp_expires_at) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const isOtpValid = await bcrypt.compare(
      otp.toString(),
      user.otp_hash
    );

    if (!isOtpValid) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    await pool.query(
      `
      UPDATE users
      SET otp_hash = NULL,
          otp_expires_at = NULL
      WHERE id = $1
      `,
      [user.id]
    );

    const payload = { userId: user.id, role: user.role };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "4h" }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/auth/me
 */
exports.me = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const result = await pool.query(
      `
      SELECT id, email, role
      FROM users
      WHERE id = $1 AND is_active = true
      `,
      [decoded.userId]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({ user: result.rows[0] });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
