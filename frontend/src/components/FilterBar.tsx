import type { Priority } from "../types";

interface Props {
  value: Priority | "All";
  onChange: (value: Priority | "All") => void;
}

const OPTIONS: (Priority | "All")[] = ["All", "Low", "Medium", "High"];

export function FilterBar({ value, onChange }: Props) {
  return (
    <div className="filter-bar">
      <span className="filter-bar__label">Filter by priority:</span>
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          className={`filter-chip ${value === opt ? "filter-chip--active" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
