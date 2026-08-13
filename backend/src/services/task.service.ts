import { BaseService } from "./base.service";
import { TaskRepository } from "../repositories/task.repository";
import { ColumnRepository } from "../repositories/column.repository";
import {
  ValidationError,
  NotFoundError,
  type CreateTaskInput,
  type Priority,
  type Task,
  type UpdateTaskInput,
} from "../types";

const VALID_PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export class TaskService extends BaseService<Task> {
  private taskRepo: TaskRepository;
  private columnRepo: ColumnRepository;

  constructor(taskRepo: TaskRepository, columnRepo: ColumnRepository) {
    super(taskRepo, "Task");
    this.taskRepo = taskRepo;
    this.columnRepo = columnRepo;
  }

  private assertValidPriority(priority: string | undefined) {
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority as Priority)) {
      throw new ValidationError(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }
  }

  createTask(input: CreateTaskInput): Task {
    // Enforced here (backend), not just in the frontend form.
    if (!input.title || !input.title.trim()) {
      throw new ValidationError("Task title is required");
    }
    this.assertValidPriority(input.priority);

    const column = this.columnRepo.findById(input.column_id);
    if (!column) {
      throw new ValidationError(`Column with id ${input.column_id} does not exist`);
    }

    return this.taskRepo.create(input);
  }

  updateTask(id: number, fields: UpdateTaskInput): Task {
    this.getById(id); // throws NotFoundError if missing

    if (fields.title !== undefined && !fields.title.trim()) {
      throw new ValidationError("Task title cannot be empty");
    }
    this.assertValidPriority(fields.priority);

    return this.taskRepo.update(id, fields)!;
  }

  moveTask(id: number, columnId: number): Task {
    this.getById(id); // throws NotFoundError if missing

    const column = this.columnRepo.findById(columnId);
    if (!column) {
      throw new NotFoundError(`Column with id ${columnId} not found`);
    }

    return this.taskRepo.moveToColumn(id, columnId)!;
  }

  getTasksByColumnId(columnId: number): Task[] {
    return this.taskRepo.getTasksByColumnId(columnId);
  }

  countTasksPerColumn(boardId: number) {
    return this.taskRepo.countTasksPerColumn(boardId);
  }

  getTasksByPriority(boardId: number, priority: string): Task[] {
    this.assertValidPriority(priority);
    return this.taskRepo.getTasksByPriority(boardId, priority as Priority);
  }

  searchTasksByTitle(boardId: number, query: string): Task[] {
    if (!query || !query.trim()) return [];
    return this.taskRepo.searchTasksByTitle(boardId, query.trim());
  }
}
