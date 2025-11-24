// this is my main backend file

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { query } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// i let my react app talk to this server
app.use(cors());
// i let express read json bodies
app.use(express.json());

// simple auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "no token" });
  }

  const parts = authHeader.split(" ");
  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: "bad token format" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "token not valid" });
  }
}

// register route
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  try {
    const existing = await query("SELECT id FROM users WHERE username = $1", [username]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ message: "username taken" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, hashed]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, username: user.username });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ message: "server error" });
  }
});

// login route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await query(
      "SELECT id, username, password_hash FROM users WHERE username = $1",
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "invalid login" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ message: "invalid login" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ message: "server error" });
  }
});

// get tasks
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, title, description, due_date, completed FROM tasks WHERE user_id = $1 ORDER BY due_date",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("get tasks error", err);
    res.status(500).json({ message: "error getting tasks" });
  }
});

// create task
app.post("/api/tasks", authMiddleware, async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ message: "title required" });
  }

  try {
    const result = await query(
      "INSERT INTO tasks (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.userId, title, description || "", dueDate || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("create task error", err);
    res.status(500).json({ message: "error creating task" });
  }
});

// update task
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, completed } = req.body;

  try {
    const result = await query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           due_date = $3,
           completed = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, description || "", dueDate || null, completed ?? false, id, req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("update task error", err);
    res.status(500).json({ message: "error updating task" });
  }
});

// delete task
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "task not found" });
    }

    res.json({ message: "task deleted" });
  } catch (err) {
    console.error("delete task error", err);
    res.status(500).json({ message: "error deleting task" });
  }
});

// external api route
app.get("/api/motivation", async (req, res) => {
  try {
    const response = await fetch("https://api.quotable.io/random?tags=education|inspirational");
    const data = await response.json();
    res.json({
      text: data.content,
      author: data.author
    });
  } catch (err) {
    console.error("quote error", err);
    res.status(500).json({ message: "error getting quote" });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`server on port ${PORT}`);
});
