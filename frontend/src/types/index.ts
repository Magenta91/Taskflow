export type Priority = "Low" | "Medium" | "High";

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: Priority;
  created_at: string;
}

export interface ColumnWithTasks {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: string;
  tasks: Task[];
}

export interface BoardWithColumns {
  id: number;
  name: string;
  created_at: string;
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
