export type Priority = "Low" | "Medium" | "High";

export interface Board {
  id: number;
  name: string;
  created_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: string;
}

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: Priority;
  created_at: string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface BoardWithColumns extends Board {
  columns: ColumnWithTasks[];
}

export interface CreateTaskInput {
  column_id: number;
  title: string;
  description?: string | null;
  priority?: Priority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
}

// Thrown by services on bad input; middleware turns this into a 400.
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Thrown when a lookup by id fails; middleware turns this into a 404.
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
