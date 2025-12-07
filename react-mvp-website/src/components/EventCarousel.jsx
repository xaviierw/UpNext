import EventCard from "./EventCard";
import "./css/EventCarousel.css";

const EventCarousel = ({ events = [] }) => {

  const calculateDaysLeft = (deadline) => {
    if (!deadline) return "N/A";
    const today = new Date();
    const regDate = new Date(deadline);
    const diffTime = regDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Closed";
    return `${diffDays} Days left`;
  };

  const handleEventClick = (id) => {
    console.log("Event has been clicked", id);
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
          <EventCard
              key={event._id}
              onClick={() => handleEventClick(event._id)}

              daysLeft={calculateDaysLeft(event.registrationDeadline)}

              regDeadline={formatDate(event.registrationDeadline)}

              eventDate={formatDate(event.startDateTime)}

              image={event.imageURL}

              title={event.title}

              tags={[event.eventCategories, ...event.eventTypes || []].filter(Boolean)}
            />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;
