// This componenet is use in the personalize page

import "./css/EventBox.css";

const EventBox = ({ icon, label, selected, onClick }) => {
  return (
    <div
      className={`event-box ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <img src={icon} alt={label} className="event-icon" />
      <p>{label}</p>
    </div>
  );
};

export default EventBox;
