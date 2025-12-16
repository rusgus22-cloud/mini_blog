import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());



app.get("/api/posts", (req, res) => {
  db.all("SELECT * FROM posts", (err, rows) => {
    res.json(rows);
  });
});

app.post("/api/posts", (req, res) => {
  const { title, content, author } = req.body;

  db.run(
    "INSERT INTO posts (title, content, author) VALUES (?, ?, ?)",
    [title, content, author],
    () => res.sendStatus(200)
  );
});

app.delete("/api/posts/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM comments WHERE postId = ?", [id], () => {
    db.run("DELETE FROM posts WHERE id = ?", [id], () => {
      res.sendStatus(200);
    });
  });
});



app.get("/api/comments/:postId", (req, res) => {
  db.all(
    "SELECT * FROM comments WHERE postId = ?",
    [req.params.postId],
    (err, rows) => res.json(rows)
  );
});

app.post("/api/comments", (req, res) => {
  const { postId, author, text, parentId } = req.body;

  db.run(
    "INSERT INTO comments (postId, author, text, parentId) VALUES (?, ?, ?, ?)",
    [postId, author, text, parentId || null],
    () => res.sendStatus(200)
  );
});



app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(3001, () => {
  console.log("Server działa na http://localhost:3001");
});
