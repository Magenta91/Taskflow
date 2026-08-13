import { BaseService } from "./base.service";
import { ColumnRepository } from "../repositories/column.repository";
import { ValidationError, type Column } from "../types";

export class ColumnService extends BaseService<Column> {
  private columnRepo: ColumnRepository;

  constructor(columnRepo: ColumnRepository) {
    super(columnRepo, "Column");
    this.columnRepo = columnRepo;
  }

  createColumn(boardId: number, name: string, position: number): Column {
    if (!name || !name.trim()) {
      throw new ValidationError("Column name is required");
    }
    return this.columnRepo.create(boardId, name.trim(), position);
  }

  getColumnsByBoardId(boardId: number): Column[] {
    return this.columnRepo.getColumnsByBoardId(boardId);
  }
}
