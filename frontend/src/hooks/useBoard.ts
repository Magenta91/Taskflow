import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { BoardWithColumns, CreateTaskInput, Priority, UpdateTaskInput } from "../types";

export function useBoard(boardId: number) {
  const [board, setBoard] = useState<BoardWithColumns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBoard(boardId);
      setBoard(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load board.");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    load();
  }, [load]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      setError(null);
      try {
        await api.createTask(input);
        await load();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to create task.");
        return false;
      }
    },
    [load]
  );

  const updateTask = useCallback(
    async (id: number, input: UpdateTaskInput) => {
      setError(null);
      try {
        await api.updateTask(id, input);
        await load();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to update task.");
        return false;
      }
    },
    [load]
  );

  const deleteTask = useCallback(
    async (id: number) => {
      setError(null);
      try {
        await api.deleteTask(id);
        await load();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to delete task.");
        return false;
      }
    },
    [load]
  );

  const moveTask = useCallback(
    async (id: number, columnId: number) => {
      setError(null);
      try {
        await api.moveTask(id, columnId);
        await load();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to move task.");
        return false;
      }
    },
    [load]
  );

  return {
    board,
    loading,
    error,
    priorityFilter,
    setPriorityFilter,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reload: load,
  };
}
