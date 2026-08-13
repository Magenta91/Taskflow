import type { Database } from "better-sqlite3";
import { BaseRepository } from "./base.repository";
import type { Board, BoardWithColumns, Column, Task } from "../types";

export class BoardRepository extends BaseRepository<Board> {
  constructor(db: Database) {
    super(db, "boards");
  }

  create(name: string): Board {
    const stmt = this.db.prepare(`INSERT INTO boards (name) VALUES (?)`);
    const result = stmt.run(name);
    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Fetch a board with its full column/task tree in three queries
   * (one per table) rather than N+1 queries per column.
   */
  getBoardWithColumns(boardId: number): BoardWithColumns | undefined {
    const board = this.findById(boardId);
    if (!board) return undefined;

    const columns = this.db
      .prepare(`SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC, id ASC`)
      .all(boardId) as Column[];

    const columnIds = columns.map((c) => c.id);
    let tasksByColumn = new Map<number, Task[]>();

    if (columnIds.length > 0) {
      const placeholders = columnIds.map(() => "?").join(", ");
      const tasks = this.db
        .prepare(`SELECT * FROM tasks WHERE column_id IN (${placeholders}) ORDER BY created_at DESC`)
        .all(...columnIds) as Task[];

      tasksByColumn = tasks.reduce((map, task) => {
        const list = map.get(task.column_id) ?? [];
        list.push(task);
        map.set(task.column_id, list);
        return map;
      }, new Map<number, Task[]>());
    }

    return {
      ...board,
      columns: columns.map((col) => ({
        ...col,
        tasks: tasksByColumn.get(col.id) ?? [],
      })),
    };
  }
}
