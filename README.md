# PrimeTrade

A full-stack web application built with a secure REST API and a robust frontend. Provides a task management system with secure authentication, role-based access control, Redis caching, and a responsive React interface.

## Tech Stack
- **Backend:** Node.js, Express.js, Prisma, Zod, JWT
- **Database:** PostgreSQL, Redis
- **Frontend:** React, Vite, Tailwind CSS, Axios

## Prerequisites
- Node.js v20+
- PostgreSQL
- Redis
- npm

## Setup Instructions

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repo-url>
   cd <repo-directory>
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Fill in values in .env. Ensure PostgreSQL and Redis are running locally.
   
   npx prisma migrate dev --name init
   npx prisma generate
   npm run dev
   ```

3. **Frontend Setup**:
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Testing

**API Base URL**: `http://localhost:5000/api/v1`

Import `postman/PrimeTrade_API.postman_collection.json` into Postman. Run the **Login** request first to auto-set the auth token collection variable.

## Default Admin Account (Seeded)
- **Email:** `admin@primetrade.ai`
- **Password:** `Admin@1234`
