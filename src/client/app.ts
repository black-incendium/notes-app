interface Note {
  id: number;
  title: string;
  content: string;
  tags: Record<string, string | boolean>;
  createdAt: string;
  updatedAt: string;
}

let notes: Note[] = [];
let activeId: number | null = null;
let saveTimeout: ReturnType<typeof setTimeout> | undefined;

const noteList = document.getElementById("noteList") as HTMLUListElement;
const contentArea = document.getElementById("content") as HTMLTextAreaElement;
const tagsInput = document.getElementById("tagsInput") as HTMLInputElement;
const newNoteBtn = document.getElementById("newNoteBtn") as HTMLButtonElement;

async function fetchNotes(): Promise<void> {
  const res = await fetch("/api/notes");
  notes = await res.json();
  renderList();
}

function renderList(): void {
  noteList.innerHTML = "";
  notes
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .forEach((note) => {
      const li = document.createElement("li");
      li.textContent = note.title || "Untitled";
      if (note.id === activeId) li.classList.add("active");
      li.addEventListener("click", () => selectNote(note.id));
      noteList.appendChild(li);
    });
}

function selectNote(id: number): void {
  activeId = id;
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  contentArea.value = note.content || "";
  tagsInput.value = tagsToString(note.tags || {});
  renderList();
  contentArea.focus();
}

function tagsToString(tags: Record<string, string | boolean>): string {
  return Object.entries(tags)
    .map(([key, value]) => (value === true ? key : `${key}: ${value}`))
    .join(", ");
}

function parseTags(input: string): Record<string, string | boolean> {
  const tags: Record<string, string | boolean> = {};
  input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const [key, ...rest] = part.split(":");
      const trimmedKey = (key ?? "").trim();
      if (!trimmedKey) return;
      if (rest.length === 0) {
        tags[trimmedKey] = true;
      } else {
        const value = rest.join(":").trim();
        if (value === "true") tags[trimmedKey] = true;
        else if (value === "false") tags[trimmedKey] = false;
        else tags[trimmedKey] = value;
      }
    });
  return tags;
}

function scheduleSave(): void {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => void saveActiveNote(), 500);
}

async function saveActiveNote(): Promise<void> {
  if (activeId === null) return;
  const content = contentArea.value;
  const title = deriveTitle(content);
  const tags = parseTags(tagsInput.value);

  const res = await fetch(`/api/notes/${activeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, tags }),
  });
  const updated: Note = await res.json();

  const idx = notes.findIndex((n) => n.id === activeId);
  if (idx !== -1) notes[idx] = updated;
  renderList();
}

function deriveTitle(content: string): string {
  const firstLine = content.split("\n")[0]?.trim() ?? "";
  return firstLine.slice(0, 60) || "Untitled";
}

async function createNote(): Promise<void> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Untitled", content: "", tags: {} }),
  });
  const note: Note = await res.json();
  notes.push(note);
  selectNote(note.id);
}

contentArea.addEventListener("input", scheduleSave);
tagsInput.addEventListener("input", scheduleSave);
newNoteBtn.addEventListener("click", () => void createNote());

void fetchNotes();