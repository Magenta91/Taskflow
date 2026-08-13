# TaskFlow

A lightweight Trello-style task board — Board → Columns → Tasks, backed by a real SQLite database with server-side validation and filtering.

## Live demo

- **App**: https://taskflow91.netlify.app/
- **API**: https://taskflow-znt2.onrender.com
- **Repo**: https://github.com/Magenta91/Taskflow

> Backend is on Render's free tier and spins down when idle — first load after a while can take ~30-50s to wake up.

## Stack

- **Backend**: Node.js + Express + TypeScript, `better-sqlite3` (raw SQL, no ORM)
- **Frontend**: React + TypeScript + Vite
- **Tests**: Vitest

## Architecture

Backend uses a **base + worker** pattern at the repository and service layers — shared CRUD/validation logic lives in a base class, entity-specific logic (queries, business rules) lives in `Board`/`Column`/`Task` subclasses. Keeps bugs easy to isolate: "is this a Task problem or a generic-CRUD problem?"

```
backend/src/
  db/            schema.sql, connection.ts, seed.ts
  repositories/  BaseRepository → Board/Column/TaskRepository (raw SQL queries)
  services/      BaseService → Board/Column/TaskService (validation, business rules)
  controllers/   thin — request in, service call, response out
  routes/        wires it all together
  middleware/    central error handler (ValidationError→400, NotFoundError→404)

frontend/src/
  api/client.ts  fetch wrapper, turns backend errors into friendly messages
  hooks/useBoard.ts   board state + CRUD calls
  components/    Board, Column, TaskCard, TaskModal, FilterBar
```

## Database

Board → Columns → Tasks, with FKs, `NOT NULL`, and a `CHECK` on title/priority. Full schema in [`backend/src/db/schema.sql`](backend/src/db/schema.sql).

Two required non-trivial queries (in `task.repository.ts`):
- `countTasksPerColumn(boardId)` — `LEFT JOIN` + `GROUP BY`
- `getTasksByPriority(boardId, priority)` — `JOIN` through columns, newest first

## Setup — from a clean clone

Requires Node.js 18+.

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run seed        # creates backend/data/taskflow.db with sample data
npm run dev          # http://localhost:4000

# Frontend (second terminal)
cd frontend
npm install
cp .env.example .env
npm run dev           # http://localhost:5173
```

Tests: `cd backend && npm test`

## Decisions & assumptions

- Single board, hardcoded to board `#1` from the seed script — API supports multiple boards, UI doesn't expose switching.
- Move control is a dropdown (per the brief's preference), with drag-and-drop added on top as the stretch goal — dropdown stays as the primary/accessible option.
- Priority is a `CHECK`-constrained TEXT column, not a lookup table — three fixed values didn't need the extra join.
- Seed script only seeds an empty database — safe to leave in the production start command without wiping real data on every restart.

## What I'd improve with more time

- Board-switcher UI, optimistic UI updates instead of full refetch on every action, column reordering/renaming from the UI.

## Time spent

~[X] hours: schema + repository/service layer, task API + validation, frontend (board/modal/filter/DnD), tests, and deployment.

## Something interesting

Render's free tier restarts the app on every cold start, and my `startCommand` ran the seed script on every boot — which wipes the DB. Locally that's harmless (I only ever ran it on purpose); in production it was silently deleting real data every time the service went idle and woke back up. Fixed by making seed skip itself if the database isn't empty.

## Deployment

- **Backend → Render**: web service, root `backend/`, build `npm install && npm run build`, start `npm run seed && npm start`. Set `CORS_ORIGIN` to the Netlify URL.
- **Frontend → Netlify**: base `frontend/`, build `npm run build`, publish `dist`. Set `VITE_API_URL` to the Render backend's `/api` URL.
