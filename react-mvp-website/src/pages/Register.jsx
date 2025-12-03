import { useState } from "react";
import { useNavigate } from "react-router";

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
      const res = await fetch("http://localhost:4000/api/register", {
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
    <div class="registerForm">
      <h2>Register</h2>

      {message ? <p>{message}</p> : null}

      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label><br />
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required/>
        </div>

        <div>
          <label>Username:</label><br />
          <input type="text" value={username} onChange={(event) => setUserName(event.target.value)} required/>
        </div>

        <div>
          <label>Password:</label><br />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required/>
        </div>

        <button type="submit">Register</button>
        <br></br>
        <p>Have an existing account? <a href="/login">Login!</a></p>
      </form>
    </div>
  );
};

export default Register;
