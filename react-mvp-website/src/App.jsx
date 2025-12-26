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
import { Routes, Route, Navigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import "bootstrap-icons/font/bootstrap-icons.css";

const StudentRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "student") return <Navigate to="/organiser" replace />;
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

const OrganiserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "organiser") return <Navigate to="/" replace />;
    return children;
  } catch {
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;