import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import NavBar from "../components/NavBar";
import EventRegisterModal from "../components/EventRegisterModal";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Event = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const formatDate = (date) => date ? new Date(date).toLocaleString("en-SG", { timeZone: "Asia/Singapore", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,}) : "TBA";

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BACKEND_URL}/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEvent(data.event);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;

    fetch(`${BACKEND_URL}/api/events/${id}/bookmark-status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBookmarked(!!data.bookmarked);
      })
      .catch((err) => console.error("Failed to load bookmark status:", err));
  }, [id]);

  const handleToggleBookmark = async () => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;
    try {
      setBookmarkLoading(true);

      const res = await fetch(`${BACKEND_URL}/api/events/${id}/bookmark`, {
        method: bookmarked ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.message || "Failed to update bookmark.");
        setBookmarkLoading(false);
        return;
      }

      setBookmarked(!bookmarked);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating bookmark.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>Event not found.</p>;

  const registrationClosed =
    event.registrationDeadline && new Date(event.registrationDeadline) < new Date();

  const imgSrc = event.imageURL
    ? event.imageURL.startsWith("http")
      ? event.imageURL
      : `${BACKEND_URL}${event.imageURL}`
    : "";

  return (
    <>
      <NavBar />
      <Container className="mt-4">
        <Row className="g-4">
          <Col lg={8}>
            <Card className="shadow-sm border-0">
              {imgSrc && (
                <Card.Img
                  variant="top"
                  src={imgSrc}
                  style={{ maxHeight: "320px", objectFit: "cover" }}
                />
              )}
              <Card.Body>
                <Card.Title>{event.title}</Card.Title>

                <div className="mb-3">
                  {[...(event.eventCategories ?? []), ...(event.eventTypes ?? [])]
                    .filter(Boolean)
                    .map((tag) => (
                      <Badge bg="light" text="dark" key={tag} className="me-2">
                        #{tag}
                      </Badge>
                    ))}
                </div>

                <h5>Event Description</h5>
                <Card.Text style={{ whiteSpace: "pre-line" }}>
                  {event.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="text-center">Details</h5>
                <br />
                <p><strong>Event Date:</strong>{" "}{formatDate(event.startDateTime)} - {formatDate(event.endDateTime)}</p>
                <p><strong>Venue: </strong>{event.location ?? "TBA"}</p>
                <p><strong>Person-in-Charge: </strong>{" "}{event.personInCharge ?? "TBA"}</p>
                <p><strong>Contact: </strong>{event.contact ?? "TBA"}</p>
                <br />
                <p><strong>Slots Left:</strong> {event.capacity}</p>
                <p><strong>Registration Closing Date:</strong>{" "}{formatDate(event.registrationDeadline)}</p>

                <Button variant="primary" className="w-100 rounded-pill mt-3" onClick={() => setShowRegisterModal(true)}disabled={registrationClosed || event.capacity <= 0}>
                  {event.capacity <= 0
                    ? "Event Full"
                    : registrationClosed
                    ? "Registration Closed"
                    : "Register Now!"}
                </Button>

                <Button variant={bookmarked ? "success" : "secondary"} className="w-100 rounded-pill mt-3" onClick={handleToggleBookmark}disabled={bookmarkLoading}>
                  {bookmarkLoading ? "Saving..." : bookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <EventRegisterModal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
        event={event}
      />
    </>
  );
};

export default Event;