import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SettingsSidebar from "./SettingsSidebar";

export default function DashboardLayout({ children }) {
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  // 🔥 Apply theme globally
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <Navbar
        setShowSettings={setShowSettings}
        showSettings={showSettings}
      />

      <SettingsSidebar
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        setTheme={setTheme}
      />

      {children}
    </>
  );
}