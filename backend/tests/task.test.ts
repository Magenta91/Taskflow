import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import { BoardRepository } from "../src/repositories/board.repository";
import { ColumnRepository } from "../src/repositories/column.repository";
import { TaskRepository } from "../src/repositories/task.repository";
import { BoardService } from "../src/services/board.service";
import { ColumnService } from "../src/services/column.service";
import { TaskService } from "../src/services/task.service";
import { ValidationError } from "../src/types";

// Fresh in-memory-ish SQLite file per test run, built from the real schema.sql
// (not a mock) so these tests actually exercise the DB layer.
const TEST_DB_PATH = path.join(__dirname, "test.db");

function freshDb() {
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  const db = new Database(TEST_DB_PATH);
  db.pragma("foreign_keys = ON");
  const schema = fs.readFileSync(path.join(__dirname, "../src/db/schema.sql"), "utf-8");
  db.exec(schema);
  return db;
}

describe("TaskFlow backend", () => {
  let db: Database.Database;
  let boardService: BoardService;
  let columnService: ColumnService;
  let taskService: TaskService;
  let boardId: number;
  let todoColumnId: number;
  let doneColumnId: number;

  beforeEach(() => {
    db = freshDb();
    const boardRepo = new BoardRepository(db);
    const columnRepo = new ColumnRepository(db);
    const taskRepo = new TaskRepository(db);

    boardService = new BoardService(boardRepo, columnRepo);
    columnService = new ColumnService(columnRepo);
    taskService = new TaskService(taskRepo, columnRepo);

    const board = boardService.createBoard("Test Board");
    boardId = board.id;
    todoColumnId = columnService.createColumn(boardId, "To Do", 0).id;
    doneColumnId = columnService.createColumn(boardId, "Done", 1).id;
  });

  afterEach(() => {
    if (db) db.close();
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  });

  // Required test 1: creating a task with no title fails
  it("rejects creating a task with an empty title", () => {
    expect(() =>
      taskService.createTask({ column_id: todoColumnId, title: "   " })
    ).toThrow(ValidationError);

    expect(() =>
      taskService.createTask({ column_id: todoColumnId, title: "" })
    ).toThrow(ValidationError);
  });

  // Required test 2: moving a task updates its status/column correctly
  it("moves a task to a new column", () => {
    const task = taskService.createTask({ column_id: todoColumnId, title: "Ship it" });
    expect(task.column_id).toBe(todoColumnId);

    const moved = taskService.moveTask(task.id, doneColumnId);
    expect(moved.column_id).toBe(doneColumnId);

    const refetched = taskService.getById(task.id);
    expect(refetched.column_id).toBe(doneColumnId);
  });

  // Required test 3: a test hitting the database layer directly
  it("counts tasks per column correctly against known seed data", () => {
    taskService.createTask({ column_id: todoColumnId, title: "A", priority: "High" });
    taskService.createTask({ column_id: todoColumnId, title: "B", priority: "Low" });
    taskService.createTask({ column_id: doneColumnId, title: "C", priority: "Medium" });

    const counts = taskService.countTasksPerColumn(boardId);
    const todoCount = counts.find((c) => c.column_id === todoColumnId);
    const doneCount = counts.find((c) => c.column_id === doneColumnId);

    expect(todoCount?.task_count).toBe(2);
    expect(doneCount?.task_count).toBe(1);
  });

  it("filters tasks by priority, newest first", () => {
    taskService.createTask({ column_id: todoColumnId, title: "Low one", priority: "Low" });
    const high1 = taskService.createTask({ column_id: todoColumnId, title: "High one", priority: "High" });
    const high2 = taskService.createTask({ column_id: doneColumnId, title: "High two", priority: "High" });

    const highs = taskService.getTasksByPriority(boardId, "High");
    expect(highs.map((t) => t.id).sort()).toEqual([high1.id, high2.id].sort());
    expect(highs.every((t) => t.priority === "High")).toBe(true);
  });
});
