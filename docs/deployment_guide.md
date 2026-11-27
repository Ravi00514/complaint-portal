# Deployment Guide - CivicConnect

CivicConnect supports containerized docker environments (Compose orchestration) and manual npm builds.

---

## 1. Quick Start via Docker Compose (Recommended)

Docker Compose builds and starts all microservices (PostgreSQL with PostGIS capability, Node Express server, and Nginx React server) automatically.

### Prerequisites
* Docker Engine installed and running.
* Docker Compose CLI tool.

### Steps
1. **Clone and Navigate**: Ensure you are in the project root workspace directory.
2. **Environment Setup**: Copy `.env.example` to `.env` and fill details:
   ```bash
   cp .env.example .env
   ```
3. **Spin Containers**: Execute build and launch commands:
   ```bash
   docker-compose up --build -d
   ```
4. **Automatic Seeding**: The postgres instance will boot and execute scripts:
   * `./database/schema.sql` (Creates tables, spatial indices)
   * `./database/seed.sql` (Inserts categories, default admin, and coordinates data)
5. **Access Sites**:
   * **Web UI**: Open your browser at `http://localhost` (or `http://localhost:80`)
   * **Backend Health Check**: Verify API links at `http://localhost:5000/health`

---

## 2. Manual Installation & Development Mode

To run services locally outside container services:

### Prerequisites
* **Node.js** version 20+
* **PostgreSQL** database (version 12+) with **PostGIS** extension loaded.

### Database Setup
1. Create a database in your local PostgreSQL:
   ```sql
   CREATE DATABASE civicconnect;
   ```
2. Execute the schema migration script in the database:
   ```bash
   psql -U postgres -d civicconnect -f database/schema.sql
   ```
3. Populate with default data seeds:
   ```bash
   psql -U postgres -d civicconnect -f database/seed.sql
   ```

### Backend API Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example` and update connection details.
4. Launch development dev server:
   ```bash
   npm run dev
   ```

### Frontend App Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create `.env` or check environment configuration parameters.
4. Launch Vite developer runtime:
   ```bash
   npm run dev
   ```
5. Build static assets for production deployment:
   ```bash
   npm run build
   ```
   *Serve the compiled static content located in `dist/` using any static file server like Nginx, Apache, or AWS S3.*
