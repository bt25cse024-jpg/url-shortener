# Shortform URL Shortener

A beginner-friendly URL shortener built with FastAPI, PostgreSQL, Redis, and React. It shortens long URLs, redirects them, and shows click analytics in a simple dashboard.

## Features

- Create short links from long URLs
- Redirect short links to the original destination
- Track total clicks and daily click trends
- Cache popular links in Redis for faster lookups
- Dashboard to search and inspect analytics
- Recent links panel for quick access

## Tech stack

- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- Cache: Redis
- Frontend: React + Vite
- Short code generation: Base62 encoding

## Project structure

- `backend/` – FastAPI app and database logic
- `frontend/` – React dashboard UI
- `docs/` – learning notes and project log

## Prerequisites

You need:

- Python 3.10+
- PostgreSQL running locally
- Redis running locally
- Node.js 18+

## Local setup

### 1) Start PostgreSQL

Make sure PostgreSQL is running and a database named `urlshortener` exists.

Example:

```sql
CREATE DATABASE urlshortener;
```

### 2) Start Redis

Make sure Redis is running on localhost.

### 3) Start the backend

```bash
cd backend
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 4) Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

### 5) Open the app

Visit:

```text
http://127.0.0.1:5173
```

## API endpoints

- `POST /shorten` – create a short link
- `GET /{short_code}` – redirect to the original URL
- `GET /stats/{short_code}` – get link analytics
- `GET /links/recent` – get recent links

## Notes

This project intentionally keeps things simple and beginner-friendly. It does not include login, user accounts, or ownership tracking.

## Learning goals

This project is a good example of:

- backend API design
- SQLAlchemy ORM usage
- PostgreSQL relationships
- Redis caching
- Base62 encoding
- frontend dashboard integration
- analytics tracking in a real app
