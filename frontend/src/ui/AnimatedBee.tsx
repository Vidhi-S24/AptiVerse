import bee from '../assets/icons/BeeNoWings.png';
import '../styles/AnimatedBee.css';

export const AnimatedBee = ({ className }: { className?: string }) => (
  <div className={`bee-container ${className}`}>
    <div className="bee-body">
      <div className="wing left-wing"></div>
      <div className="wing right-wing"></div>
      <img src={bee} alt="bee" className="bee-img" />
    </div>
  </div>
);