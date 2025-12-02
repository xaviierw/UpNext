// src/App.jsx
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Personalize from "./pages/Personalize";
import NotFound from "./pages/NotFound";
import { Routes, Route, Navigate } from "react-router"

const ProtectedRoute = ({ children}) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/personalize" element={<ProtectedRoute><Personalize /></ProtectedRoute>}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

export default App;
