# CivicConnect – Smart Location-Based Citizen Complaint Locator

CivicConnect is a modern, production-ready, location-based citizen complaint locator that automatically detects a citizen's GPS location and helps them instantly find the nearest responsible government department for a selected complaint. 

---

## 🚀 Key Features

* **Auto-Detect GPS Location**: Reads browser coordinates (HTML5 Geolocation) and performs reverse-geocoding lookup.
* **Manual Search Fallback**: Allow manual selection (Country, State, District, City, Pincode) if location permissions are blocked.
* **Spatial Nearest-Neighbor Search**: Uses PostgreSQL **PostGIS** spatial indexing (`<->` KNN operator) to locate the closest physical offices sorted by travel distance.
* **Responsive Layout (Tailwind)**: Optimized for mobile viewports, tablets, and desktop displays.
* **Interactive Direction Routing**: Visualizes driving route and travel details dynamically using dual-mode mapping (interactive Leaflet.js with OSRM API or Google Maps Embeds).
* **One-Click Calling**: Call the appropriate government office with a single tap (`tel:` link integration).
* **Saved Bookmarks**: Secure user accounts (JWT + bcrypt) to save frequently needed administrative desks.
* **Admin Control Center**: Secure admin portal to CRUD departments, categories, and helplines.
* **Offline Resiliency**: Monitors network state and serves bookmarks offline.

---

## 📁 Directory Structure

```text
citizen-complaint-locator/
├── backend/            # Express.js & TypeScript REST API
├── database/           # PostGIS schema migration & seeding SQL scripts
├── docs/               # Detailed system manuals & developer guides
├── frontend/           # React, TypeScript, and Tailwind CSS SPA (Vite)
├── .env.example        # Environment variables templates
├── docker-compose.yml  # Multi-container orchestration configurations
└── README.md           # This project hub page
```

---

## 🛠️ Quick Start

Deploy the entire stack in less than a minute using **Docker Compose**:

```bash
# 1. Clone/download repository and open workspace
cd citizen-complaint-locator

# 2. Setup variables
cp .env.example .env

# 3. Spin up all containers (Database, API, Web Server)
docker-compose up --build -d
```

Open `http://localhost` in your browser. Live seed data is loaded and available for Bangalore, Mumbai, and Delhi coverage areas.

*For manual development setups and local configurations, refer to the [Deployment Guide](docs/deployment_guide.md).*

---

## 📚 Secondary Documentation

* [System Architecture & Flows](docs/system_architecture.md): Detailed database ER Diagrams, system components, and logical routing flowcharts.
* [REST API Documentation](docs/api_documentation.md): API endpoints, parameter requirements, and JSON response payloads.
* [Deployment & Setup Guide](docs/deployment_guide.md): Comprehensive Docker deployment guides and manual step-by-step instructions.
