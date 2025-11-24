// this handles login and register

import React, { useState } from "react";

export default function LoginForm({ mode, onSubmit, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ username, password });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{isRegister ? "Create account" : "Log in"}</h2>

      <label>
        Username
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </label>

      {error && <p className="error-text">{error}</p>}

      <button className="btn-primary" type="submit">
        {isRegister ? "Sign up" : "Log in"}
      </button>
    </form>
  );
}
