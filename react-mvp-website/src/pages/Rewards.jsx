import { useEffect, useMemo, useState } from "react";
import NavBar from "../components/NavBar";
import { Container, Card, Spinner, Alert, Button, Modal, Row, Col, Badge } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "./Rewards.css";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Rewards = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [myRewards, setMyRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [myCodes, setMyCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [showMyCodesModal, setShowMyCodesModal] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [redeemingId, setRedeemingId] = useState(null);
  const [showAllRewardsModal, setShowAllRewardsModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${BACKEND_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        else setError(data.message || "Failed to load profile");
      })
      .catch(() => setError("Server error"))
      .finally(() => setLoadingUser(false));

    Promise.all([
      fetch(`${BACKEND_URL}/api/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),

      fetch(`${BACKEND_URL}/api/rewards/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([allRes, meRes]) => {
        if (allRes.success) setRewards(allRes.rewards || []);
        if (meRes.success) setMyRewards(meRes.rewards || []);
      })
      .catch(() => {})
      .finally(() => setLoadingRewards(false));
  }, []);

  const redeemedSet = useMemo(() => {
    return new Set((myRewards || []).map((r) => r.code || r._id));
  }, [myRewards]);

  const mergedRewards = useMemo(() => {
    return (rewards || []).map((r) => ({
      ...r,
      redeemed: redeemedSet.has(r.code || r._id),
    }));
  }, [rewards, redeemedSet]);

  const sortedRewards = useMemo(() => {
    const rank = (r) => {
      const outOfStock = r.stock === 0;
      if (!r.redeemed && !outOfStock) return 0; // not redeemed
      if (r.redeemed) return 1;                 // redeemed
      return 2;                                 // fully redeemed
    };

    return [...mergedRewards].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [mergedRewards]);

  const redeemedCount = mergedRewards.filter((r) => r.redeemed).length;

  const refreshRewards = async () => {
    const token = localStorage.getItem("token");
    setError("");
    setSuccessMsg("");

    try {
      const [allRes, meRes, userRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/rewards`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch(`${BACKEND_URL}/api/rewards/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch(`${BACKEND_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);

      if (allRes.success) setRewards(allRes.rewards || []);
      if (meRes.success) setMyRewards(meRes.rewards || []);
      if (userRes.success) setUser(userRes.user);
    } catch (e) {
      setError("Failed to refresh rewards");
    }
  };

  const loadMyCodes = async () => {
    const token = localStorage.getItem("token");
    setLoadingCodes(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/rewards/me/codes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to load codes.");
        setMyCodes([]);
        return;
      }

      setMyCodes(data.rewards || []);
    } catch (err) {
      setError("Server error while loading codes.");
      setMyCodes([]);
    } finally {
      setLoadingCodes(false);
    }
  };

  const openMyCodes = async () => {
    setShowMyCodesModal(true);
    await loadMyCodes();
  };

  const redeemReward = async (rewardId) => {
    const token = localStorage.getItem("token");
    setError("");
    setSuccessMsg("");
    setRedeemingId(rewardId);

    try {
      const res = await fetch(`${BACKEND_URL}/api/rewards/${rewardId}/redeem`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Redemption failed.");
        return;
      }

      if (data.redeemCode) setSuccessMsg(`Reward redeemed! Your code: ${data.redeemCode}`);
      else setSuccessMsg("Reward redeemed successfully!");

      await refreshRewards();
    } catch (err) {
      setError("Server error while redeeming reward.");
    } finally {
      setRedeemingId(null);
    }
  };

  const renderRewards = (list) => (
    <Row xs={1} sm={2} lg={3} className="g-3">
      {list.map((r) => {
        const outOfStock = r.stock === 0;

        return (
          <Col key={r._id || r.code || r.title}>
            <Card className="shadow-sm h-100">
              <div className="rewardCardInner">
                <OverlayTrigger placement="top" overlay={
                    <Tooltip>
                      <strong>{r.title}</strong>
                      <br />
                      {r.description || "No description"}
                      <br />
                      <small>Cost: {r.costXp} XP</small>
                      <br />
                      <small>{r.stock === -1 ? "Unlimited" : `Stock: ${r.stock}`}</small>
                    </Tooltip>
                  }
                >
                  <div className="rewardImgWrapper">
                    <img src={r.image ? `${BACKEND_URL}${r.image}` : ""} alt={r.title} className={`rewardImg ${r.redeemed ? "redeemed" : ""} ${outOfStock ? "outOfStock" : ""}`}/>
                  </div>
                </OverlayTrigger>

                <div className="mt-2 d-flex justify-content-between align-items-start">
                  <div>
                    <div className="rewardTitle">{r.title}</div>
                    <small className="text-muted">{r.costXp} UN Points</small>
                  </div>

                  {r.redeemed ? (
                    <Badge bg="success">Redeemed</Badge>
                  ) : outOfStock ? (
                    <Badge bg="secondary">Fully Redeemed</Badge>
                  ) : (
                    <Badge bg="primary">Redeem</Badge>
                  )}
                </div>

                <div className="mt-2 d-flex justify-content-between align-items-center">
                  <small className="text-muted">{r.stock === -1 ? "Unlimited" : `Stock: ${r.stock}`}</small>

                  <Button variant={r.redeemed ? "outline-success" : "primary"} size="sm" className="redeemBtn" disabled={r.redeemed || outOfStock || redeemingId === r._id} onClick={() => redeemReward(r._id)}>
                    {redeemingId === r._id ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Redeeming...
                      </>
                    ) : r.redeemed ? (
                      "Redeemed"
                    ) : (
                      "Redeem Now"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const myXp = user?.xpBalance ?? user?.xp ?? 0;

  return (
    <>
      <NavBar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="mb-1">Rewards Booth</h3>
            <small className="text-muted">Redeem your UN points for rewards</small>
          </div>

          <div className="xpBox">
            <div className="xpValue">{myXp} UN Points</div>
            <small className="text-muted">Available</small>
          </div>
        </div>

        <div className="rewardsTopBtns">
          <Button variant="outline-secondary" size="sm" onClick={() => window.history.back()}>Back</Button>
          <Button variant="outline-primary" size="sm" onClick={openMyCodes}>My Codes</Button>
        </div>

        {(loadingUser || loadingRewards) && (
          <div className="text-center my-4">
<Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        <Card className="shadow-sm mb-3 w-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Rewards</h5>
                <small className="text-muted">{redeemedCount}/{mergedRewards.length} redeemed</small>
              </div>

              <Button variant="outline-primary" size="sm" onClick={() => setShowAllRewardsModal(true)}>View All</Button>
            </div>

            <hr />

            {loadingRewards ? (
              <Spinner animation="border" size="sm" />
            ) : mergedRewards.length === 0 ? (
              <p className="mb-0">No rewards configured yet</p>
            ) : (
              renderRewards(sortedRewards.slice(0, 6))
            )}
          </Card.Body>
        </Card>

        <Modal show={showAllRewardsModal} onHide={() => setShowAllRewardsModal(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>All Rewards</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {loadingRewards ? (
              <div className="text-center my-3">
                <Spinner animation="border" />
              </div>
            ) : mergedRewards.length === 0 ? (
              <p className="mb-0">No rewards configured yet</p>
            ) : (
              renderRewards(sortedRewards)
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAllRewardsModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showMyCodesModal} onHide={() => setShowMyCodesModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>My Voucher Codes</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {loadingCodes ? (
              <div className="text-center my-3">
                <Spinner animation="border" />
              </div>
            ) : (myCodes || []).length === 0 ? (
              <p className="mb-0">No codes yet. Redeem a reward to get a code.</p>
            ) : (
              <div className="codesList">
                {myCodes.map((c) => (
                  <Card key={(c.rewardId || "") + (c.redeemCode || "")} className="shadow-sm">
                    <Card.Body className="codeCardBody">
                      <div className="codeHeaderRow">
                        <div>
                          <div className="codeTitle">{c.title || "Reward"}</div>
                          <small className="text-muted">{c.code || ""}</small>
                        </div>
                        <Badge bg="dark">Code</Badge>
                      </div>

                      <div className="redeemCodeText">{c.redeemCode}</div>

                      <small className="text-muted">
                        Redeemed:{" "}
                        {c.redeemedAt
                          ? new Date(c.redeemedAt).toLocaleString("en-SG", { timeZone: "Asia/Singapore" })
                          : "-"}
                      </small>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMyCodesModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Rewards;
