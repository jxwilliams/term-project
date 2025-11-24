// this shows my tasks

import React from "react";

export default function TaskList({ tasks, onToggleComplete, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return <p className="muted">I do not have any tasks yet</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <li key={task.id} className={`task-item ${task.completed ? "done" : ""}`}>
          <div className="task-main">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task)}
            />
            <div>
              <h3>{task.title}</h3>
              {task.description && <p className="task-desc">{task.description}</p>}
              {task.due_date && (
                <p className="task-due">
                  Due {new Date(task.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="task-actions">
            <button className="btn-small" onClick={() => onEdit(task)}>
              Edit
            </button>
            <button className="btn-small danger" onClick={() => onDelete(task)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
