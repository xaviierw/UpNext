import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Badge, Spinner, Alert } from "react-bootstrap"
import NavBarOrg from "../components/NavBarOrg"

const formatDateTime = (date) => {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-SG", {timeZone: "Asia/Singapore", nday: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,})
}

const OrganiserEvent = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrganiserEvents = async () => {
      try {
        setLoading(true)
        setError("")

        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:4000/api/organiser/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data?.message || "Failed to load organiser events.")
          setLoading(false)
          return
        }

        const fetchedEvents = Array.isArray(data) ? data : data?.events || []

        setEvents(fetchedEvents)
      } catch (err) {
        console.error(err)
        setError("Something went wrong while fetching your events.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrganiserEvents()
  }, [])

  return (
    <div>
      <NavBarOrg />
      <div style={{ height: "85px" }} />

      <Container>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">My Created Events</h3>
          <Badge bg="secondary">{events.length} total</Badge>
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
            <div className="mt-2">Loading your events</div>
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger" className="mt-3">{error}</Alert>
        )}

        {!loading && !error && events.length === 0 && (
          <Alert variant="info" className="mt-3">You haven’t created any events yet.</Alert>
        )}

        {!loading && !error && events.length > 0 && (
          <Row className="g-3">
            {events.map((event) => (
              <Col key={event._id} xs={12} md={6} lg={4}>
                <Card className="shadow-sm h-100" style={{ borderRadius: "12px" }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title className="mb-2" style={{ fontSize: "1.05rem" }}>{event.title || "Untitled Event"}</Card.Title>

                      {event.status !== undefined && (<Badge bg={event.status === 1 ? "success" : "secondary"}>{event.status === 1 ? "Approved" : "Pending"}</Badge>)}
                    </div>

                    <Card.Text className="text-muted mb-2">{event.location || "No location"}</Card.Text>

                    <div className="mb-2">
                      <div className="small text-muted">Start</div>
                      <div>{formatDateTime(event.startDateTime)}</div>
                    </div>

                    <div className="mb-2">
                      <div className="small text-muted">End</div>
                      <div>{formatDateTime(event.endDateTime)}</div>
                    </div>

                    <hr />

                    <Card.Text className="mb-0" style={{ fontSize: "0.95rem" }}>
                      {event.description ? (event.description.length > 140? `${event.description.slice(0, 140)}...`: event.description
                      ) : (
                        <span className="text-muted">No description</span>
                      )}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  )
}

export default OrganiserEvent