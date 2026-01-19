import { useState } from "react";
import { useNavigate, Link } from "react-router";
import "./Auth.css";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://api.upnextt.xyz";

const Login = () => {
  const [portal, setPortal] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, portal }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Login failed, incorrect email or password. Please try again!");
        return;
      }

      localStorage.setItem("token", data.token);

      if (portal === "organiser") {
        navigate("/organiser/event");
        return;
      }

      if (!data.personalized) {
        navigate("/personalize");
      } else {
        navigate("/");
      }
    } catch (err) {
      setMessage("Server error. Try again later.");
    }
  }

  return (
    <div className="auth-page">
      <div className="loginForm">
        <h2>Login</h2>

        <div className="portal-toggle">
          <label>
            <input type="radio" name="portal" value="student" checked={portal === "student"} onChange={() => setPortal("student")} />
            Student
          </label>
          <label>
            <input type="radio" name="portal" value="organiser" checked={portal === "organiser"} onChange={() => setPortal("organiser")} />
            Organiser
          </label>
        </div>

        {message && <p className="auth-message">{message}</p>}

        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <br />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" inputMode="email" />
          </div>

          <div>
            <label>Password:</label>
            <br />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </div>

          <button type="submit" disabled={!email || !password}>
            Login as {portal === "student" ? "Student" : "Organiser"}
          </button>

          {portal === "student" ? (
            <p>Not registered yet? <Link to="/register">Register!</Link></p>
          ) : (
            <p style={{ opacity: 0.8 }}>Organiser accounts are created by the system admin.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;