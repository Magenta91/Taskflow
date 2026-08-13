import type { Request, Response } from "express";
import { TaskService } from "../services/task.service";
import { asyncHandler } from "../middleware/error-handler";

export function createTaskController(taskService: TaskService) {
  const createTask = asyncHandler(async (req: Request, res: Response) => {
    const task = taskService.createTask(req.body);
    res.status(201).json(task);
  });

  const updateTask = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const task = taskService.updateTask(id, req.body);
    res.json(task);
  });

  const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    taskService.delete(id);
    res.status(204).send();
  });

  const moveTask = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { columnId } = req.body;
    const task = taskService.moveTask(id, columnId);
    res.json(task);
  });

  // GET /boards/:boardId/tasks?priority=High&search=foo
  const queryTasks = asyncHandler(async (req: Request, res: Response) => {
    const boardId = Number(req.params.boardId);
    const { priority, search } = req.query;

    if (typeof priority === "string") {
      return res.json(taskService.getTasksByPriority(boardId, priority));
    }
    if (typeof search === "string") {
      return res.json(taskService.searchTasksByTitle(boardId, search));
    }
    return res.status(400).json({ error: "Provide a priority or search query parameter" });
  });

  const taskCountsPerColumn = asyncHandler(async (req: Request, res: Response) => {
    const boardId = Number(req.params.boardId);
    res.json(taskService.countTasksPerColumn(boardId));
  });

  return { createTask, updateTask, deleteTask, moveTask, queryTasks, taskCountsPerColumn };
}
