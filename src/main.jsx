import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/styles.css";
import "./styles/theme.css";


const savedTheme = localStorage.getItem("theme");

if (!savedTheme) {
  document.documentElement.setAttribute("data-theme", "dark");
  localStorage.setItem("theme", "dark");
} else {
  document.documentElement.setAttribute("data-theme", savedTheme);
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);