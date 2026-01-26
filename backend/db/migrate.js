const fs = require("fs");
const path = require("path");
const pool = require("./index");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

(async () => {
  const client = await pool.connect();

  try {
    console.log("🔍 Checking applied migrations...");

    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT now()
      );
    `);

    const { rows } = await client.query(
      "SELECT name FROM migrations ORDER BY name"
    );
    const applied = rows.map((r) => r.name);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.includes(file)) continue;

      console.log(`🚀 Applying migration: ${file}`);

      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, file),
        "utf8"
      );

      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO migrations (name) VALUES ($1)",
        [file]
      );
      await client.query("COMMIT");

      console.log(`✅ Migration applied: ${file}`);
    }

    console.log("🎉 All migrations are up to date");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
})();
