import { Router } from "express";
import db from "../db/connection";

import { BoardRepository } from "../repositories/board.repository";
import { ColumnRepository } from "../repositories/column.repository";
import { TaskRepository } from "../repositories/task.repository";

import { BoardService } from "../services/board.service";
import { ColumnService } from "../services/column.service";
import { TaskService } from "../services/task.service";

import { createBoardController } from "../controllers/board.controller";
import { createColumnController } from "../controllers/column.controller";
import { createTaskController } from "../controllers/task.controller";

// Wire up repositories -> services -> controllers once, here, so the rest
// of the app just imports a ready-to-use router.
const boardRepo = new BoardRepository(db);
const columnRepo = new ColumnRepository(db);
const taskRepo = new TaskRepository(db);

const boardService = new BoardService(boardRepo, columnRepo);
const columnService = new ColumnService(columnRepo);
const taskService = new TaskService(taskRepo, columnRepo);

const boardController = createBoardController(boardService);
const columnController = createColumnController(columnService);
const taskController = createTaskController(taskService);

const router = Router();

// Boards
router.get("/boards", boardController.listBoards);
router.post("/boards", boardController.createBoard);
router.get("/boards/:id", boardController.getBoard);

// Columns
router.get("/boards/:boardId/columns", columnController.listColumnsForBoard);
router.post("/boards/:boardId/columns", columnController.createColumn);

// Tasks
router.post("/tasks", taskController.createTask);
router.patch("/tasks/:id", taskController.updateTask);
router.delete("/tasks/:id", taskController.deleteTask);
router.patch("/tasks/:id/move", taskController.moveTask);

// Task queries scoped to a board
router.get("/boards/:boardId/tasks", taskController.queryTasks); // ?priority= or ?search=
router.get("/boards/:boardId/task-counts", taskController.taskCountsPerColumn);

export default router;
