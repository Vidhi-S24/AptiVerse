import '../styles/ProfileDropdown.css';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileIcon from '../assets/icons/userprofileIcon.png'
import bookIcon from '../assets/icons/bookIcon.png'
import signoutIcon from '../assets/icons/signoutIcon.png'

interface ProfileDropdownProps {
  onSignOut: () => void;
}

function ProfileDropdown({ onSignOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button 
        className="profile-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="profile-avatar">
          <span><img src={profileIcon} alt="profile" className="sign-inIcon" /></span>
        </div>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <button 
            className="dropdown-item" 
            onClick={() => {
              setIsOpen(false);
              navigate('/profile'); 
            }}
          >
            <span className="dropdown-icon"><img src={bookIcon} alt="book" className="dropdown-icon" /></span>
            My Profile
          </button>
          <button 
            className="dropdown-item" 
            onClick={() => {
              setIsOpen(false);
              onSignOut();       
              navigate('/');     
            }}
          >
            <span className="dropdown-icon"><img src={signoutIcon} alt="signout" className="dropdown-icon" /></span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;