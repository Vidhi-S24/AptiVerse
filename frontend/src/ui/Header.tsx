import { useState } from "react"; // Added useState
import { NavLink, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import ProfileDropdown from "../components/ProfileDropdown";
import "../styles/Header.css"

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: User | null;
  isAdmin: boolean;
  signOut: () => Promise<void> | void;
  setShowAuthModal: (show: boolean) => void;
  lightLogo: string;
  darkLogo: string;
  lightmodeIcon: string;
  darkmodeIcon: string;
}

function Header({
  isDarkMode,
  toggleTheme,
  user,
  isAdmin,
  signOut,
  setShowAuthModal,
  lightLogo,
  darkLogo,
  lightmodeIcon,
  darkmodeIcon,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const navigate = useNavigate();

  const handleNavClick = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="header-content">
        <button 
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <img
          src={isDarkMode ? darkLogo : lightLogo}
          alt="AptiVerse Logo"
          className="logo"
          onClick={() => { navigate("/"); handleNavClick(); }}
          style={{ cursor: "pointer" }}
        />

        <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
          <NavLink className="nav-link" to="/" onClick={handleNavClick}>
            Home
          </NavLink>
          <NavLink className="nav-link" to="/quiz" onClick={handleNavClick}>
            Take Test
          </NavLink>
          <NavLink className="nav-link" to="/problem-list" onClick={handleNavClick}>
            Topic List
          </NavLink>

          {isAdmin && (
            <NavLink className="nav-link admin-link" to="/addQuestion" onClick={handleNavClick}>
              + Add Question
            </NavLink>
          )}
        </nav>

        <div className="right-section">
          <img
            src={isDarkMode ? darkmodeIcon : lightmodeIcon}
            alt="Mode Toggle"
            className="mode-icon"
            onClick={toggleTheme}
          />

          {user ? (
            <ProfileDropdown onSignOut={signOut} />
          ) : (
            <button
              className="signin-btn"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;