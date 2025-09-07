import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/api"; 
import "./FormPage.css";

type EventItem = {
  id?: string;
  name: string;
  society: string;
  date: string;
};

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem>({
    name: "",
    society: "",
    date: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  
  useEffect(() => {
    if (id) {
      api
        .get(`/api/events/${id}`)
        .then((res) => {
          const formattedDate = res.data.date?.split("T")[0] || "";
          setEvent({ ...res.data, date: formattedDate });
        })
        .catch(() => setError("Failed to fetch event details"));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/api/events/${id}`, event);
        toast.success("Event updated successfully!");
      } else {
        await api.post("/api/events", event);
        toast.success("Event created successfully!");
      }
      setTimeout(() => navigate("/events"), 1500);
    } catch {
      toast.error(id ? "Failed to update event" : "Failed to create event");
    }
  };

  return (
    <div className="form-page">
      <h2>{id ? "Edit Event" : "Create New Event"}</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Event Name
          <input
            type="text"
            name="name"
            value={event.name}
            onChange={(e) => setEvent({ ...event, [e.target.name]: e.target.value })}
            required
          />
        </label>

        <label>
          Society
          <input
            type="text"
            name="society"
            value={event.society}
            onChange={(e) => setEvent({ ...event, [e.target.name]: e.target.value })}
            required
          />
        </label>

        <label>
          Date
          <input
            type="date"
            name="date"
            value={event.date}
            onChange={(e) => setEvent({ ...event, [e.target.name]: e.target.value })}
            required
          />
        </label>

        <button type="submit">{id ? "Update Event" : "Create Event"}</button>
      </form>
      </div>
  );
}
