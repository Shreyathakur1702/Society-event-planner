import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Apply theme to <html> and save preference
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // ✅ Show back button only on create/edit pages
  const showBackToEvents =
    location.pathname.startsWith("/create-event") ||
    location.pathname.startsWith("/edit-event");

  // ✅ Show Home button only on login/register when user is not logged in
  const showHomeLink =
    !user &&
    (location.pathname.startsWith("/login") ||
      location.pathname.startsWith("/register"));

  return (
    <nav className="navbar">
      <h1 className="logo">EventHive</h1>
      <div className="nav-links">
        {user ? (
          <>
            {showBackToEvents && (
              <Link to="/events" className="back-btn">
                ← Back to Events
              </Link>
            )}
            <button onClick={logout} className="nav-button">
              Logout
            </button>
          </>
        ) : (
          <>
            {showHomeLink && (
              <Link to="/" className="nav-button">
                Home
              </Link>
            )}
          </>
        )}

        {/* Theme toggle always visible */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀ Light Mode"}
        </button>
      </div>
    </nav>
  );
}
