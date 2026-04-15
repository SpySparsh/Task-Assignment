# 🤖 Antigravity Build Specification
> Read this fully before writing a single line of code. Follow every section in order.

---

## 🎯 Project Goal

Build a **full-stack web application** with:
- A secure REST API with JWT authentication and role-based access control
- CRUD operations for a **Tasks** entity
- A minimal React frontend that consumes the API
- A Postman collection that documents and tests every endpoint
- A clean README with setup instructions

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v20+) |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Validation | Zod |
| Frontend | React + Vite |
| HTTP Client | Axios |
| Styling | Tailwind CSS (CDN via index.html, no build step needed) |
| Caching | Redis (`ioredis`) |
| API Docs | Postman Collection JSON (exported v2.1 format) |
| Config | `dotenv` |

---

## 📁 Folder Structure

Generate exactly this structure:

```
/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── task.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── task.routes.js
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   └── task.validator.js
│   │   ├── utils/
│   │   │   ├── response.js
│   │   │   └── redis.js
│   │   └── app.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   ├── TaskCard.jsx
│   │   │   └── Navbar.jsx
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── postman/
│   └── PrimeTrade_API.postman_collection.json
│
└── README.md
```

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          Int        @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  userId      Int
  user        User       @relation(fields: [userId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

enum Role {
  USER
  ADMIN
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  DONE
}
```

---

## 🔌 API Specification

All routes are prefixed with `/api/v1`.

### Auth Routes (`/api/v1/auth`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Login and receive JWT |
| GET | `/me` | Yes (any role) | Get current user profile |

### Task Routes (`/api/v1/tasks`)

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| GET | `/` | Yes | USER sees own tasks; ADMIN sees all | List tasks |
| POST | `/` | Yes | USER, ADMIN | Create a task |
| GET | `/:id` | Yes | Owner or ADMIN | Get single task |
| PUT | `/:id` | Yes | Owner or ADMIN | Update task |
| DELETE | `/:id` | Yes | Owner or ADMIN | Delete task |

### Admin Routes (`/api/v1/admin`)

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| GET | `/users` | Yes | ADMIN only | List all users |

---

## 📦 Request / Response Contracts

### `POST /api/v1/auth/register`

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### `POST /api/v1/auth/login`

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

### `POST /api/v1/tasks`

**Request body:**
```json
{
  "title": "Build API",
  "description": "Complete the REST API assignment",
  "status": "PENDING"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Task created",
  "data": { ...task }
}
```

### Standard Error Response (all endpoints)

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": []
}
```

---

## 🔐 Auth & Security Rules

1. **Password hashing:** Use `bcryptjs` with salt rounds = 10. Never store plain text passwords. Never return the `password` field in any response.

2. **JWT:** 
   - Sign with `process.env.JWT_SECRET`
   - Expiry: `7d`
   - Send as `Authorization: Bearer <token>` header

3. **Auth middleware (`auth.middleware.js`):**
   - Verify token on every protected route
   - Attach decoded user to `req.user`
   - Return `401` if token missing or invalid

4. **Role middleware (`role.middleware.js`):**
   - Accept an array of allowed roles, e.g. `requireRole(['ADMIN'])`
   - Return `403` if user role is not permitted

5. **Input validation:**
   - Use Zod schemas in `/validators/`
   - On validation failure return `400` with field-level error details

6. **Sanitization:**
   - Trim all string inputs
   - Use `express.json()` with a size limit of `10kb`

---

## 🛠️ Utility: `src/utils/response.js`

Create a reusable response helper:

```js
const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, statusCode, message, errors = []) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { sendSuccess, sendError };
```

Use this consistently across **all** controllers. No raw `res.json({})` calls.

---

## 🔴 Redis Caching

### Setup: `src/utils/redis.js`

```js
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

module.exports = redis;
```

### Caching Rules

Apply caching to the following endpoints only:

**`GET /api/v1/tasks`**
- Cache key: `tasks:user:<userId>` for USER role, `tasks:admin:all` for ADMIN role
- TTL: 60 seconds
- On cache hit: return cached data immediately, skip DB query
- Invalidate (delete key) on: `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`

**`GET /api/v1/admin/users`**
- Cache key: `admin:users`
- TTL: 120 seconds
- Invalidate on: `POST /auth/register`

### Cache Helper Pattern

Use this pattern inside controllers:

```js
const redis = require('../utils/redis');

// In GET /tasks controller:
const cacheKey = req.user.role === 'ADMIN' ? 'tasks:admin:all' : `tasks:user:${req.user.id}`;

const cached = await redis.get(cacheKey);
if (cached) {
  return sendSuccess(res, 200, 'Tasks fetched (cache)', JSON.parse(cached));
}

// ...fetch from DB...
await redis.setex(cacheKey, 60, JSON.stringify(tasks));
return sendSuccess(res, 200, 'Tasks fetched', tasks);

// In POST/PUT/DELETE /tasks controller (after DB operation):
await redis.del(`tasks:user:${req.user.id}`);
await redis.del('tasks:admin:all');
```

### Important

- If Redis is unavailable, the app must **not crash** — wrap all Redis calls in try/catch and fall through to the DB query silently
- Never cache sensitive data like passwords or raw JWT tokens

---

## 🌐 Frontend Requirements

### Pages

**`/register`** — Registration form
- Fields: Name, Email, Password
- On success: redirect to `/login`
- Show API error messages inline

**`/login`** — Login form
- Fields: Email, Password
- On success: store JWT in `localStorage` as `token`, redirect to `/dashboard`

**`/dashboard`** — Protected page
- If no token in localStorage → redirect to `/login`
- Show logged-in user's name and role in Navbar
- Display task list (fetched from `GET /api/v1/tasks`)
- "Add Task" button → inline form or modal with title, description, status fields
- Each task card shows title, status badge, Edit and Delete buttons
- Edit → pre-filled form, saves on submit
- Delete → confirm then call DELETE endpoint
- All success/error API responses shown as toast or banner messages

### `src/api/axios.js`

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 📮 Postman Collection (`postman/PrimeTrade_API.postman_collection.json`)

Generate a valid **Postman Collection v2.1** JSON file. It must include:

- A collection-level variable `baseUrl` = `http://localhost:5000/api/v1`
- A collection-level variable `token` (initially empty, set by the login test script)
- The login request must include a **Tests** script that auto-sets the token:
  ```js
  const res = pm.response.json();
  if (res.data && res.data.token) {
    pm.collectionVariables.set("token", res.data.token);
  }
  ```
- All protected requests use `Authorization: Bearer {{token}}`

**Folders and requests to include:**

```
Auth/
  POST Register
  POST Login
  GET  Me

Tasks/
  GET    List Tasks
  POST   Create Task
  GET    Get Task by ID
  PUT    Update Task
  DELETE Delete Task

Admin/
  GET List All Users
```

Each request must have example request bodies pre-filled.

---

## ⚙️ Environment Variables

Create `backend/.env.example` with:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/primetrade_db
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

---

## 📄 README.md (root level)

The README must include:

1. **Project Overview** — one paragraph
2. **Tech Stack** — brief list
3. **Prerequisites** — Node.js v20+, PostgreSQL, npm
4. **Setup Instructions** — step by step:
   - Clone repo
   - `cd backend && npm install`
   - Copy `.env.example` to `.env` and fill in values
   - Ensure PostgreSQL and Redis are running locally
   - `npx prisma migrate dev --name init`
   - `npx prisma generate`
   - `npm run dev`
   - `cd ../frontend && npm install && npm run dev`
5. **Prerequisites** — Node.js v20+, PostgreSQL, Redis, npm
5. **API Base URL** — `http://localhost:5000/api/v1`
6. **Postman** — "Import `postman/PrimeTrade_API.postman_collection.json` into Postman. Run Login first to auto-set the auth token."
7. **Default Admin Account** — Seed one admin user in the README (email + password) for testing

---

## 🌱 Database Seed

In `backend/prisma/seed.js`, create one admin user:
- name: `Admin User`
- email: `admin@primetrade.ai`
- password: `Admin@1234` (hashed with bcrypt)
- role: `ADMIN`

Add to `package.json`:
```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

---

## ✅ Definition of Done

Before considering the build complete, verify:

- [ ] `POST /register` creates a user with hashed password
- [ ] `POST /login` returns a valid JWT
- [ ] Protected routes return `401` without token
- [ ] Admin-only routes return `403` for USER role
- [ ] CRUD endpoints work correctly with proper status codes
- [ ] USER can only see/edit/delete their own tasks
- [ ] ADMIN can see all tasks and all users
- [ ] `GET /tasks` returns cached response on second call (check logs)
- [ ] Cache is invalidated after creating, updating, or deleting a task
- [ ] App does not crash if Redis is unavailable
- [ ] Frontend login stores token and dashboard is protected
- [ ] All CRUD actions work from the frontend UI
- [ ] Postman collection imports cleanly and Login auto-sets `{{token}}`
- [ ] `.env.example` has no real secrets
- [ ] README setup steps work from a fresh clone
