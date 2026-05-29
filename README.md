# Fruitora

Fruitora is a premium full stack fruit nutrition platform with a cinematic React frontend and an Express/MongoDB backend. It includes fruit intelligence, live USDA nutrition lookup, detailed nutrition profiles, animated charts, cultural history, real map tiles, recipe recommendations, health personalization, JWT authentication, and an analytics dashboard that avoids fabricated numbers.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Chart.js, Leaflet
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- Architecture: REST API, cache wrappers, retrying API fetches, protected user profile routes, admin analytics route

## Project Structure

```text
frontend/
  src/components
  src/context
  src/pages
  src/styles
backend/
  src/config
  src/controllers
  src/data
  src/middleware
  src/models
  src/routes
```

## Quick Start

```bash
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:5173`  
Backend health: `http://localhost:5050/api/health`

The API works without MongoDB by using in-memory fruit knowledge and current-session analytics. For persistent accounts, analytics, and seedable collections, set `MONGODB_URI` in `backend/.env`.

## Data Sources And Accuracy

- Nutrition: live lookup uses USDA FoodData Central. The included `.env.example` uses `DEMO_KEY`, which is useful for testing but has low public rate limits. Get a real key for production.
- Trends: Google Trends API access is currently alpha/controlled. Fruitora supports a configurable `GOOGLE_TRENDS_API_URL`, but displays an unavailable state instead of fake trend scores when no authorized endpoint is configured.
- Analytics: dashboard totals come from MongoDB search/user events, or current server-session events if MongoDB is not connected. It does not display made-up users, searches, recipe views, or health trend percentages.
- Maps: Leaflet renders real geographic map tiles with borders. For India-recognized boundary compliance, configure `VITE_MAP_TILE_URL` to an approved tile provider used by your deployment policy.
- Static/cached knowledge: recipes, varieties, storage, safety guidance, cultural history, and biology are bundled because these change slowly. Expand these profiles with reviewed sources before medical or commercial claims.

## Seed MongoDB

```bash
npm run seed --prefix backend
```

Default seeded admin:

```text
email: admin@fruitora.app
password: AdminPass123
```

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/health-profile`
- `GET /api/fruits`
- `GET /api/fruits/trending`
- `GET /api/fruits/:slug`
- `GET /api/fruits/history`
- `GET /api/fruits/maps/production`
- `GET /api/recommendations/recipes`
- `POST /api/recommendations/health`
- `GET /api/analytics/overview`
- `GET /api/analytics/admin`

## Deployment

Frontend deployment:

- Build command: `npm run build --prefix frontend`
- Output directory: `frontend/dist`
- Env: `VITE_API_URL=https://your-api-domain.com/api`

Backend deployment:

- Start command: `npm start --prefix backend`
- Env: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `PORT`

## Notes

The UI intentionally uses remote Unsplash imagery and a CDN world atlas for production-grade visuals. If deploying in a locked-down environment, mirror these assets into your own CDN.
