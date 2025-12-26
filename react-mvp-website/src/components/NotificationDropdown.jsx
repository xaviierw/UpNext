// This component is used within the Navigation bar for both organiser and student

import { useEffect, useState } from "react";
import { Dropdown, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router";

const formatTime = (date) =>
  new Date(date).toLocaleString("en-SG", {timeZone: "Asia/Singapore", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,});

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/notifications?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {console.error("Failed to load notifications", err);
    } finally {setLoading(false);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:4000/api/notifications/read-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Dropdown align="end" onToggle={(open) => open && fetchNotifications()}>
      <Dropdown.Toggle variant="link" className="position-relative text-dark notification-bell" style={{ textDecoration: "none" }}>
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (<Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">{unreadCount}</Badge>)}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: 360 }} className="shadow">
        <div className="px-3 py-2 d-flex justify-content-between align-items-center">
          <strong>Notifications</strong>
          {unreadCount > 0 && (<button className="btn btn-link btn-sm p-0" onClick={markAllRead}>Mark all read</button>)}
        </div>

        <Dropdown.Divider />

        {loading ? (
          <div className="text-center py-3"><Spinner size="sm" /></div>
        ) : notifications.length === 0 ? (
          <div className="px-3 py-3 text-muted">No notifications yet</div>
        ) : (
          notifications.map((n) => (
            <Dropdown.Item key={n._id} as={Link} to={n.event ? `/events/${n.event}` : "#"} className="py-2">
              <div className="d-flex">{!n.read && (<span className="me-2 text-primary">●</span>)}
                <div>
                  <div className="fw-semibold">{n.title}</div>
                  <div className="text-muted small">{n.message}</div>
                  <div className="text-muted small">Sent At: {formatTime(n.createdAt)}</div>
                </div>
              </div>
            </Dropdown.Item>
          ))
        )}

        <Dropdown.Divider />

        <div className="px-3 py-2"><Link to="/notifications" className="btn btn-outline-secondary btn-sm w-100">View all notifications</Link></div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;