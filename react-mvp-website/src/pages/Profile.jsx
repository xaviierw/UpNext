import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import NavBar from "../components/NavBar";
import { Container, Card, Spinner, Alert, ProgressBar, Button, Modal } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "./Profile.css";

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

  const sortedAchievements = useMemo(() => {
    return [...mergedAchievements].sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
  }, [mergedAchievements]);

  const earnedCount = mergedAchievements.filter((a) => a.earned).length;

  const renderAchievements = (list) => (
    <div className="achievementsGrid">
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
                  <br />
                  <small>+{a.xp} UN Points</small>
                </>
              )}
            </Tooltip>
          }
        >
          <div className={`achievementItem ${a.earned ? "earned" : "locked"}`}>
            <img className={`achievementImg ${a.earned ? "earned" : "locked"}`} src={a.image ? `${BACKEND_URL}${a.image}` : ""} alt={a.title}/>
            <small className="achievementTitle">{a.title}</small>
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
          <div className="text-center my-4">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {user && levelInfo && (
          <Card className="shadow-sm mb-3 w-100">
            <Card.Body>
              <p><strong>Name:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>

              <div className="profileTopRow">
                <strong>Level {levelInfo.level}</strong>
                <Button variant="outline-primary" size="sm" onClick={() => navigate("/rewards")}>Redeem Rewards</Button>
              </div>

              <ProgressBar now={levelInfo.percent} label={`${levelInfo.currentXp}/${levelInfo.needed}`} className="mt-2"/>

              <small className="text-muted">
                {levelInfo.xpToNext} XP to Level {levelInfo.level + 1} |{" "}
                {user.xp || 0} XP Accumulated in Total
              </small>
              <br />
              <small className="text-muted">{user.xpBalance || 0} UN Points Available to Redeem</small>
            </Card.Body>
          </Card>
        )}

        <Card className="shadow-sm w-100">
          <Card.Body>
            <div className="achievementsHeader">
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
              renderAchievements(sortedAchievements.slice(0, 10))
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
            ) : (
              renderAchievements(sortedAchievements)
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