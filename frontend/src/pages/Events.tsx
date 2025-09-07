import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/api"; 
import "./Events.css";

type EventItem = {
  id?: string;
  _id?: string;
  name: string;
  society: string;
  date: string; 
};

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    api
      .get("/api/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error(err));
  };

  const getId = (e: EventItem) => e.id ?? e._id ?? "";

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/api/events/${id}`); 
      toast.success("Event deleted successfully!");
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    }
  };

  
  const parseYMD = (val: string) => {
    if (!val) return new Date(0);
    const ymd = val.split("T")[0];
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1); 
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((e) => parseYMD(e.date) >= startOfToday)
    .slice()
    .sort((a, b) => parseYMD(a.date).getTime() - parseYMD(b.date).getTime());

  const previousEvents = events
    .filter((e) => parseYMD(e.date) < startOfToday)
    .slice()
    .sort((a, b) => parseYMD(b.date).getTime() - parseYMD(a.date).getTime());

  const renderCard = (e: EventItem, isPast = false) => (
    <div key={getId(e)} className={`event-card ${isPast ? "past" : ""}`}>
      <h3>{e.name}</h3>
      <p className="society">
        <strong>Society:</strong> {e.society}
      </p>
      <p className="date">
        <strong>Date:</strong>{" "}
        {new Date(parseYMD(e.date)).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </p>
      <div className="card-actions">
        <Link to={`/edit-event/${getId(e)}`} className="edit-btn">
          Edit
        </Link>
        <button onClick={() => handleDelete(getId(e))} className="delete-btn">
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="events-page">
      <h2>Upcoming Events</h2>
      <div className="events-grid">
        {upcomingEvents.length ? (
          upcomingEvents.map((e) => renderCard(e, false))
        ) : (
          <p className="no-events">No upcoming events</p>
        )}

        <Link to="/create-event" className="fab-btn">
          +
        </Link>
      </div>

      <h2 style={{ marginTop: "3rem" }}>Previous Events</h2>
      <div className="events-grid">
        {previousEvents.length ? (
          previousEvents.map((e) => renderCard(e, true))
        ) : (
          <p className="no-events">No previous events</p>
        )}
      </div>
    </div>
  );
}
