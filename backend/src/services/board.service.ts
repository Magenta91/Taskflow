import { BaseService } from "./base.service";
import { BoardRepository } from "../repositories/board.repository";
import { ColumnRepository } from "../repositories/column.repository";
import { ValidationError, NotFoundError, type Board, type BoardWithColumns } from "../types";

export class BoardService extends BaseService<Board> {
  private boardRepo: BoardRepository;
  private columnRepo: ColumnRepository;

  constructor(boardRepo: BoardRepository, columnRepo: ColumnRepository) {
    super(boardRepo, "Board");
    this.boardRepo = boardRepo;
    this.columnRepo = columnRepo;
  }

  createBoard(name: string): Board {
    if (!name || !name.trim()) {
      throw new ValidationError("Board name is required");
    }
    return this.boardRepo.create(name.trim());
  }

  getBoardWithColumns(boardId: number): BoardWithColumns {
    const board = this.boardRepo.getBoardWithColumns(boardId);
    if (!board) {
      throw new NotFoundError(`Board with id ${boardId} not found`);
    }
    return board;
  }
}
