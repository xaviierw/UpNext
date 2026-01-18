import { useEffect } from "react";
import { useNavigate } from "react-router";

const NotFound = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
        navigate(-1);
    }, 10000);

    return () => clearTimeout(timer); 
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h2>404 – Page Not Found</h2>
        <p>You will be redirected back to the previous page in 10 seconds.</p>

        <button onClick={() => navigate(-1)} style={{ marginTop: "16px", padding: "8px 16px", borderRadius: "20px", border: "none", backgroundColor: "#0d6efd", color: "#fff", cursor: "pointer",}}>Go Back</button>
        </div>
    );
};

export default NotFound;