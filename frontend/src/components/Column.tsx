import { useState } from "react";
import type { ColumnWithTasks, Priority, Task } from "../types";
import { TaskCard } from "./TaskCard";

interface Props {
  column: ColumnWithTasks;
  allColumns: ColumnWithTasks[];
  priorityFilter: Priority | "All";
  onAddTask: (columnId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onMoveTask: (id: number, columnId: number) => void;
}

export function Column({
  column,
  allColumns,
  priorityFilter,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  const visibleTasks =
    priorityFilter === "All" ? column.tasks : column.tasks.filter((t) => t.priority === priorityFilter);

  // Drag-and-drop stretch goal, layered on top of the dropdown (which stays
  // as the primary/accessible way to move a task — DnD is an alternative,
  // not a replacement).
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = Number(e.dataTransfer.getData("text/plain"));
    if (!taskId) return;
    onMoveTask(taskId, column.id);
  }

  return (
    <div
      className={`column ${isDragOver ? "column--drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column__header">
        <h3>{column.name}</h3>
        <span className="column__count">{visibleTasks.length}</span>
      </div>

      <div className="column__tasks">
        {visibleTasks.length === 0 && <p className="column__empty">No tasks here.</p>}
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columns={allColumns}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onMove={onMoveTask}
          />
        ))}
      </div>

      <button className="column__add-btn" onClick={() => onAddTask(column.id)}>
        + Add task
      </button>
    </div>
  );
}
