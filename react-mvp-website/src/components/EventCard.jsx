// This componenet is use in the All Events and Personalized Events section in the home page
import { Card, Badge } from "react-bootstrap";
import "./css/EventCard.css";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const EventCard = ({
  daysLeft = "xx Days left",
  image = "",
  regDeadline = "<deadline here>",
  eventDate = "<date here>",
  title = "<Event Name>",
  tags = [],
  capacity = "<slots left>",
  onClick,
}) => {
  const imgSrc = image
    ? image.startsWith("http")
      ? image
      : `${BACKEND_URL}${image}`
    : "";

  return (
    <Card className="event-card shadow-sm" style={{ borderRadius: "12px" }} onClick={onClick}>
      <Badge className="days-left-badge" bg="primary">
        {daysLeft}
      </Badge>
      
      <div className="event-card-img-wrapper">
        {imgSrc ? (
          <Card.Img variant="top" src={imgSrc} className="event-card-img"/>
        ) : (
          <div className="event-card-placeholder"><i className="bi bi-image"></i></div>
        )}
      </div>

      <Card.Body className="event-card-body">
        <p className="small text-muted mb-1">Registration Deadline: {regDeadline}</p>
        <p className="small text-muted mb-2">Event Date: {eventDate}</p>
        <p className="small text-muted mb-2">Slots Left: {capacity}</p>
        <h5 className="fw-bold mb-3">{title}</h5>

        {tags.length > 0 && (
          <div className="tags-tooltip-wrapper mt-2">
            <span className="tags-pill">Tags</span>
            <div className="tags-tooltip">
              {tags.map((tag, idx) => (
                <div key={idx} className="tooltip-tag">{tag}</div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default EventCard;
