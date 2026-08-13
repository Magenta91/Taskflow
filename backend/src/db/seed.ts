import db from "./connection";
import { BoardRepository } from "../repositories/board.repository";
import { ColumnRepository } from "../repositories/column.repository";
import { TaskRepository } from "../repositories/task.repository";

function seed() {
  // Wipe existing data so this script is safe to re-run.
  db.exec("DELETE FROM tasks; DELETE FROM columns; DELETE FROM boards;");
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('tasks','columns','boards');");

  const boardRepo = new BoardRepository(db);
  const columnRepo = new ColumnRepository(db);
  const taskRepo = new TaskRepository(db);

  const board = boardRepo.create("Product Launch");

  const todo = columnRepo.create(board.id, "To Do", 0);
  const inProgress = columnRepo.create(board.id, "In Progress", 1);
  const done = columnRepo.create(board.id, "Done", 2);

  taskRepo.create({
    column_id: todo.id,
    title: "Design onboarding flow",
    description: "Cover first-run experience and empty states",
    priority: "High",
  });
  taskRepo.create({
    column_id: todo.id,
    title: "Write landing page copy",
    priority: "Medium",
  });
  taskRepo.create({
    column_id: todo.id,
    title: "Research competitor pricing",
    priority: "Low",
  });
  taskRepo.create({
    column_id: inProgress.id,
    title: "Build auth API",
    description: "JWT-based auth with refresh tokens",
    priority: "High",
  });
  taskRepo.create({
    column_id: inProgress.id,
    title: "Set up CI pipeline",
    priority: "Medium",
  });
  taskRepo.create({
    column_id: done.id,
    title: "Choose tech stack",
    priority: "Medium",
  });
  taskRepo.create({
    column_id: done.id,
    title: "Set up repo & project board",
    priority: "Low",
  });

  console.log(`Seeded board #${board.id} "${board.name}" with 3 columns and 7 tasks.`);
}

seed();
