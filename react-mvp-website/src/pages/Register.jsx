import { useState } from "react";
import { useNavigate, Link } from "react-router";
import "./Auth.css";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful! Redirecting to login..");
      setEmail("");
      setUserName("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setMessage("Server error. Try again later.");
    }
  }

  return (
    <div className="auth-page">
      <div className="registerForm">
        <h2>Register</h2>

        {message ? <p className="auth-message">{message}</p> : null}

        <form onSubmit={handleRegister}>
          <div>
            <label>Email:</label>
            <br />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" inputMode="email" />
          </div>

          <div>
            <label>Username:</label>
            <br />
            <input type="text" value={username} onChange={(event) => setUserName(event.target.value)} required autoComplete="username" />
          </div>

          <div>
            <label>Password:</label>
            <br />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" />
          </div>

          <button type="submit" disabled={!email || !username || !password}>Register</button>
          <p>Have an existing account? <Link to="/login">Login!</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Register;