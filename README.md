# pentaclan-vivienda-be

Backend monorepo for Pentaclan Vivienda.

- Node.js 22 LTS + TypeScript (ESM)
- Express REST API
- npm workspaces
- MySQL/MariaDB via Sequelize
- JWT authentication (access + refresh, hashed refresh tokens in DB)

## Layout

```
apps/
  api/             # Main backend (Express + Sequelize)
packages/
  shared/          # Shared types/constants (@pentaclan/shared)
docker-compose.yml # MariaDB for local development
```

## Prerequisites

- Node.js 22.x
- npm 10+
- Docker (for the bundled MariaDB) or any MySQL/MariaDB 10.4+

## Setup

```bash
npm install

cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env and set, at minimum:
#   JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
#   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD

# Start MariaDB
docker compose up -d
```

## Database

```bash
# Run migrations
npm run db:migrate --workspace=apps/api

# Run seeders (creates the admin user from ADMIN_* env vars)
npm run db:seed --workspace=apps/api

# Rollback last migration
npm run db:migrate:undo --workspace=apps/api
```

## Develop

```bash
# Start the API in watch mode (tsx)
npm run dev
```

The server listens on `http://localhost:3000` by default.

- Health check: `GET /health`
- API docs (Swagger UI): `http://localhost:3000/docs`

## Build & Run (production)

```bash
npm run build
npm start
```

## Scripts

Root:

| Script        | Description                                  |
|---------------|----------------------------------------------|
| `npm run dev`     | Run API in dev (tsx watch)               |
| `npm run build`   | Build all workspaces                     |
| `npm start`       | Start the built API                      |
| `npm run lint`    | Lint all workspaces                      |
| `npm run format`  | Format with Prettier                     |
| `npm test`        | Run API tests                            |
| `npm run clean`   | Remove build artifacts                   |

`apps/api`:

| Script                  | Description                              |
|-------------------------|------------------------------------------|
| `dev`                   | `tsx watch src/server.ts`                |
| `build`                 | `tsc -p tsconfig.json`                   |
| `start`                 | `node dist/server.js`                    |
| `test`                  | Jest                                     |
| `test:watch`            | Jest watch                               |
| `test:coverage`         | Jest with coverage                       |
| `db:migrate`            | Run pending migrations                   |
| `db:migrate:undo`       | Rollback last migration                  |
| `db:seed`               | Run all seeders                          |
| `migration:create NAME` | Generate a new migration file            |
| `seeder:create NAME`    | Generate a new seeder file               |

## Auth quick reference

| Method | Path             | Auth |
|--------|------------------|------|
| POST   | `/auth/login`    | -    |
| POST   | `/auth/refresh`  | -    |
| POST   | `/auth/logout`   | Bearer access token |
| GET    | `/auth/me`       | Bearer access token |

## Architecture

Pragmatic Clean Architecture under `apps/api/src`:

- `domain/`         entities, repository interfaces, domain types
- `application/`    use cases and application services
- `infrastructure/` Sequelize models/repositories, storage adapters
- `interfaces/http/` Express routes, controllers, middlewares, validators, Swagger
- `shared/`         errors, HTTP helpers, env config
- `modules/`        placeholder folders for upcoming modules (clients, files, reports)

### Naming convention

Identifiers, database objects, routes and file names are in English; comments
and internal docs are in Spanish. Read
[docs/CONVENCIONES-DE-NOMENCLATURA.md](docs/CONVENCIONES-DE-NOMENCLATURA.md)
before adding a new module.

## Module status

| Module    | Status                                       |
|-----------|----------------------------------------------|
| Auth      | Implemented (login/refresh/logout/me)        |
| Projects  | Implemented (create/read/update, audited creator) |
| Geography | Implemented (read-only catalog, seeded)      |
| Public entities | Implemented (read-only catalog, seeded) |
| Clients   | Placeholder (returns 501)                    |
| Files     | Placeholder, S3 adapter scaffolded           |
| Reports   | Placeholder (returns 501)                    |
