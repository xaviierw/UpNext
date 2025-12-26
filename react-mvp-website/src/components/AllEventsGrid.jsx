// This component is use in the All events section in the Home page

import EventCard from "./EventCard";
import "./css/AllEventsGrid.css";
import { useNavigate } from "react-router";

const AllEventsGrid = ({ events = [] }) => {

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
    return new Date(dateString).toLocaleDateString("en-SG", {day: "2-digit", month: "short", year: "numeric",}
    );
  };

  if (!events.length) {
    return (<p className="text-center text-muted">No events available.</p>);
  }

  return (
    <div className="all-events-wrapper">
      <div className="all-events-grid">
        {events.map((event) => (
          <EventCard key={event._id} onClick={() => handleClick(event._id)}
            daysLeft={calculateDaysLeft(event.registrationDeadline)}
            image={event.imageURL}
            capacity={event.capacity ?? "—"}
            regDeadline={formatDate(event.registrationDeadline)}
            eventDate={formatDate(event.startDateTime)}
            title={event.title}
            tags={[...(event.eventCategories || []), ...(event.eventTypes || []),
            ].filter(Boolean)}
          />
        ))}
      </div>
    </div>
  );
};

export default AllEventsGrid;
