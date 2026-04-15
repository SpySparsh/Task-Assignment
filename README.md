# 🚀 PrimeTrade API & Task Management Platform

![Node.js](https://img.shields.io/badge/Node.js-v20+-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-v7_ORM-1B222D?style=for-the-badge&logo=prisma)
![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?style=for-the-badge&logo=redis)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)

A scalable, full-stack REST API and interactive frontend developed as part of the **Backend Developer (Intern) Assignment for Primetrade.ai**. 

This system provides a secure foundation for user authentication, role-based access control (RBAC), and entity management (Tasks), backed by high-performance caching and modern database connection pooling.

---

## 🎯 Assignment Deliverables Checklist
- [x] **Backend Project:** Hosted on GitHub with clear setup instructions.
- [x] **Working APIs:** Full Auth & CRUD capabilities implemented.
- [x] **Frontend UI:** React-based dashboard connecting securely to the APIs.
- [x] **API Documentation:** Postman collection included (`/postman`).
- [x] **Scalability Note:** Detailed below in the Architecture section.
- [x] **Security:** JWT implementation, password hashing (bcrypt), and input validation (Zod).

---

## 🏗️ Architecture & Tech Stack

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL (Cloud hosted)
* **ORM:** Prisma v7 (Utilizing Prisma Accelerate for edge caching & connection pooling)
* **Caching:** Redis Cloud (via `ioredis`)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Validation:** Zod

### Frontend
* **Framework:** React.js + Vite
* **HTTP Client:** Axios (with auth interceptors)
* **Styling:** Tailwind CSS

---

## 🔒 Security Practices Implemented
1. **Password Hashing:** Passwords are never stored in plain text. Salted and hashed via `bcryptjs`.
2. **Stateless Authentication:** Secure JWTs are issued upon login and validated via custom middleware on protected routes.
3. **Role-Based Access Control (RBAC):** `USER` and `ADMIN` roles. Users can only access their own data; Admins have system-wide read/write permissions.
4. **Data Validation:** Strict payload validation using Zod ensures no malformed data reaches the database layer.
5. **UUID Primary Keys:** Obfuscated database records prevent enumeration attacks (e.g., guessing user ID #5).

---

## 📈 Scalability Note

As the platform scales to support high-frequency trading data or a massive user base, the current architecture lays the groundwork for horizontal scaling:

1. **Database Connection Pooling:** By utilizing **Prisma Accelerate**, the application handles connection pooling at the edge, preventing the PostgreSQL database from being overwhelmed by too many direct connections during high-traffic spikes.
2. **Redis Caching Layer:** Read-heavy operations (like fetching task lists) are cached in Redis. This drastically reduces database load. Cache invalidation is handled automatically on write operations (`POST`, `PUT`, `DELETE`).
3. **Stateless API:** Because authentication relies on JWTs rather than server-side sessions, the Express backend is completely stateless. This allows the application to be deployed across multiple instances behind a **Load Balancer** without session-affinity issues.
4. **Future Microservices Extraction:** The modular route and controller structure (`auth.controller`, `task.controller`) makes it trivial to split this monolith into domain-specific microservices as traffic demands dictate.

---

## ⚙️ Local Setup Instructions

### Prerequisites
* Node.js (v20+)
* A PostgreSQL Database (Local or Cloud)
* A Redis Instance (Local or Cloud)

### 1. Clone the Repository
```bash
git clone [https://github.com/YourUsername/primetrade-app.git](https://github.com/YourUsername/primetrade-app.git)
cd primetrade-app
```
### 2. Backend Setup
Navigate to the backend directory and install dependencies:

```Bash
cd backend
npm install
```
Create a .env file in the backend folder and configure your secrets:
```Code snippet
# prisma.config.ts uses this for CLI migrations
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Express app uses this for Prisma Accelerate connection
ACCELERATE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"

# Redis Cloud URL
REDIS_URL="redis://default:password@host:port"

# JWT Secret
JWT_SECRET="your_super_secret_jwt_key"
PORT=5000
```
Run database migrations, generate the Prisma client, and seed the default Admin:
```Bash
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
```
Start the backend server:

```Bash
npm run dev
```
### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:

```Bash
cd frontend
npm install
```
(Optional) Create a .env file in the frontend folder if your backend is not running on port 5000:

```Code snippet
VITE_API_URL="http://localhost:5000/api/v1"
```
Start the frontend development server:

```Bash
npm run dev
```
Navigate to http://localhost:5173 in your browser.

## 📮 API Documentation
A complete Postman collection is included in the repository.

Import postman/PrimeTrade_API.postman_collection.json into Postman.

Run the Login request first. A script will automatically capture the JWT and set it as a global variable {{token}} for all subsequent requests.

Core Endpoints
Auth:

POST /api/v1/auth/register - Register a new account

POST /api/v1/auth/login - Authenticate & receive JWT

Tasks:

GET /api/v1/tasks - List tasks (Returns cached data via Redis)

POST /api/v1/tasks - Create a task

PUT /api/v1/tasks/:id - Update a task

DELETE /api/v1/tasks/:id - Delete a task

Admin:

GET /api/v1/admin/users - List all system users (Requires ADMIN role)
