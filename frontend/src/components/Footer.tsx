import "../styles/Footer.css";
import darklogo from "../assets/images/darkLogo.png";
import bee from "../assets/icons/beeIcon.png";

export const Footer = () => {
    return (
        <div className="footer">

            {/* LEFT */}
            <div className="footer-right">
                © 2026 AptiVerse. All rights reserved.
            </div>


            {/* CENTER MARQUEE */}
            <div className="footer-scroll">
                <div className="scroll-track">
                    <span className="footer-bee">Just buzzin’ to better scores
                        <img src={bee} alt="Bee" height={30} />
                    </span>
                    <span className="footer-bee">Buzz through questions, pollen your skills, and hive off with a sweeter score.
                        <img src={bee} alt="Bee" height={30} />
                    </span>
                    <span className="footer-bee">Buzz. Solve. Repeat.
                        <img src={bee} alt="Bee" height={30} />
                    </span>
                    <span className="footer-bee">Join the hive mind of smart test takers
                        <img src={bee} alt="Bee" height={30} />
                    </span>
                </div>
            </div>

            {/* RIGHT */}
            <div className="footer-left">
                <div className="footer-logo">
                    <img src={darklogo} alt="AptiVerse Logo" />
                </div>
            </div>

        </div>
    );
};