import { useEffect, useState } from "react";
import { useParams } from "react-router"; 
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import NavBar from "../components/NavBar";

const Event = () => {
  const { id, tab } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-SG", {
        timeZone: "UTC",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "TBA";


  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:4000/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEvent(data.event);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <>
      <NavBar />

      <Container className="mt-4">
        <Row className="g-4">

          <Col lg={8}>
            <Card className="shadow-sm border-0">
              {event.imageURL && (
                <Card.Img
                  variant="top"
                  src={event.imageURL}
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
                <h5>Important Details</h5>

                <p><strong>Event Date:</strong> {formatDate(event.startDateTime)}</p>
                <p><strong>Venue:</strong> {event.location ?? "TBA"}</p>
                <p><strong>Person-in-Charge:</strong> {event.personInCharge ?? "TBA"}</p>
                <p><strong>Contact:</strong> {event.contact ?? "TBA"}</p>
                <br></br>
                
                <p><strong>Slots Left:</strong> {event.capacity}</p>
                <p><strong>Registration Closing Date:</strong> {formatDate(event.registrationDeadline)}</p>

                <Button variant="primary" className="w-100 rounded-pill mt-3">
                  Register Now!
                </Button>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
    </>
  );
};

export default Event;
