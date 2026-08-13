import type { Database } from "better-sqlite3";

/**
 * BaseRepository — generic CRUD against a single table.
 *
 * Every entity-specific repository (BoardRepository, ColumnRepository,
 * TaskRepository) extends this instead of reimplementing find/create/update/
 * delete. That means: any bug in "how we insert a row" or "how we fetch by
 * id" only has ONE place to look, regardless of which entity is misbehaving.
 * Entity-specific queries (the interesting SQL) live in the subclasses.
 */
export abstract class BaseRepository<T> {
  protected db: Database;
  protected tableName: string;

  constructor(db: Database, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  findById(id: number): T | undefined {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    return stmt.get(id) as T | undefined;
  }

  findAll(): T[] {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    return stmt.all() as T[];
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Generic column-value update. Subclasses call this with a whitelist of
   * fields so callers can never inject arbitrary column names.
   */
  protected updateFields(id: number, fields: Record<string, unknown>): T | undefined {
    const keys = Object.keys(fields);
    if (keys.length === 0) return this.findById(id);

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => fields[k]);
    const stmt = this.db.prepare(`UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);
    return this.findById(id);
  }
}
