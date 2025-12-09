import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const EventRegisterModal = ({ show, onHide, event }) => {
  const [step, setStep] = useState(1);           // 1 = review info, 2 = T&C
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load current user info when modal opens
  useEffect(() => {
    if (!show) {
      setStep(1); // reset to first step when closed
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingUser(true);

    fetch("http://localhost:4000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
      })
      .catch((err) => console.error("Failed to load user info:", err))
      .finally(() => setLoadingUser(false));
  }, [show]);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4000/api/events/${event._id}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}), // add extra fields later
        }
      );

      const data = await res.json();
      if (!data.success) {
        console.error(data.message);
      }

      onHide();
    } catch (err) {
      console.error("Failed to register:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      {step === 1 ? (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Review your information</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {loadingUser ? (
              <div className="text-center">
                <Spinner animation="border" size="sm" /> Loading...
              </div>
            ) : (
              <>
                <p><strong>Event:</strong> {event?.title}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {event
                    ? new Date(event.startDateTime).toLocaleString("en-SG")
                    : "-"}
                </p>
                <hr />
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              disabled={loadingUser}
            >
              Next
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Terms &amp; Conditions</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ol>
              <li>Your registration details will be shared with the organiser.</li>
              <li>You agree to be contacted regarding this event.</li>
              <li>Photos/videos during the event may be used for publicity.</li>
              <li>The organiser may amend event details if necessary.</li>
            </ol>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Registering..." : "Confirm registration"}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default EventRegisterModal;