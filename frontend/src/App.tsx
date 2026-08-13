import { Board } from "./components/Board";

// Single-board app (per assignment scope: no multi-board/user management needed).
// Board #1 is created by the seed script.
const BOARD_ID = 1;

export default function App() {
  return <Board boardId={BOARD_ID} />;
}
