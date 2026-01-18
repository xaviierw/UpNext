import { useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import "./Organiser.css";
import NavBarOrg from "../components/NavBarOrg";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Organiser = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [capacity, setCapacity] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [contact, setContact] = useState("");
  const [personInCharge, setPersonInCharge] = useState("");
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [eventCategories, setEventCategories] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCheckboxChange = (value, setter, current) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("startDateTime", startDateTime);
      formData.append("endDateTime", endDateTime);
      formData.append("registrationDeadline", registrationDeadline);
      formData.append("capacity", capacity);
      formData.append("registrationRequired", registrationRequired);
      formData.append("contact", contact);
      formData.append("personInCharge", personInCharge);
      eventCategories.forEach((cat) => formData.append("eventCategories[]", cat));
      eventTypes.forEach((type) => formData.append("eventTypes[]", type));

      if (imageURL) {
        formData.append("image", imageURL);
      }

      const res = await fetch(`${BACKEND_URL}/api/organiser/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to create event");
        setSubmitting(false);
        return;
      }

      setMessage("Event created successfully");
      setTitle("");
      setDescription("");
      setLocation("");
      setStartDateTime("");
      setEndDateTime("");
      setRegistrationDeadline("");
      setCapacity("");
      setImageURL("");
      setContact("");
      setPersonInCharge("");
      setRegistrationRequired(true);
      setEventCategories([]);
      setEventTypes([]);
    } catch {
      setMessage("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="my-5" style={{ maxWidth: "800px" }}>
      <NavBarOrg />
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Create Event</Card.Title>

          {message && <Alert variant="info">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date & Time</Form.Label>
                  <Form.Control type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} required />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Date & Time</Form.Label>
                  <Form.Control type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} required />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Registration Deadline</Form.Label>
              <Form.Control type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control value={location} onChange={(e) => setLocation(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Capacity</Form.Label>
              <Form.Control type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e) => setImageURL(e.target.files[0])} />
              <Form.Text muted>Upload 1 image only</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact</Form.Label>
              <Form.Control value={contact} onChange={(e) => setContact(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Person-in-Charge</Form.Label>
              <Form.Control value={personInCharge} onChange={(e) => setPersonInCharge(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Registration Required" checked={registrationRequired} onChange={(e) => setRegistrationRequired(e.target.checked)} />
            </Form.Group>

            <p className="note"><span className="note-label">Note:</span>  In order to reach the right audience, be clear with your selection of event's category & type.</p>

            <Form.Group className="mb-3">
              <Form.Label>Event Categories</Form.Label>
              {["Technology", "Business", "Design", "Science", "Sports & Wellness", "Community Service", "TP Events (All Events in TP)"].map((cat) => (
                <Form.Check key={cat} label={cat} checked={eventCategories.includes(cat)} onChange={() => handleCheckboxChange(cat, setEventCategories, eventCategories)} />
              ))}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Event Types</Form.Label>
              {["Workshops", "Competitions", "Talks & Seminar", "Career Events"].map((type) => (
                <Form.Check key={type} label={type} checked={eventTypes.includes(type)} onChange={() => handleCheckboxChange(type, setEventTypes, eventTypes)} />
              ))}
            </Form.Group>

            <Button type="submit" disabled={submitting}>{submitting ? "Posting..." : "Post Event"}</Button>
            <br />
            <br />
            <p className="impt-text">*Submitted requests will be reviewed by administrators. Approval may take up to 3 working days.*</p>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Organiser;