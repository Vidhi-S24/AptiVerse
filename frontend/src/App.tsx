import "./styles/App.css";
import { useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Assets
import lightmodeIcon from "./assets/icons/lightmodeIcon.png";
import lightLogo from "./assets/images/lightLogo.png";
import darkmodeIcon from "./assets/icons/darkmodeIcon.png";
import darkLogo from "./assets/images/darkLogo.png";

// Components
import HomePage from "./pages/HomePage";
import ProblemList from "./pages/ProblemList";
import Profile from "./pages/Profile";
import AuthModal from "./components/AuthModal";
import QuizResults from "./pages/QuizResults";
import QuizTest from "./pages/QuizTest";
import AddQuestion from "./pages/AddQuestion";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./ui/Header";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import NotFound from "./pages/errorPage";
import { AnimatedBee } from "./ui/AnimatedBee";
import {Footer} from "./components/Footer";

function App() {
  const { user, isAdmin, signOut, loading } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-content">
          <div><AnimatedBee /></div>
          <p className="loading-text">LOADING APTIVERSE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isDarkMode ? "dark" : ""}`}>

      {!isQuizMode && (
        <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        user={user}
        isAdmin={isAdmin}
        signOut={signOut}
        setShowAuthModal={setShowAuthModal}
        lightLogo={lightLogo}
        darkLogo={darkLogo}
        lightmodeIcon={lightmodeIcon}
        darkmodeIcon={darkmodeIcon}
      />
      )}

      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/problem-list" element={<ProblemList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/results" element={<QuizResults />} />
          <Route path="/quiz" element={<QuizTest setIsQuizMode={setIsQuizMode} isDarkMode={isDarkMode} />} />
          <Route
            path="/addQuestion"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AddQuestion />
              </ProtectedRoute>
            }
          />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
{!isQuizMode && <Footer />}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSignIn={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;
