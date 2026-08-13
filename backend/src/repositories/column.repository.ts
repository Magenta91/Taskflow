import type { Database } from "better-sqlite3";
import { BaseRepository } from "./base.repository";
import type { Column } from "../types";

export class ColumnRepository extends BaseRepository<Column> {
  constructor(db: Database) {
    super(db, "columns");
  }

  create(boardId: number, name: string, position: number): Column {
    const stmt = this.db.prepare(
      `INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)`
    );
    const result = stmt.run(boardId, name, position);
    return this.findById(result.lastInsertRowid as number)!;
  }

  getColumnsByBoardId(boardId: number): Column[] {
    const stmt = this.db.prepare(
      `SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC, id ASC`
    );
    return stmt.all(boardId) as Column[];
  }
}
