import { useEffect, useState } from "react";
import { Container, Table, Spinner, Alert, Badge, Button } from "react-bootstrap";
import { Link } from "react-router";
import NavBar from "../components/NavBar";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Manage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Confirmed";
      case 1:
        return "Attended";
      case 2:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 0:
        return "primary";
      case 1:
        return "success";
      case 2:
        return "secondary";
      default:
        return "dark";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchRegistrations = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/registrations/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.message || "Failed to load your registrations.");
          return;
        }

        setRegistrations(data.registrations || []);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setError("Something went wrong while loading your registrations.");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  const handleCancel = async (registrationId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this registration?");
    if (!confirmCancel) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/registrations/${registrationId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 2 }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to cancel registration.");
        return;
      }

      setRegistrations((prev) =>
        prev.map((reg) => reg._id === registrationId ? { ...reg, status: 2 } : reg)
      );
    } catch (err) {
      console.error("Error cancelling registration:", err);
      setError("Something went wrong while cancelling this registration.");
    }
  };

  return (
    <>
      <NavBar />
      <Container style={{ marginTop: "80px" }}>
        <h3 className="mb-4">My Event Registrations</h3>

        {loading && (
          <div className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Loading your registrations...</span>
          </div>
        )}

        {!loading && error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && registrations.length === 0 && (
          <p className="text-muted">You have no event registrations yet.</p>
        )}

        {!loading && !error && registrations.length > 0 && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Event</th>
                <th>Status</th>
                <th>Registered On</th>
                <th>Email Reminder</th>
                <th>In-App Reminder</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((reg, index) => (
                <tr key={reg._id}>
                  <td>{index + 1}</td>
                  <td>
                    {reg.event?._id ? (
                      <Link to={`/event/${reg.event._id}`} className="text-decoration-none">{reg.event.title || "View Event"}</Link>
                    ) : (
                      reg.event?.title || "Unknown Event"
                    )}
                  </td>

                  <td>
                    <Badge bg={getStatusVariant(reg.status)}>{getStatusText(reg.status)}</Badge>
                  </td>

                  <td>
                    {reg.createdAt ? new Date(reg.createdAt).toLocaleString("en-SG") : "—"}
                  </td>

                  <td>{reg.wantsEmailReminder ? "Yes" : "No"}</td>
                  <td>{reg.wantsInAppReminder ? "Yes" : "No"}</td>
                  <td>
                    <Button variant="outline-danger" size="sm" disabled={reg.status === 2} onClick={() => handleCancel(reg._id)}>{reg.status === 2 ? "Cancelled" : "Cancel"}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
};

export default Manage;