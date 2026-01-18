// This component is use in the event registration page in the event page. It will pop up when user clicks on register event

import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const EventRegisterModal = ({ show, onHide, event }) => {
  const [step, setStep] = useState(1); // 1 is review their personal information then 2 is terms and conditions afterwards its success message and set their preferences

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [inAppOptIn, setInAppOptIn] = useState(false);
  const token = localStorage.getItem("token");

  // Load current user info when modal opens
  useEffect(() => {
    if (!show) {
      setStep(1);
      setUser(null);
      setRegistration(null);
      setEmailOptIn(false);
      setInAppOptIn(false);
      setSubmitting(false);
      setSavingPrefs(false);
      return;
    }

    if (!token || !event?._id) return;
    setLoadingUser(true);

    fetch(`${BACKEND_URL}/api/me`, {headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
      }).catch((err) => console.error("Failed to load user info:", err))
      .finally(() => setLoadingUser(false));
  }, [show]);

  const formatDate = (date) => date ? new Date(date).toLocaleString("en-SG", {day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,}) : "TBA";

  // register user for event
  const handleConfirm = async () => {
    if (!token || !event?._id) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${BACKEND_URL}/api/events/${event._id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server error while registering:", res.status, text);
        return;
      }

      const data = await res.json();
      if (!data.success) {
        console.error(data.message || "Failed to register for event");
        return;
      }
      // store registration so know which one to update
      setRegistration(data.registration);
      setStep(3);
    } catch (err) {
      console.error("Failed to register:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // save reminder preferences
  const handleSavePreferences = async () => {
    if (!token || !registration?._id) {
      onHide();
      return;
    }
    try {
      setSavingPrefs(true);
      const res = await fetch(`${BACKEND_URL}/api/registrations/${registration._id}/preferences`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            wantsEmailReminder: emailOptIn,
            wantsInAppReminder: inAppOptIn,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to save preferences:", res.status, text);
      }
    } catch (err) {
      console.error("Error saving reminder preferences:", err);
    } finally {
      setSavingPrefs(false);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      {step === 1 && (
        <>
          <Modal.Header closeButton><Modal.Title>Review your information</Modal.Title></Modal.Header>

          <Modal.Body>
            {loadingUser ? (
              <div className="text-center"><Spinner animation="border" size="sm" /> Loading...</div>
            ) : (
              <>
                <p><strong>Event:</strong> {event?.title}</p>
                <p><strong>Date:</strong>{" "}{formatDate(event.startDateTime)}</p>
                <hr />
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button variant="primary" onClick={() => setStep(2)} disabled={loadingUser || !user}>Next</Button>
          </Modal.Footer>
        </>
      )}

      {step === 2 && (
        <>
          <Modal.Header closeButton><Modal.Title>Terms &amp; Conditions</Modal.Title></Modal.Header>
          <Modal.Body>
            <ol>
              <li>Your registration details will be shared with the organiser.</li>
              <li>You agree to be contacted regarding this event.</li>
              <li>Photos/videos during the event may be used for publicity.</li>
              <li>The organiser may amend event details if necessary.</li>
            </ol>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Registering..." : "Confirm registration"}
            </Button>
          </Modal.Footer>
        </>
      )}

      {step === 3 && (
        <>
          <Modal.Header closeButton><Modal.Title>Success</Modal.Title></Modal.Header>
          <Modal.Body className="text-center">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✓</div>
            <h5>Thank you for your registration!</h5>
            <p>Your request has been processed.</p>

            <hr />

            <div className="mt-3 text-start">
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" id="emailReminderSwitch" checked={emailOptIn} onChange={(e) => setEmailOptIn(e.target.checked)} />
                <label className="form-check-label" htmlFor="emailReminderSwitch">Receive Email Reminders</label>
              </div>

              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="inAppReminderSwitch" checked={inAppOptIn} onChange={(e) => setInAppOptIn(e.target.checked)} />
                <label className="form-check-label" htmlFor="inAppReminderSwitch">Receive Alerts in Notifications</label>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" onClick={handleSavePreferences} disabled={savingPrefs}>
              {savingPrefs ? "Saving..." : "Continue"}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default EventRegisterModal;