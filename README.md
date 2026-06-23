# POCKET

A personal expense tracker for day-to-day spending, money owed to you, monthly budgets, and calendar breakdowns.

## Stack

- **Frontend:** React, Vite, Framer Motion, React Router
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT (username + password)

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd MyWallet

cd server && npm install
cd ../client && npm install
```

### 2. Environment variables

**Server** — copy and edit:

```bash
cp server/.env.example server/.env
```

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `4000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Strong random secret for JWT signing |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:5173`) |

**Client** — optional (defaults work in dev with Vite proxy):

```bash
cp client/.env.example client/.env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL including `/api` |

### 3. Run locally

Terminal 1 — backend:

```bash
cd server
npm run dev
```

Terminal 2 — frontend:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Features

- Auth (sign up / sign in with name, username, password)
- Dashboard with monthly summary
- My Expenses & Money Owed To Me ledgers
- Monthly budget (expenses only — loans tracked separately)
- Annual calendar with month breakdown modal
- Auto light/dark theme by time (6am–6pm light, 6pm–6am dark)
- Profile management

## Production notes

- Never commit `.env` files — only `.env.example`
- Set a strong `JWT_SECRET` in production
- Point `CLIENT_URL` to your deployed frontend URL
- Set `VITE_API_URL` to your deployed API URL when building the client

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `server/` | `npm run dev` | Start API with nodemon |
| `server/` | `npm start` | Start API (production) |
| `client/` | `npm run dev` | Start Vite dev server |
| `client/` | `npm run build` | Production build |

## License

Private / personal project.
