import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Container, Row, Col } from "react-bootstrap";
import NavBar from "../components/NavBar";
import EventCard from "../components/EventCard";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://api.upnextt.xyz";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const q = (params.get("q") || "").trim();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date) => date ? new Date(date).toLocaleString("en-SG", { timeZone: "Asia/Singapore", day: "2-digit", month: "short", year: "numeric"}) : "TBA";

  const calculateDaysLeft = (deadline) => {
    if (!deadline) return "N/A";
    const today = new Date();
    const regDate = new Date(deadline);
    const diffTime = regDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Closing today";
    return `${diffDays} Days left`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BACKEND_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEvents(data.events || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((event) => {
    if (!q) return true;

    const keyword = q.toLowerCase();

    const title = (event.title || "").toLowerCase();
    const desc = (event.description || "").toLowerCase();
    const venue = (event.location || "").toLowerCase();

    const categories = Array.isArray(event.eventCategories) ? event.eventCategories.join(" ").toLowerCase() : "";
    const types = Array.isArray(event.eventTypes) ? event.eventTypes.join(" ").toLowerCase() : "";

    return (
      title.includes(keyword) ||
      desc.includes(keyword) ||
      venue.includes(keyword) ||
      categories.includes(keyword) ||
      types.includes(keyword)
    );
  });

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <NavBar />
      <Container style={{ marginTop: "90px" }}>
        <h3>Search results for: {q}</h3>

        <Row className="mt-3">
          {filtered.map((event) => (
            <Col key={event._id} xs={12} sm={6} md={4} lg={3} className="mb-3">
              <EventCard
                daysLeft={calculateDaysLeft(event.registrationDeadline)}
                image={event.imageURL || ""} 
                regDeadline={formatDate(event.registrationDeadline)}
                eventDate={formatDate(event.startDateTime)}
                title={event.title}
                tags={[...(event.eventCategories || []), ...(event.eventTypes || [])]}
                capacity={`${event.capacity}`}
                onClick={() => navigate(`/event/${event._id}`)}
              />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchResults;
