import express from "express";
import path from "path";
import { addNote, loadNotes, updateNote, deleteNote } from "./notes";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/notes", (req, res) => {
    res.json(loadNotes());
  });

  app.post("/api/notes", (req, res) => {
    const { title, content, tags } = req.body;
    const note = addNote(title ?? "Untitled", content ?? "", tags ?? {});
    res.json(note);
  });

  app.put("/api/notes/:id", (req, res) => {
    const id = Number(req.params.id);
    const { title, content, tags } = req.body;
    const note = updateNote(id, { title, content, tags });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  });

  app.delete("/api/notes/:id", (req, res) => {
    const id = Number(req.params.id);
    const ok = deleteNote(id);
    if (!ok) return res.status(404).json({ error: "Note not found" });
    res.status(204).send();
  });

  return app;
}