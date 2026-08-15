import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigationItems = [
    {
      label: "Home",
      path: "/",
      icon: "bi-house",
    },
    {
      label: "Find Salon",
      path: "/salons",
      icon: "bi-geo-alt",
    },
    {
      label: "My Bookings",
      path: "/bookings",
      icon: "bi-calendar3",
    },
  ];

  const closeMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const goTo = (path) => {
    setProfileOpen(false);
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenus}>
          <span className="brand-icon">
            <i className="bi bi-scissors"></i>
          </span>

          <span className="brand-name">
  <span className="brand-aa">AA</span>
  <span className="brand-ora">ORA</span>
</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navbar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions">

          {/* Search */}
          <div className="search-area">
            {searchOpen && (
              <input
                type="text"
                className="search-input"
                placeholder="Search salons..."
                autoFocus
              />
            )}

            <button
              type="button"
              className="navbar-icon-button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <i className="bi bi-search"></i>
            </button>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="navbar-icon-button notification-button"
            aria-label="Notifications"
          >
            <i className="bi bi-bell"></i>

            <span className="notification-badge">3</span>
          </button>

          {/* Book Appointment */}
          <Link to="/salons" className="appointment-button">
            <i className="bi bi-scissors"></i>
            <span>Book an Appointment</span>
          </Link>

          {/* Profile */}
          <div className="profile-container">
            <button
              type="button"
              className="profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="Open profile menu"
            >
              <span className="profile-avatar">
                <i className="bi bi-person"></i>
              </span>

              <i className="bi bi-chevron-down profile-arrow"></i>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">

                <button onClick={() => goTo("/profile")}>
                  <i className="bi bi-person"></i>
                  <span>My Profile</span>
                </button>

                <button onClick={() => goTo("/bookings")}>
                  <i className="bi bi-calendar3"></i>
                  <span>My Bookings</span>
                </button>

                <button onClick={() => goTo("/settings")}>
                  <i className="bi bi-gear"></i>
                  <span>Settings</span>
                </button>

                <div className="profile-divider"></div>

                <button
                  className="logout-item"
                  onClick={() => goTo("/logout")}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>

              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="mobile-controls">

          <button
            type="button"
            className="mobile-icon-button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <i className="bi bi-search"></i>
          </button>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <i
              className={`bi ${
                mobileOpen ? "bi-x-lg" : "bi-list"
              }`}
            ></i>
          </button>

        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="mobile-search">
          <input
            type="text"
            placeholder="Search salons..."
            autoFocus
          />
        </div>
      )}

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="mobile-navigation">

          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenus}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <Link
            to="/salons"
            className="mobile-appointment-button"
            onClick={closeMenus}
          >
            <i className="bi bi-scissors"></i>
            Book an Appointment
          </Link>

          <div className="mobile-divider"></div>

          <Link
            to="/profile"
            className="mobile-nav-link"
            onClick={closeMenus}
          >
            <i className="bi bi-person"></i>
            <span>My Profile</span>
          </Link>

          <Link
            to="/settings"
            className="mobile-nav-link"
            onClick={closeMenus}
          >
            <i className="bi bi-gear"></i>
            <span>Settings</span>
          </Link>

          <button
            type="button"
            className="mobile-nav-link mobile-logout"
            onClick={() => goTo("/logout")}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>

        </div>
      )}
    </header>
  );
};

export default Navbar;