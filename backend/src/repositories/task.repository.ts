import type { Database } from "better-sqlite3";
import { BaseRepository } from "./base.repository";
import type { CreateTaskInput, Priority, Task, UpdateTaskInput } from "../types";

export class TaskRepository extends BaseRepository<Task> {
  constructor(db: Database) {
    super(db, "tasks");
  }

  create(input: CreateTaskInput): Task {
    const stmt = this.db.prepare(
      `INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)`
    );
    const result = stmt.run(
      input.column_id,
      input.title.trim(),
      input.description ?? null,
      input.priority ?? "Medium"
    );
    return this.findById(result.lastInsertRowid as number)!;
  }

  update(id: number, fields: UpdateTaskInput): Task | undefined {
    const patch: Record<string, unknown> = {};
    if (fields.title !== undefined) patch.title = fields.title.trim();
    if (fields.description !== undefined) patch.description = fields.description;
    if (fields.priority !== undefined) patch.priority = fields.priority;
    return this.updateFields(id, patch);
  }

  moveToColumn(id: number, columnId: number): Task | undefined {
    return this.updateFields(id, { column_id: columnId });
  }

  getTasksByColumnId(columnId: number): Task[] {
    const stmt = this.db.prepare(
      `SELECT * FROM tasks WHERE column_id = ? ORDER BY created_at DESC`
    );
    return stmt.all(columnId) as Task[];
  }

  /**
   * Required query #1: count of tasks per column, for a given board.
   * Real aggregate SQL — not fetch-everything-then-count-in-JS.
   */
  countTasksPerColumn(boardId: number): { column_id: number; column_name: string; task_count: number }[] {
    const stmt = this.db.prepare(`
      SELECT c.id AS column_id, c.name AS column_name, COUNT(t.id) AS task_count
      FROM columns c
      LEFT JOIN tasks t ON t.column_id = c.id
      WHERE c.board_id = ?
      GROUP BY c.id, c.name
      ORDER BY c.position ASC, c.id ASC
    `);
    return stmt.all(boardId) as { column_id: number; column_name: string; task_count: number }[];
  }

  /**
   * Required query #2: tasks with a given priority, newest first, scoped to
   * a board (joins through columns since priority/board aren't directly
   * related in the tasks table).
   */
  getTasksByPriority(boardId: number, priority: Priority): Task[] {
    const stmt = this.db.prepare(`
      SELECT t.*
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      WHERE c.board_id = ? AND t.priority = ?
      ORDER BY t.created_at DESC
    `);
    return stmt.all(boardId, priority) as Task[];
  }

  /**
   * Nice-to-have text search by title, scoped to a board.
   */
  searchTasksByTitle(boardId: number, query: string): Task[] {
    const stmt = this.db.prepare(`
      SELECT t.*
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      WHERE c.board_id = ? AND t.title LIKE ?
      ORDER BY t.created_at DESC
    `);
    return stmt.all(boardId, `%${query}%`) as Task[];
  }
}
