import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import EventCarousel from "../components/EventCarousel";
import AllEventsGrid from "../components/AllEventsGrid";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://api.upnextt.xyz";

const Home = () => {
  const [personalizedEvents, setPersonalizedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loadingPersonalized, setLoadingPersonalized] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BACKEND_URL}/api/events/personalized`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json())
      .then((data) => {
        if (data.success) setPersonalizedEvents(data.events);
      }).catch((err) =>
        console.error("Failed to load personalised events:", err)
      ).finally(() => setLoadingPersonalized(false));

    fetch(`${BACKEND_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json())
      .then((data) => {
        if (data.success) setAllEvents(data.events);
      }).catch((err) => console.error("Failed to load all events:", err))
      .finally(() => setLoadingAll(false));
  }, []);

  return (
    <div>
      <NavBar />
      <div className="container mt-4">
        <h4 className="fw-semibold mb-3">Based on what you like</h4>
        
        {loadingPersonalized ? (
          <p className="text-center text-muted">Loading your events...</p>
        ) : personalizedEvents.length === 0 ? (
          <p className="text-center text-muted">No personalised events yet. Try updating your interests.</p>
        ) : (
          <EventCarousel events={personalizedEvents} />
        )}

        <hr className="my-4" />
        <h4 className="fw-semibold mb-3">All events</h4>

        {loadingAll ? (
          <p className="text-center text-muted">Loading all events...</p>
        ) : (
          <AllEventsGrid events={allEvents} />
        )}
      </div>
    </div>
  );
};

export default Home;