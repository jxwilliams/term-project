// this is my top bar

import React from "react";

export default function Navbar({ username, onLogout }) {
  return (
    <nav className="nav">
      <h1 className="logo">Study Buddy</h1>
      <div className="nav-right">
        {username && <span className="nav-username">Hi {username}</span>}
        {username && (
          <button className="btn-outline" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
