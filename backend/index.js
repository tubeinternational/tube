const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const UPLOADS_DIR = path.resolve(__dirname, "..", "uploads");

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => {
  res.send("HoeTube API running 🚀"); 
});

// ✅ STATIC UPLOADS (ROOT LEVEL)
app.use("/uploads", express.static(UPLOADS_DIR));

// routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/videos", require("./routes/videos.routes"));
app.use("/api/support", require("./routes/support.routes"));
app.use("/api", require("./routes/stream.routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
