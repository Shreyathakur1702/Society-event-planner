import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // or Navbar.css if you separated styles

export default function Navbar() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Apply theme to <html> and save preference
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <nav className="navbar">
      <h1 className="logo">Society Event Planner</h1>
      <div className="nav-links">
        <Link to="/" className="nav-home">🏠 Home</Link>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀ Light Mode"}
        </button>
      </div>
    </nav>
  );
}