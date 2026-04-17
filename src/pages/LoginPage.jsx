import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../styles/responsive.css";

const roles = [
  { value: "professor", label: "Professor" },
  { value: "student", label: "Student" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  // 🔥 If already logged in → redirect automatically
  useEffect(() => {
    if (user) {
      if (user.role === "professor") navigate("/lecturer");
      else navigate("/student");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find((u) => u.email === email);

    if (!foundUser) {
      setError("User not registered. Please register first.");
      return;
    }

    if (foundUser.password !== password) {
      setError("Incorrect password.");
      return;
    }

    if (foundUser.role !== role) {
      setError("Role mismatch. Please select correct role.");
      return;
    }

    // ✅ Successful login
    login(foundUser.email, foundUser.role);

    if (foundUser.role === "professor") {
      navigate("/lecturer");
    } else {
      navigate("/student");
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn">
          Login
        </button>

        <p className="auth-switch" onClick={() => navigate("/register")}>
          Don’t have an account? Register
        </p>
      </form>
    </div>
  );
}
