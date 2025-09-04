
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Society Event Planner !</h1>
      <p>
        Organize and keep track of all your society events in one place.  
        View upcoming and past events, create new ones, and keep everything managed easily.  
        Whether you’re planning a cultural fest, a workshop, or a community meetup, we’ve got you covered.
      </p>

      <div className="home-actions">
        <Link to="/events" className="home-btn primary-btn">
           View Events
        </Link>
        <Link to="/create-event" className="home-btn primary-btn">
           Create Event
        </Link>
      </div>
    </div>
  );
}