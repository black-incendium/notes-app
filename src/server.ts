import express from "express";
import path from "path";
import { addNote, loadNotes } from "./notes";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/notes", (req, res) => {
    res.json(loadNotes());
  });

  app.post("/api/notes", (req, res) => {
    const { title, content } = req.body;
    const note = addNote(title, content);
    res.json(note);
  });

  return app;
}