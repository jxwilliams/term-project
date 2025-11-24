// this is my main react file
// i handle login, logout, tasks, and quotes in here

import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import LoginForm from "./components/LoginForm.jsx";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/TaskList.jsx";
import { apiRequest } from "./api.js";

export default function App() {
  // i store username so i know who is logged in
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  // this holds all my tasks
  const [tasks, setTasks] = useState([]);

  // this stores task i am editing
  const [editingTask, setEditingTask] = useState(null);

  // this helps me switch login and register
  const [authMode, setAuthMode] = useState("login");

  // this shows login or register errors
  const [authError, setAuthError] = useState("");

  // this holds my quote and author
  const [quote, setQuote] = useState(null);

  // i check if token exists to see if user is logged in
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // when user logs in i load tasks and a quote
  useEffect(() => {
    if (isLoggedIn) {
      loadTasks();
      loadQuote();
    }
  }, [isLoggedIn]);

  // load all tasks from backend
  async function loadTasks() {
    try {
      const data = await apiRequest("/api/tasks");
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  }

  // load a quote — try my backend first, then fallback if needed
  async function loadQuote() {
    try {
      // try my own backend route first
      const data = await apiRequest("/api/motivation", { method: "GET" });
      setQuote(data);
      return; // if this works i stop here
    } catch (err) {
      console.error("my api quote failed", err);
    }

    try {
      // fallback directly to the public api if my backend fails
      const res = await fetch(
        "https://api.quotable.io/random?tags=education|inspirational"
      );
      const data = await res.json();

      setQuote({
        text: data.content,
        author: data.author
      });
    } catch (err) {
      console.error("fallback also failed", err);
    }
  }

  // handle login or register
  async function handleAuthSubmit({ username, password }) {
    try {
      setAuthError("");

      const path = authMode === "login" ? "/api/login" : "/api/register";

      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      // backend gives token and name
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      setUsername(data.username);
    } catch (err) {
      setAuthError(err.message);
    }
  }

  // logout the user
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername("");
    setTasks([]);
  }

  // save a new task or update an old one
  async function handleSaveTask(taskData) {
    try {
      if (editingTask) {
        // update task
        const updated = await apiRequest(`/api/tasks/${editingTask.id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...taskData,
            completed: editingTask.completed
          })
        });

        setTasks(tasks.map(t => (t.id === updated.id ? updated : t)));
        setEditingTask(null);
      } else {
        // add new task
        const created = await apiRequest("/api/tasks", {
          method: "POST",
          body: JSON.stringify(taskData)
        });

        setTasks([...tasks, created]);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  // toggle the completed box
  async function handleToggleComplete(task) {
    try {
      const updated = await apiRequest(`/api/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.due_date,
          completed: !task.completed
        })
      });

      setTasks(tasks.map(t => (t.id === updated.id ? updated : t)));
    } catch (err) {
      alert(err.message);
    }
  }

  // delete a task
  async function handleDeleteTask(task) {
    if (!confirm("delete this task")) return;

    try {
      await apiRequest(`/api/tasks/${task.id}`, {
        method: "DELETE"
      });

      setTasks(tasks.filter(t => t.id !== task.id));
    } catch (err) {
      alert(err.message);
    }
  }

  // full ui
  return (
    <div className="app">
      <Navbar username={username} onLogout={handleLogout} />

      <main className="main">
        {!isLoggedIn ? (
          <div className="auth-layout">
            <div className="auth-toggle">
              <button
                className={authMode === "login" ? "tab active" : "tab"}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>

              <button
                className={authMode === "register" ? "tab active" : "tab"}
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
            </div>

            <LoginForm mode={authMode} onSubmit={handleAuthSubmit} error={authError} />
          </div>
        ) : (
          <div className="dashboard">
            
            {/* this shows the quote card at the top */}
            {quote && (
              <section className="card quote-card">
                <p className="quote-text">"{quote.text}"</p>
                <p className="quote-author">- {quote.author}</p>
              </section>
            )}

            <section className="grid">
              <div>
                <TaskForm
                  editingTask={editingTask}
                  onSave={handleSaveTask}
                  onCancel={() => setEditingTask(null)}
                />
              </div>

              <div>
                <h2>Your study tasks</h2>
                <TaskList
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
