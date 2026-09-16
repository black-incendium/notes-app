import fs from "fs";
import path from "path";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const DATA_FILE = path.join(__dirname, "..", "data", "notes.json");

function ensureFile(): void {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
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

export function addNote(title: string, content: string): Note {
  const notes = loadNotes();
  const note: Note = {
    id: Date.now().toString(36),
    title,
    content,
    createdAt: new Date().toISOString(),
  };
  notes.push(note);
  saveNotes(notes);
  return note;
}