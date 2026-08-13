import type { Request, Response } from "express";
import { BoardService } from "../services/board.service";
import { asyncHandler } from "../middleware/error-handler";

export function createBoardController(boardService: BoardService) {
  const getBoard = asyncHandler(async (req: Request, res: Response) => {
    const boardId = Number(req.params.id);
    const board = boardService.getBoardWithColumns(boardId);
    res.json(board);
  });

  const listBoards = asyncHandler(async (_req: Request, res: Response) => {
    res.json(boardService.getAll());
  });

  const createBoard = asyncHandler(async (req: Request, res: Response) => {
    const board = boardService.createBoard(req.body.name);
    res.status(201).json(board);
  });

  return { getBoard, listBoards, createBoard };
}
