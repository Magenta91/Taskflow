import type { BoardWithColumns, CreateTaskInput, Task, UpdateTaskInput } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Thrown so callers can show a friendly message instead of a blank screen
// or a raw console error.
export class ApiError extends Error {}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new ApiError(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  getBoard: (boardId: number) => request<BoardWithColumns>(`/boards/${boardId}`),

  createTask: (input: CreateTaskInput) =>
    request<Task>(`/tasks`, { method: "POST", body: JSON.stringify(input) }),

  updateTask: (id: number, input: UpdateTaskInput) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) }),

  deleteTask: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),

  moveTask: (id: number, columnId: number) =>
    request<Task>(`/tasks/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify({ columnId }),
    }),

  getTasksByPriority: (boardId: number, priority: string) =>
    request<Task[]>(`/boards/${boardId}/tasks?priority=${encodeURIComponent(priority)}`),

  searchTasks: (boardId: number, query: string) =>
    request<Task[]>(`/boards/${boardId}/tasks?search=${encodeURIComponent(query)}`),
};
