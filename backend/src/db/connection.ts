import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../data/taskflow.db");

// Make sure the folder for the db file exists (fresh clone won't have /data yet).
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

// Apply schema on every boot. Idempotent thanks to IF NOT EXISTS, so this is
// safe to run on a fresh clone as well as on every server restart.
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

export default db;
