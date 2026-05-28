import "../styles/AuthModal.css";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import type { FC, MouseEvent } from "react";
import { supabase } from "../lib/supabaseClient";

// Asset Imports
import passwordIcon from "../assets/icons/passwordIcon.png";
import profileIcon from "../assets/icons/userprofileIcon.png";
import emailIcon from "../assets/icons/emailIcon.png";
import { AnimatedBee } from "../ui/AnimatedBee";
import beeIcon from "../assets/icons/beeIcon.png";

interface AuthModalProps {
  onClose: () => void;
  onSignIn: () => void;
}

const AuthModal: FC<AuthModalProps> = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        alert("Check your email for a confirmation link!");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        onClose();
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

if (!document.body) return null;

return ReactDOM.createPortal(
  <div className="auth-modal-overlay" onClick={onClose}>
    <div
      className="auth-modal-content"
      onClick={(e: MouseEvent) => e.stopPropagation()}
    >
      <button className="auth-modal-close" onClick={onClose}>
        ×
      </button>

      <div className="auth-form">
        <h2 className="auth-title">{isSignUp ? "Sign Up" : "Sign In"}</h2>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label>Name</label>
              <div className="input-wrapper">
                <div
                  style={{
                    position: "absolute",
                    right: "-10px",
                    top: "-60px",
                    transform: "scale(0.7)",
                    pointerEvents: "none",
                  }}
                >
                  <img src={beeIcon} alt="bee" style={{ height: "80px", width: "80px" }} />
                </div>
                <span className="input-icon">
                  <img src={profileIcon} alt="profile" className="inputIcon" />
                </span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              {!isSignUp && (
                <div
                  style={{
                    position: "absolute",
                    right: "-10px",
                    top: "-60px",
                    transform: "scale(0.7)",
                    pointerEvents: "none",
                  }}
                >
                  <img src={beeIcon} alt="bee" style={{ height: "80px", width: "80px" }} />
                </div>
              )}
              <span className="input-icon">
                <img src={emailIcon} alt="email" className="inputIcon" />
              </span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <img src={passwordIcon} alt="password" className="inputIcon" />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>

          <p className="auth-toggle">
            {isSignUp ? "Already a member? " : "New to AptiVerse? "}
            <span
              className="auth-link"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In here" : "Sign Up here"}
            </span>
          </p>
        </form>
      </div>
    </div>
  </div>,
  document.body
);
};

export default AuthModal;
