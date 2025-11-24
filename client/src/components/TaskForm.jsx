// this lets me add or edit a task

import React, { useState, useEffect } from "react";

export default function TaskForm({ onSave, editingTask, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setDueDate(editingTask.due_date ? editingTask.due_date.slice(0, 10) : "");
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  }, [editingTask]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ title, description, dueDate });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{editingTask ? "Edit task" : "Add task"}</h2>

      <label>
        Title
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </label>

      <label>
        Due date
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button className="btn-primary" type="submit">
          {editingTask ? "Save" : "Add"}
        </button>
        {editingTask && (
          <button
            className="btn-outline"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
