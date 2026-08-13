import type { Request, Response } from "express";
import { ColumnService } from "../services/column.service";
import { asyncHandler } from "../middleware/error-handler";

export function createColumnController(columnService: ColumnService) {
  const listColumnsForBoard = asyncHandler(async (req: Request, res: Response) => {
    const boardId = Number(req.params.boardId);
    res.json(columnService.getColumnsByBoardId(boardId));
  });

  const createColumn = asyncHandler(async (req: Request, res: Response) => {
    const boardId = Number(req.params.boardId);
    const { name, position } = req.body;
    const column = columnService.createColumn(boardId, name, position ?? 0);
    res.status(201).json(column);
  });

  return { listColumnsForBoard, createColumn };
}
