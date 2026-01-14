🐳 Docker Usage Guide
🔹 Run Docker in Development Mode (Hot Reload)

Use this when actively developing.
Backend & frontend reload automatically on file changes.

docker compose -f docker-compose.dev.yml up


Access:

Frontend: http://localhost:4200

Backend API: http://localhost:5000

🔹 Run Docker in Production Mode

Use this for production or production-like testing.

docker compose up --build


Notes:

Uses built frontend build + Nginx

No hot reload

Persistent database & uploads via Docker volumes

🔹 Run Database Migrations (Safe for Production)

Use this to apply schema changes without deleting data.

docker exec -it tube-postgres psql -U postgres tube