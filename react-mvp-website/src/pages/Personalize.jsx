import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import EventBox from "../components/EventBox";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://api.upnextt.xyz";

const Personalize = () => {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BACKEND_URL}/api/personalize`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json())
      .then((data) => {
        if (data.user.personalized) {
          navigate("/");
          return;
        }
        setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  const eventTypes = [
    { label: "Workshops", icon: `${BACKEND_URL}/icons/workshop.png` },
    { label: "Competitions", icon: `${BACKEND_URL}/icons/competition.png` },
    { label: "Talks & Seminar", icon: `${BACKEND_URL}/icons/talks.png` },
    { label: "Career Events", icon: `${BACKEND_URL}/icons/career.png` },
  ];

  const categories = [
    { label: "Technology", icon: `${BACKEND_URL}/icons/tech.png` },
    { label: "Business", icon: `${BACKEND_URL}/icons/business.png` },
    { label: "Design", icon: `${BACKEND_URL}/icons/design.png` },
    { label: "Science", icon: `${BACKEND_URL}/icons/science.png` },
    { label: "Sports & Wellness", icon: `${BACKEND_URL}/icons/sports.png` },
    { label: "Community Service", icon: `${BACKEND_URL}/icons/community.png` },
    { label: "TP Events (All Events in TP)", icon: `${BACKEND_URL}/icons/temasek.jpg` },
  ];

  function toggleType(label) {
    if (selectedTypes.includes(label)) {
      setSelectedTypes(selectedTypes.filter(t => t !== label));
      return;
    }
    if (selectedTypes.length >= 2) return;
    setSelectedTypes([...selectedTypes, label]);
  }

  function toggleCategory(label) {
    if (selectedCategories.includes(label)) {
      setSelectedCategories(selectedCategories.filter(c => c !== label));
      return;
    }
    if (selectedCategories.length >= 3) return;
    setSelectedCategories([...selectedCategories, label]);
  }

  async function handleFinish() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/personalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventTypes: selectedTypes,
          eventCategories: selectedCategories,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Failed to save preferences");
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("Error saving preferences", err);
    }
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container text-center mt-4">
      <p>Welcome, {user.username}!</p>

      {step === 1 && (
        <>
          <h3>Select up to 2 event types</h3>
          <div className="row row-cols-2 row-cols-md-4 g-3 mt-3">
            {eventTypes.map(et => (
              <div className="col" key={et.label}>
                <EventBox icon={et.icon} label={et.label} selected={selectedTypes.includes(et.label)} onClick={() => toggleType(et.label)}/>
              </div>
            ))}
          </div>
          <button className="btn btn-primary mt-3" onClick={() => setStep(2)} disabled={selectedTypes.length === 0}>Continue</button>
        </>
      )}

      {step === 2 && (
        <>
          <h3>Select up to 3 categories</h3>
          <div className="row row-cols-2 row-cols-md-3 g-3 mt-3">
            {categories.map(cat => (
              <div className="col" key={cat.label}>
                <EventBox icon={cat.icon} label={cat.label} selected={selectedCategories.includes(cat.label)} onClick={() => toggleCategory(cat.label)}/>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary mt-3 me-2" onClick={() => setStep(1)}>Back</button>
          <button className="btn btn-primary mt-3" onClick={() => setStep(3)} disabled={selectedCategories.length === 0}>Continue</button>
        </>
      )}

      {step === 3 && (
        <>
          <h3>Review your preferences</h3>
          <p>Types: {selectedTypes.join(", ") || "None"}</p>
          <p>Categories: {selectedCategories.join(", ") || "None"}</p>
          <button className="btn btn-secondary mt-3 me-2" onClick={() => setStep(2)}>Back</button>
          <button className="btn btn-success mt-3" onClick={handleFinish}>Complete Personalization</button>
        </>
      )}
    </div>
  );
};

export default Personalize;