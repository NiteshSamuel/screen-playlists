# 🎬 Screens & Playlists System — Full Stack App

## 📘 Overview

A small **full-stack system** built for the *“Screens & Playlists”* assignment.

Includes:

* **Backend:** Express + MongoDB + JWT Auth
* **Frontend:** React + TypeScript + Vite + React Query + Tailwind
* **Database:** MongoDB
* **Authentication:** JWT with role-based access (ADMIN / EDITOR / VIEWER)

---

## 🧩 Features

### 🛠️ Backend

* JWT-based authentication
* Role-based authorization
* Secure password hashing (bcrypt)
* Validation with `express-validator`
* Search + pagination for Screens & Playlists
* MongoDB indexes for name-based search
* Centralized error handling
* Seed script for sample data

### 💻 Frontend

* React + TypeScript (Vite)
* Login flow + JWT persistence
* Screens list (search, pagination, toggle active)
* Playlists list (search, pagination, create new)
* React Query for data fetching + caching
* Tailwind CSS for clean UI
* Optimistic updates & loading skeletons
* Basic accessibility + error messages

---

## 🧱 Folder Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── seed.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── auth/
    │   ├── components/
    │   ├── pages/
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

# ⚙️ Backend Setup Guide

## 1️⃣ Prerequisites

* Node.js v18+
* MongoDB running locally or via Docker

## 2️⃣ Install Dependencies

```bash
cd backend
npm install
```

## 3️⃣ Environment Variables

Create a `.env` file using the example below:

```
MONGO_URI=mongodb://localhost:27017/screens_playlists
JWT_SECRET=changeme_replace_in_production
JWT_EXPIRES_IN=7d
PORT=5000
```

## 4️⃣ Seed the Database

Populate MongoDB with users, screens, and playlists:

```bash
npm run seed
```

🧠 This creates:

* **ADMIN:** `admin@example.com / admin123`
* **EDITOR:** `editor@example.com / editor123`

and inserts sample Screens & Playlists.

## 5️⃣ Run the Backend

```bash
npm run dev
```

Server starts at:
👉 [http://localhost:5000](http://localhost:5000)

---

## 🧠 Backend API Reference

### Authentication

#### `POST /auth/login`

**Request**

```json
{ "email": "editor@example.com", "password": "editor123" }
```

**Response**

```json
{
  "token": "JWT_TOKEN",
  "user": { "id": "...", "email": "editor@example.com", "role": "EDITOR" }
}
```

---

### Screens

#### `GET /screens?search=&page=&limit=`

**Response**

```json
{
  "items": [
    { "_id": "...", "name": "Lobby Display", "isActive": true }
  ],
  "total": 5,
  "page": 1,
  "limit": 5
}
```

#### `PUT /screens/:id` *(EDITOR+ only)*

Toggles `isActive` status.
**Response**

```json
{ "_id": "...", "name": "Lobby Display", "isActive": false }
```

---

### Playlists

#### `GET /playlists?search=&page=&limit=`

**Response**

```json
{
  "items": [
    { "_id": "...", "name": "Morning Loop", "itemCount": 2 }
  ],
  "total": 3,
  "page": 1,
  "limit": 5
}
```

#### `POST /playlists` *(EDITOR+ only)*

**Request**

```json
{
  "name": "My Playlist",
  "itemUrls": ["https://example.com/video.mp4"]
}
```

**Response**

```json
{ "_id": "...", "name": "My Playlist", "itemCount": 1 }
```

---

## 🔐 Validation & Security

* **Validation:** `express-validator` (for email, URL, and field constraints)
* **Passwords:** Hashed using `bcrypt`
* **Auth:** JWT tokens stored on client side
* **Role-based Access:**

  * VIEWER → read-only
  * EDITOR → can toggle screens, create playlists
  * ADMIN → full privileges
* **Headers & CORS:** Managed via `helmet()` and `cors()`
* **Rate limiting:** Prevents API abuse (100 req/min)

---

## 🧾 Error Shape

All API errors return a consistent structure:

```json
{ "message": "Error description", "status": 400 }
```

---

## 🧪 Test Plan

| Test         | Description                                |
| ------------ | ------------------------------------------ |
| ✅ Auth       | Login success/failure, invalid credentials |
| ✅ Screens    | GET search/pagination, toggle as EDITOR    |
| ✅ Playlists  | GET with pagination, POST validation       |
| ✅ Validation | Reject >10 URLs, invalid URL format        |
| ✅ Roles      | VIEWER cannot modify data                  |

---

# 💻 Frontend Setup Guide

## 1️⃣ Install Frontend

```bash
cd frontend
npm install
```

## 2️⃣ Configure API Base URL

In `src/api/client.ts`, set your backend URL:

```ts
baseURL: 'http://localhost:5000'
```

## 3️⃣ Run the Frontend

```bash
npm run dev
```

Visit: 👉 [http://localhost:5173](http://localhost:5173)

---

## 🌐 Frontend Pages

### 🔐 Login Page

* Form with email/password
* Calls `/auth/login`
* Stores JWT in `localStorage`

---

### 🖥️ Screens Page

* Displays paginated table of Screens
* Search bar for case-insensitive filtering
* EDITOR/ADMIN can toggle `isActive`
* Optimistic update with rollback on failure
* Loading skeletons & error UI

---

### 🎵 Playlists Page

* Search + pagination
* Create form (name + up to 10 URLs)
* Validation on client + server
* Displays playlists with `itemCount`

---

## 🧠 UX / UI Design

* Built with Tailwind CSS
* Responsive layout
* Accessible forms and buttons
* Loading states using `animate-pulse`
* Consistent color palette (gray/blue/green/red)

---

## 🔄 State Management

* **React Query (TanStack)** for:

  * Fetching & caching API responses
  * Auto refetch after mutations
  * Built-in loading & error states

---

## 🚀 Deployment Notes

### Backend

* Use environment variables for production MongoDB and JWT secrets
* Deploy with Docker, Render, or Railway

### Frontend

* Adjust API URL in `client.ts` to your hosted backend
* Build production bundle:

  ```bash
  npm run build
  npm run preview
  ```

---

## 🧩 Decisions Log

| Area                  | Decision           | Reason                         |
| --------------------- | ------------------ | ------------------------------ |
| **Validation**        | express-validator  | Simpler, well-maintained       |
| **Auth**              | JWT stateless      | Easier to integrate and deploy |
| **Password Security** | bcrypt             | Strong hashing algorithm       |
| **State Management**  | React Query        | Auto caching + retries         |
| **UI Framework**      | Tailwind           | Clean, responsive, no config   |
| **Search Impl.**      | Regex + index      | Simple and performant          |
| **Pagination**        | Backend skip/limit | Efficient for MongoDB          |

---

## ✅ Deliverables Summary

| Deliverable   | Description                                           |
| ------------- | ----------------------------------------------------- |
| Backend Repo  | Express API with MongoDB, seed script, .env.example   |
| Frontend Repo | React + TS app connected to API                       |
| README.md     | Full setup, API, validation, security, and UX details |
| Seed Script   | Auto-creates users, screens, playlists                |
| Test Plan     | Covered functional areas                              |

---

## 👩‍💻 Default Credentials

| Role   | Email                | Password    |
| ------ | -------------------- | ----------- |
| ADMIN  | `admin@example.com`  | `admin123`  |
| EDITOR | `editor@example.com` | `editor123` |

---

## 🧠 Next Steps (Optional Enhancements)

* ✅ Route protection (redirect if not logged in)
* ✅ Toast notifications (react-hot-toast)
* ✅ Jest tests for API routes
* ✅ Deploy both apps to Render/Vercel

---

**Developed by:** *Nitesh Samuel*
📅 **Assignment:** Full Stack Developer — “Screens & Playlists” System
🛠️ **Stack:** React • Express • MongoDB • TypeScript
