🐳 Docker Usage Guide
🔹 Development Mode (Hot Reload)

Use this while actively developing.
Backend & frontend auto-reload on file changes.

docker compose -f docker-compose.dev.yml up


Access

Frontend: http://localhost:8080

Backend API: http://localhost:5000

🔹 Production Mode

Use this for production or production-like testing.

docker compose up --build -d


Notes

Uses production frontend build + Nginx

No hot reload

Persistent database & uploads via Docker volumes

🔹 Run Database Migrations (Safe for Production)

Apply schema changes without deleting data.

⚠️ Run this whenever new migration files are added.

docker compose run --rm backend npm run migrate


✔ Runs inside Docker network
✔ Uses correct DATABASE_URL
✔ Applies only pending migrations

🔹 Restart / Rebuild Containers (No Data Loss)

Use when you change Dockerfiles or configs.

docker compose up --build --force-recreate -d

✅ Recommended Production Flow
docker compose up --build -d
docker compose run --rm backend npm run migrate

