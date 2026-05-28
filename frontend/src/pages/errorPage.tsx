import React from 'react';
import '../styles/errorPage.css';
import bee_404 from '../assets/images/bee_404.png';


const NotFound: React.FC = () => {
    const handleBackHome = (): void => {
        window.location.href = '/';
    };

    return (
        <div className="error-content">
            <img src={bee_404} alt="Bee 404" className="error-image" />
            <h2 className="error-message">OOPS!!! CONNECTION LOST IN THE HIVE</h2>
            <p className="error-description">
                Don’t worry, we are <strong>stinging mad</strong> at whoever broke this link.
                Maybe try buzzing back to the home hive?        </p>
            <button className="home-btn" onClick={handleBackHome}>
                Buzz Home
            </button>
        </div>
    );
};

export default NotFound;