// This componenet is use in the personalized event page in the home page

import EventCard from "./EventCard";
import { useNavigate } from "react-router";
import "./css/EventCarousel.css";

const EventCarousel = ({ events = [] }) => {

  const navigate = useNavigate();

  const calculateDaysLeft = (deadline) => {
    if (!deadline) return "N/A";
    const today = new Date();
    const regDate = new Date(deadline);
    const diffTime = regDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Closed";
    return `${diffDays} left till registration closes`;
  };

  const handleClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-SG", {day: "2-digit", month: "short", year: "numeric",});
    };

  if (!events.length) {
    return <p className="text-muted text-center">No personalised events yet.</p>;
  }

  return (
    <div className="event-carousel-wrapper">
      <div className="event-carousel-track">
        {events.map((event) => (
          <div className="event-carousel-item" key={event._id}>
            <EventCard onClick={() => handleClick(event._id)} 
              daysLeft={calculateDaysLeft(event.registrationDeadline)}
              regDeadline={formatDate(event.registrationDeadline)}
              eventDate={formatDate(event.startDateTime)}
              image={event.imageURL}
              capacity={event.capacity ?? "—"}
              title={event.title}
              tags={[...(event.eventCategories || []), ...(event.eventTypes || []),].filter(Boolean)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;
