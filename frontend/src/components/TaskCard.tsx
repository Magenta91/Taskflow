import type { ColumnWithTasks, Task } from "../types";

interface Props {
  task: Task;
  columns: ColumnWithTasks[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onMove: (id: number, columnId: number) => void;
}

const PRIORITY_CLASS: Record<string, string> = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
};

export function TaskCard({ task, columns, onEdit, onDelete, onMove }: Props) {
  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="task-card__header">
        <span className={`priority-badge ${PRIORITY_CLASS[task.priority]}`}>{task.priority}</span>
        <div className="task-card__actions">
          <button aria-label="Edit task" onClick={() => onEdit(task)}>✎</button>
          <button aria-label="Delete task" onClick={() => onDelete(task.id)}>✕</button>
        </div>
      </div>
      <p className="task-card__title">{task.title}</p>
      {task.description && <p className="task-card__desc">{task.description}</p>}

      <select
        className="task-card__move"
        value={task.column_id}
        onChange={(e) => onMove(task.id, Number(e.target.value))}
      >
        {columns.map((col) => (
          <option key={col.id} value={col.id}>
            Move to: {col.name}
          </option>
        ))}
      </select>
    </div>
  );
}
