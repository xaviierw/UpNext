import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import NavBar from "../components/NavBar";
import { Container, Card, Spinner, Alert, ProgressBar, Button, Modal } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [allAchievements, setAllAchievements] = useState([]);
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [error, setError] = useState("");
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BACKEND_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setLevelInfo(data.levelInfo);
        } else setError(data.message || "Failed to load profile");
      })
      .catch(() => setError("Server error"))
      .finally(() => setLoadingUser(false));

    Promise.all([
      fetch(`${BACKEND_URL}/api/achievements`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),

      fetch(`${BACKEND_URL}/api/achievements/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([allRes, meRes]) => {
        if (allRes.success) setAllAchievements(allRes.achievements || []);
        if (meRes.success) setEarnedAchievements(meRes.achievements || []);
      })
      .catch(() => {})
      .finally(() => setLoadingAchievements(false));
  }, []);

  const earnedSet = useMemo(() => {
    return new Set((earnedAchievements || []).map((a) => a.code || a._id));
  }, [earnedAchievements]);

  const mergedAchievements = useMemo(() => {
    return (allAchievements || []).map((a) => ({
      ...a,
      earned: earnedSet.has(a.code || a._id),
    }));
  }, [allAchievements, earnedSet]);

  const earnedCount = mergedAchievements.filter((a) => a.earned).length;
  const renderAchievements = (list) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {list.map((a) => (
        <OverlayTrigger key={a._id || a.code || a.title} placement="top" overlay={
            <Tooltip>
              <strong>{a.title}</strong>
              <br />
              {a.description || "No description"}
              {a.xp && (
                <>
                  <br />
                  <small>+{a.xp} XP</small>
                </>
              )}
            </Tooltip>
          }
        >
          <div style={{ width: "90px", textAlign: "center", opacity: a.earned ? 1 : 0.35, cursor: "pointer",}}>
            <img src={a.image ? `${BACKEND_URL}${a.image}` : ""} alt={a.title}
              style={{ width: "90px", height: "90px", borderRadius: "12px", objectFit: "cover", border: a.earned ? "2px solid #0d6efd" : "2px solid #ccc",}}
            />
            <small>{a.title}</small>
          </div>
        </OverlayTrigger>
      ))}
    </div>
  );

  return (
    <>
      <NavBar />
      <Container className="mt-4">
        <h3 className="mb-3">My Profile</h3>

        {(loadingUser || loadingAchievements) && (
          <div className="text-center my-4"><Spinner animation="border" /></div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {user && levelInfo && (
          <Card className="shadow-sm mb-3 w-100">
            <Card.Body>
              <p><strong>Name:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",}}>
                <div>
                  <strong>Level {levelInfo.level}</strong>
                  <br />
                </div>

                <Button variant="outline-primary" size="sm" onClick={() => navigate("/rewards")}>Redeem Rewards</Button>
              </div>

              <ProgressBar now={levelInfo.percent} label={`${levelInfo.currentXp}/${levelInfo.needed}`} className="mt-2" style={{ height: "18px", borderRadius: "10px" }}/>
              <small className="text-muted">{levelInfo.xpToNext} XP to Level {levelInfo.level + 1} | </small>
              <small className="text-muted">{user.xp || 0} XP Accumulated in Total</small>
              <br />
              <small className="text-muted">{user.xpBalance || 0} XP Available to Redeem</small>
            </Card.Body>
          </Card>
        )}

        <Card className="shadow-sm w-100">
          <Card.Body>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",}}>
              <div>
                <h5 className="mb-1">Achievements</h5>
                <small className="text-muted">{earnedCount}/{mergedAchievements.length} unlocked</small>
              </div>
              <Button variant="outline-primary" size="sm" onClick={() => setShowAchievementsModal(true)}>View All</Button>
            </div>

            <hr />

            {loadingAchievements ? (
              <Spinner animation="border" size="sm" />
            ) : mergedAchievements.length === 0 ? (
              <p className="mb-0">No achievements configured yet</p>
            ) : (
              renderAchievements(mergedAchievements.slice(0, 5))
            )}
          </Card.Body>
        </Card>

        <Modal show={showAchievementsModal} onHide={() => setShowAchievementsModal(false)} centered size="lg">
          <Modal.Header closeButton><Modal.Title>All Achievements</Modal.Title></Modal.Header>

          <Modal.Body>
            {loadingAchievements ? (
              <div className="text-center my-3">
                <Spinner animation="border" />
              </div>
            ) : mergedAchievements.length === 0 ? (
              <p className="mb-0">No achievements configured yet</p>
            ) : (
              renderAchievements(mergedAchievements)
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAchievementsModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Profile;