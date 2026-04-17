import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../styles/responsive.css";

export default function Navbar({ setShowSettings, showSettings }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAboutClick = () => {
    navigate("/about");
    setShowMobileMenu(false);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    setShowMobileMenu(false);
  };

  return (
    <>
      <nav className="navbar">
        <img
          src="/artificial-intelligence.png"
          alt="AI Icon"
          className="AI-icon"
        />

        <h1
          className="model-name"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (user?.role === "professor") navigate("/lecturer");
            else if (user?.role === "student") navigate("/student");
          }}
        >
          Concept Clarity
        </h1>

        {!showSettings && !showMobileMenu && (
          <img
            src="/menu.png"
            alt="Menu Icon"
            className="menu-icon"
            onClick={() => setShowMobileMenu(true)}
          />
        )}

        <ul className="navbar-links">
          <li className="about navbar-link" onClick={handleAboutClick}>
            About
          </li>

          <li
            className="settings navbar-link"
            onClick={handleSettingsClick}
          >
            Settings
          </li>

          {user && (
            <li className="navbar-link" onClick={handleLogout}>
              Logout
            </li>
          )}
        </ul>
      </nav>

      {/* Mobile Menu Sidebar */}
      {showMobileMenu && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setShowMobileMenu(false)}
          />

          <div className="mobile-menu open">
            <button
              className="close-mobile-menu"
              onClick={() => setShowMobileMenu(false)}
            >
              ✕
            </button>

            <ul className="mobile-menu-list">
              <li className="mobile-menu-item" onClick={handleAboutClick}>
                About
              </li>

              <li
                className="mobile-menu-item"
                onClick={handleSettingsClick}
              >
                Settings
              </li>

              {user && (
                <li
                  className="mobile-menu-item"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </>
  );
}