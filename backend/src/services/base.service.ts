import { BaseRepository } from "../repositories/base.repository";
import { NotFoundError } from "../types";

/**
 * BaseService — thin wrapper around a repository that adds the one thing
 * every entity needs: "find it or throw a 404-shaped error". Entity-specific
 * services extend this and add their own validation + business rules
 * (e.g. TaskService enforces non-empty titles, ColumnService checks a task
 * actually belongs to the target board before moving it).
 *
 * Centralizing "not found" handling here means a missing-row bug looks and
 * behaves the same way across boards/columns/tasks, which is the point of
 * troubleshooting-friendly base classes: one place to fix, one place to check.
 */
export abstract class BaseService<T> {
  protected repository: BaseRepository<T>;
  protected entityName: string;

  constructor(repository: BaseRepository<T>, entityName: string) {
    this.repository = repository;
    this.entityName = entityName;
  }

  getById(id: number): T {
    const entity = this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
    return entity;
  }

  getAll(): T[] {
    return this.repository.findAll();
  }

  delete(id: number): void {
    const existed = this.repository.delete(id);
    if (!existed) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
  }
}
