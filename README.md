# TaskFlow

A lightweight Trello-style task board. Board → Columns → Tasks, with a real SQLite
backend (not local state), server-side validation, and server-side filtering.

## Stack

- **Backend**: Node.js + Express + TypeScript, `better-sqlite3` (raw SQL, no ORM)
- **Frontend**: React + TypeScript + Vite
- **Database**: SQLite (file-based, `backend/data/taskflow.db`)
- **Tests**: Vitest (backend)

## Architecture

Backend follows a **base + worker** pattern at the repository and service layers, so
each layer's shared behavior lives in one place and entity-specific logic is isolated
in its own file — makes it much faster to find a bug ("is this a Task problem or a
generic-CRUD problem?").

```
backend/src/
  db/            schema.sql, connection.ts (opens db + applies schema), seed.ts
  repositories/  BaseRepository<T>  →  BoardRepository, ColumnRepository, TaskRepository
                 (generic find/create/delete in the base; raw SQL queries in the workers)
  services/      BaseService<T>     →  BoardService, ColumnService, TaskService
                 (shared "not found" handling in the base; validation + business
                 rules — e.g. "title can't be empty", "move task to valid column" —
                 in the workers)
  controllers/   thin — parse request, call service, shape response. Not base-classed
                 on purpose; Express handlers are simple enough that inheritance here
                 would just add indirection.
  routes/        wires repositories → services → controllers, registers endpoints
  middleware/    central error handler (ValidationError → 400, NotFoundError → 404,
                 anything else → 500 with a generic message)

frontend/src/
  api/client.ts  fetch wrapper; turns backend errors into a friendly ApiError
  hooks/useBoard.ts   all board state + CRUD calls, used by the Board component
  components/    Board, Column, TaskCard, TaskModal, FilterBar
```

## Database schema

See [`backend/src/db/schema.sql`](backend/src/db/schema.sql) for the full file. Summary:

```sql
CREATE TABLE boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE columns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  column_id INTEGER NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
);
```

Indexes on `columns.board_id`, `tasks.column_id`, `tasks.priority`.

### The two required non-trivial queries

Both live in `backend/src/repositories/task.repository.ts`:

- **`countTasksPerColumn(boardId)`** — `LEFT JOIN` + `GROUP BY`, count of tasks per
  column for a board (including empty columns).
- **`getTasksByPriority(boardId, priority)`** — `JOIN` through columns, filtered by
  priority, ordered newest first. This is what backs the UI's priority filter — it's
  a real query, not a client-side `.filter()` over an unfiltered fetch.

A third query, `searchTasksByTitle`, backs the (optional) title search.

## Setup — from a clean clone

Requires Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # defaults are fine for local dev
npm run seed                 # creates backend/data/taskflow.db with sample data
npm run dev                  # starts on http://localhost:4000
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
npm install
cp .env.example .env        # defaults point at http://localhost:4000/api
npm run dev                  # starts on http://localhost:5173
```

Open `http://localhost:5173`. Reload the page — your changes persist, since
everything is written to the SQLite file.

### 3. Tests

```bash
cd backend
npm test
```

Covers: rejecting an empty-title task, moving a task between columns, and a
DB-layer test asserting `countTasksPerColumn` returns correct counts against known
seed data, plus a priority-filter test.

## Decisions & assumptions

- **Single board, no board-switcher UI.** The assignment scope is one board; the API
  supports multiple boards (`POST /api/boards`), but the frontend hardcodes board
  `#1` (created by the seed script) since multi-board navigation wasn't asked for.
- **Move control is a dropdown**, per the assignment's explicit preference for a
  working dropdown over a broken drag-and-drop, given the time budget.
- **Priority stored as a `CHECK`-constrained TEXT column** rather than a separate
  lookup table — three fixed values didn't seem to warrant the extra join.
- **Schema re-applied on every server boot** (`CREATE TABLE IF NOT EXISTS`), so a
  fresh clone "just works" without a separate migration step.
- **Seed script is destructive** (wipes and reseeds) so it's safe to re-run at any
  point during development without accumulating duplicate data.

## Stretch goal: drag-and-drop

Implemented on top of the dropdown (which stays as the primary/accessible move
control — DnD is an addition, not a replacement). Drag a card onto a column to move
it there; the column highlights while a card is dragged over it. Uses plain HTML5
drag-and-drop (`draggable`, `onDragStart`/`onDragOver`/`onDrop`) — no extra library.

## What I'd improve with more time

- Board-switcher UI now that the API already supports multiple boards.
- Optimistic UI updates for move/delete instead of waiting on a full board refetch.
- Column reordering and creating/renaming columns from the UI (API has the pieces,
  UI doesn't expose it).

## Time spent

Roughly 4–5 hours across backend (schema, repositories/services, tests), frontend,
and this write-up.

## Something interesting

`better-sqlite3`'s synchronous API turned out to simplify the repository layer more
than expected — no `await` needed inside `db.prepare(...).run()`/`.get()`/`.all()`,
which made the base-class method signatures cleaner than they'd have been with an
async driver, without losing any real performance for a single-writer local SQLite
file like this.

## Deployment

- **Backend → Render**: web service, root `backend/`, build `npm install && npm run build`,
  start `npm run start`. Set `CORS_ORIGIN` to the deployed frontend URL. Note: Render's
  free tier has an ephemeral filesystem, so the SQLite file resets on redeploy/restart
  unless you attach a persistent disk (Render supports this on paid plans) — worth
  flagging if long-term data persistence in production matters.
- **Frontend →  Netlify**  Set `VITE_API_URL` to the deployed
  backend's `/api` URL as a build-time environment variable.
