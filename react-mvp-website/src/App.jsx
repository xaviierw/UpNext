// src/App.jsx
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Personalize from "./pages/Personalize";
import NotFound from "./pages/NotFound";
import Event from "./pages/Event";
import { Routes, Route, Navigate } from "react-router"

const ProtectedRoute = ({ children}) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
        <Route path="/personalize" element={<ProtectedRoute><Personalize /></ProtectedRoute>}/>
        <Route path="/event/:id" element={<ProtectedRoute><Event /></ProtectedRoute>}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

export default App;
