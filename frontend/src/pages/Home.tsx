import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
    <div className="home-container">
      <h1>Welcome to EventHive!</h1>
      <p>
        Organize and keep track of all your society events in one place.  
        View upcoming and past events, create new ones, and keep everything managed easily.  
        Whether you’re planning a cultural fest, a workshop, or a community meetup, we’ve got you covered.
      </p>

      <div className="home-actions">
        <Link to="/login" className="home-btn primary-btn">Login</Link>
        <Link to="/register" className="home-btn primary-btn">Register</Link>
      </div>
    </div>
    </div>
  );
}
