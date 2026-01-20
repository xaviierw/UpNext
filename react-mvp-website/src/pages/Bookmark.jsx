import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from "react-bootstrap"
import { useNavigate } from "react-router"
import NavBar from "../components/NavBar"

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const formatDateTime = (date) => {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-SG", {timeZone: "Asia/Singapore", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,})
}

const Bookmark = () => {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true)
        setError("")

        const token = localStorage.getItem("token")
        const res = await fetch(`${BACKEND_URL}/api/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()
        if (!res.ok) {
          setError(data?.message || "Failed to load bookmarks.")
          return
        }

        setBookmarks(data.bookmarks || [])
      } catch (err) {
        console.error(err)
        setError("Something went wrong while fetching bookmarks.")
      } finally {
        setLoading(false)
      }
    }
    fetchBookmarks()
  }, [])

  const handleRemove = async (eventId) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${BACKEND_URL}/api/events/${eventId}/bookmark`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        alert(data?.message || "Failed to remove bookmark.")
        return
      }

      setBookmarks((prev) =>
        prev.filter((b) => b.event?._id !== eventId)
      )
    } catch (err) {
      console.error(err)
      alert("Something went wrong while removing bookmark.")
    }
  }

  return (
    <div>
      <NavBar />

      <Container className="mt-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">My Bookmarks</h3>
          <Badge bg="secondary">{bookmarks.length} saved</Badge>
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
            <div className="mt-2">Loading bookmarks</div>
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger">{error}</Alert>
        )}

        {!loading && !error && bookmarks.length === 0 && (
          <Alert variant="info">You have no bookmarked events yet.</Alert>
        )}

        {!loading && !error && bookmarks.length > 0 && (
          <Row className="g-3">
            {bookmarks.map((b) => {
              const event = b.event
              if (!event) return null

              const imgSrc = event.imageURL ? event.imageURL.startsWith("http") ? event.imageURL : `${BACKEND_URL}${event.imageURL}` : ""

              return (
                <Col key={b.bookmarkId} xs={12} md={6} lg={4}>
                  <Card className="shadow-sm h-100" style={{ borderRadius: "12px", cursor: "pointer" }} onClick={() => navigate(`/event/${event._id}`)}>
                    {imgSrc && (
                      <Card.Img variant="top" src={imgSrc} style={{ height: "180px", objectFit: "cover" }}/>
                    )}

                    <Card.Body>
                      <Card.Title style={{ fontSize: "1.05rem" }}>{event.title || "Untitled Event"}</Card.Title>
                      <Card.Text className="text-muted mb-2">{event.location || "No location"}</Card.Text>
                      <div className="small text-muted">Event Date</div>
                      <div className="mb-2">{formatDateTime(event.startDateTime)}</div>
                      <div className="small text-muted">Saved On</div>
                      <div>{formatDateTime(b.createdAt)}</div>
                      <Button variant="outline-danger" size="sm" className="mt-3" onClick={(e) => {e.stopPropagation()
                          handleRemove(event._id)
                        }}>Remove</Button>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
        )}
      </Container>
    </div>
  )
}

export default Bookmark