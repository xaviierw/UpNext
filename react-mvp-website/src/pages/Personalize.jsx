import { useEffect, useState } from "react";

const Personalize = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:4000/api/personalize", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <p>Welcome, {user.email}!</p>
    </div>
  );
};

export default Personalize;
