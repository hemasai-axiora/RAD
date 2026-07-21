# RAD — Cloud-Based Billing & Inventory Management System

RAD is a production-quality, multi-tenant, multi-store retail Billing and Inventory Management System (SaaS-style architecture). It features barcode scanner support, real-time GST tax calculations, payment channels (split payments, customer credit accounts), hold/resume carts, product stock masters, and reporting analytics.

---

## 🛠️ Technology Stack

- **Frontend:** React.js (Web), Tailwind CSS v4, Lucide Icons, Recharts, Axios, React Router v6.
- **Backend:** Node.js, Express.js, JWT + Cookies, Multer, Morgan.
- **Database:** PostgreSQL 15.x (runs locally in a Docker container).
- **Deployment:** AWS Fargate (ECS), RDS Postgres, S3, CloudFront, ALB, AWS Backup.

---

## 📂 Project Directory Structure

```
RAD/
├── backend/
│   ├── src/
│   │   ├── config/       # pg Pool database config, seeding scripts
│   │   ├── controllers/  # express route handlers (auth, products, inventory, pos, customers, reports)
│   │   ├── middleware/   # JWT authentication & granular RBAC permissions
│   │   ├── routes/       # API endpoints (mounted under /api/*)
│   │   ├── services/     # reusable audit logging operations
│   │   └── app.js        # main Express server configuration
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # RouteGuard, Sidebar Navigation Layout
│   │   ├── context/      # AuthContext managing user sessions and global headers
│   │   ├── pages/        # Login, POS Register, Inventory Master, Customer Registry, Reports
│   │   └── App.jsx       # React Router entry mappings
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── schema.sql        # Database tables & role permissions seed DDL
│   ├── deployment.md     # AWS ECS/RDS/S3 deployment configurations
│   └── architecture.md   # Architectural design specifications
└── docker-compose.yml    # Runs Postgres container locally
```

---

## 🚀 Quickstart Guide

To run the application locally, follow these steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+ or v24+)
- [Docker & Docker Compose](https://www.docker.com/)

### 2. Startup PostgreSQL Database
In the root directory, spin up the local PostgreSQL container:
```bash
docker-compose up -d
```
*Note: This spins up a PostgreSQL container mapping internal port 5432 to host port **5433** to avoid port collisions with existing local databases.*

### 3. Setup and Run Backend
Navigate to `/backend` directory, install packages, run the seeder, and start the server:
```bash
cd backend
npm install
npm run seed
npm start
```
*Seeding creates default stores, role permissions, categories, product stock levels, customers, and admin accounts.*

### 4. Setup and Run Frontend
In a separate terminal, navigate to the `/frontend` directory, install packages, and boot the Vite development server:
```bash
cd frontend
npm install
npm run dev
```

The application will be live at `http://localhost:5173`.

---

## 🔑 Seeding User Credentials

Seeding populates two demo users for immediate testing:

| Username | Password | Role | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | Store Admin | Isolated to flagship store (Billing, products, inventory, customers) |
| **superadmin** | `super123` | Super Admin | Global system access (Full administrative scope) |

---

## 🧾 Billing Terminal (POS) Features

- **Keyboard & Scanner Optimized:** The scanner input is designed to auto-focus and parse scanner outputs instantly.
- **Split Payments:** Break bills down dynamically into Cash, Cards, and UPI values.
- **Hold & Resume:** Suspend active orders to clear the cash queue, and resume them later in one click.
- **Direct Thermal printing:** The receipt utilizes `@media print` rules aligned to standard **80mm thermal rolls**.
