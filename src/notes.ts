import fs from "fs";
import path from "path";

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: Record<string, string | boolean>;
  createdAt: string;
  updatedAt: string;
}

const DATA_FILE = path.join(__dirname, "..", "data", "notes.json");

function ensureFile(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE) || fs.readFileSync(DATA_FILE, "utf-8").trim() === "") {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

export function loadNotes(): Note[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

export function saveNotes(notes: Note[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), "utf-8");
}

export function addNote(
  title: string,
  content: string,
  tags: Record<string, string | boolean> = {}
): Note {
  const notes = loadNotes();
  const now = new Date().toISOString();
  const note: Note = {
    id: notes.length,
    title,
    content,
    tags,
    createdAt: now,
    updatedAt: now,
  };
  notes.push(note);
  saveNotes(notes);
  return note;
}

export function updateNote(
  id: number,
  updates: Partial<Pick<Note, "title" | "content" | "tags">>
): Note | null {
  const notes = loadNotes();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return null;

  const existing = notes[index]!;
  const updated: Note = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  notes[index] = updated;
  saveNotes(notes);
  return updated;
}

export function deleteNote(id: number): boolean {
  const notes = loadNotes();
  const filtered = notes.filter((n) => n.id !== id);
  if (filtered.length === notes.length) return false;
  // re-id remaining notes so id keeps matching array position
  const reindexed = filtered.map((n, i) => ({ ...n, id: i }));
  saveNotes(reindexed);
  return true;
}