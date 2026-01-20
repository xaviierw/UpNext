import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Personalize from "./pages/Personalize";
import NotFound from "./pages/NotFound";
import Event from "./pages/Event";
import Manage from "./pages/Manage";
import Organiser from "./pages/Organiser";
import OrganiserEvent from "./pages/OrganiserEvent";
import Profile from "./pages/Profile";
import OrganiserAttendance from "./pages/OrganiserAttendance";
import Bookmark from "./pages/Bookmark";
import SearchResults from "./pages/SearchResults";
import Rewards from "./pages/Rewards";
import { Routes, Route, Navigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import "bootstrap-icons/font/bootstrap-icons.css";

const isExpired = (decoded) => {
  if (!decoded?.exp) return true; 
  return decoded.exp * 1000 < Date.now();
};

const StudentRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (isExpired(decoded)) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    if (decoded.role !== "student") return <Navigate to="/organiser/event" replace />;
    return children;
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

const OrganiserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (isExpired(decoded)) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    if (decoded.role !== "organiser") return <Navigate to="/" replace />;
    return children;
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<StudentRoute><Home /></StudentRoute>} />
      <Route path="/personalize" element={<StudentRoute><Personalize /></StudentRoute>} />
      <Route path="/event/:id" element={<StudentRoute><Event /></StudentRoute>} />
      <Route path="/myevents" element={<StudentRoute><Manage /></StudentRoute>} />
      <Route path="/organiser/create" element={<OrganiserRoute><Organiser /></OrganiserRoute>} />
      <Route path="/organiser/event" element={<OrganiserRoute><OrganiserEvent /></OrganiserRoute>} />
      <Route path="/organiser/events/:eventId/attendance" element={<OrganiserRoute><OrganiserAttendance /></OrganiserRoute>} />
      <Route path="/profile" element={<StudentRoute><Profile /></StudentRoute>} />
      <Route path="/bookmarks" element={<StudentRoute><Bookmark /></StudentRoute>} />
      <Route path="/search" element={<StudentRoute><SearchResults /></StudentRoute>} />
      <Route path="/rewards" element={<StudentRoute><Rewards /></StudentRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;