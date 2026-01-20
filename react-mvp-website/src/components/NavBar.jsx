import { useState } from "react";
import { useNavigate } from "react-router";
import { Navbar, Nav, Container, Form, FormControl, NavDropdown } from "react-bootstrap";
import { Link } from "react-router";
import NotificationDropdown from "./NotificationDropdown";

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "/login";
};

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const NavBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <Navbar bg="light" expand="lg" fixed="top" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/"><img src={`${BACKEND_URL}/icons/Upnext.png`} alt="logo" style={{ height: "45px", width: "auto" }}/></Navbar.Brand>

        <Navbar.Toggle aria-controls="upnext-nav" className="custom-collapse" />

        <Navbar.Collapse id="upnext-nav">
          <Nav className="custom-nav nav-left mt-2 mt-lg-0">
            <Nav.Link as={Link} to="/bookmarks">Saved</Nav.Link>
            <Nav.Link as={Link} to="#">Calendar</Nav.Link>
            <Nav.Link as={Link} to="#">Category</Nav.Link>
          </Nav>

          <Form onSubmit={handleSearch} className="d-flex flex-grow-1 mx-lg-3 my-2 my-lg-0 nav-search-wrapper">
            <FormControl type="search" placeholder="Search events..." className="nav-search-input" value={query} onChange={(e) => setQuery(e.target.value)}/>
          </Form>

          <Nav className="custom-nav nav-right mt-2 mt-lg-0">
            <Nav.Link as={Link} to="/myevents" className="my-events-btn">My Events</Nav.Link>
            <NotificationDropdown />
            <NavDropdown title="Profile" id="profile-dropdown" align="end">
              <NavDropdown.Item as={Link} to="/profile">My Account</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;