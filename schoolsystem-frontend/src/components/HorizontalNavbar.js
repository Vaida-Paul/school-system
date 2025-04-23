import React, { useEffect, useState } from "react";
import "../Style/HorizontalNavbar.css";
import logoDark from "../images/logoDark.png";
import logoLight from "../images/logoLight.png";
import { LogOut, Moon, Sun } from "lucide-react";

const HorizontalNavbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.reload();
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-theme");
  };

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.body.classList.contains("dark-theme"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);
  return (
    <nav className="horizontal-navbar">
      <div className="logo-container">
        <img
          src={isDarkMode ? logoLight : logoDark}
          alt="School Logo"
          className="logo"
        />
      </div>
      <div className="nav-actions">
        <button className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default HorizontalNavbar;
