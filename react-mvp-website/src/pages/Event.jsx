import { useEffect, useState } from "react";
import { useParams } from "react-router";
import NavBar from "../components/NavBar";
  
const Event = () => {
  const { id, tab } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:4000/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEvent(data.event);
        } else {
          console.error(data.message);
        }
      })
      .catch(err => console.error("Failed to load event:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <div>
    <NavBar />
      <h2>{event.title}</h2>
      <p>Current tab: {tab}</p>
    </div>
  );
};

export default Event;
