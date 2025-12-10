import { useState } from "react";
import { useNavigate } from "react-router"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed, incorrect email or password. Please try again!.");
        return;
      }

      localStorage.setItem("token", data.token);
      
      if (!data.personalized) {
        navigate("/personalize")
      } else {
        navigate("/");
      }
    } catch (err) {
      setMessage("Server error. Try again later.");
    }

    setMessage("Login successful! Redirecting...");
    setEmail("");
    setPassword("");
  }

  return (

    <div class="loginForm">
      <h2>Login</h2>

      {message ? <p>{message}</p> : null}

      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label><br />
          <input type="email" value={email} onChange={event => setEmail(event.target.value)} required/>
        </div>

        <div>
          <label>Password:</label><br />
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} required/>
        </div>

        <button type="submit">Login</button>
        <br></br>
        <p>Not registered yet? <a href="/register">Register!</a></p>
      </form>
    </div>
  );
};

export default Login;
