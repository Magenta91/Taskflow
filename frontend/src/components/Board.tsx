import { useState } from "react";
import { useBoard } from "../hooks/useBoard";
import { Column } from "./Column";
import { FilterBar } from "./FilterBar";
import { TaskModal } from "./TaskModal";
import type { Priority, Task } from "../types";

interface Props {
  boardId: number;
}

export function Board({ boardId }: Props) {
  const {
    board,
    loading,
    error,
    priorityFilter,
    setPriorityFilter,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useBoard(boardId);

  const [modalState, setModalState] = useState<
    | { mode: "create"; columnId: number }
    | { mode: "edit"; task: Task }
    | null
  >(null);

  if (loading) return <div className="board-status">Loading board...</div>;

  if (error && !board) {
    return (
      <div className="board-status board-status--error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!board) return null;

  async function handleModalSubmit(data: { title: string; description: string; priority: Priority }) {
    if (!modalState) return false;
    if (modalState.mode === "create") {
      return createTask({
        column_id: modalState.columnId,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
      });
    }
    return updateTask(modalState.task.id, {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
    });
  }

  async function handleDelete(id: number) {
    if (window.confirm("Delete this task?")) {
      await deleteTask(id);
    }
  }

  return (
    <div className="board">
      <header className="board__header">
        <h1>{board.name}</h1>
        <FilterBar value={priorityFilter} onChange={setPriorityFilter} />
      </header>

      {error && <div className="banner banner--error">{error}</div>}

      <div className="board__columns">
        {board.columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            allColumns={board.columns}
            priorityFilter={priorityFilter}
            onAddTask={(columnId) => setModalState({ mode: "create", columnId })}
            onEditTask={(task) => setModalState({ mode: "edit", task })}
            onDeleteTask={handleDelete}
            onMoveTask={moveTask}
          />
        ))}
      </div>

      {modalState && (
        <TaskModal
          initialTask={modalState.mode === "edit" ? modalState.task : null}
          onClose={() => setModalState(null)}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
}
