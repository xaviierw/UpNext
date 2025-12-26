// This component is used on every organiser page

import { Navbar, Nav, Container, NavDropdown, Button } from "react-bootstrap"
import { Link } from "react-router"
import "../App.css"

const handleLogout = () => {
  localStorage.removeItem("token");   
  localStorage.removeItem("username"); 
  localStorage.removeItem("role");
  window.location.href = "/login";     
};

const NavBarOrg = () => {
  return (
    <Navbar bg="light" expand="lg" fixed="top" className="shadow-sm">
      <Container fluid>
        
        <Navbar.Brand as={Link} to="/"><img src="/icons/Upnext.png" alt="logo" style={{ height: "45px", width: "auto" }}/></Navbar.Brand>

        <Navbar.Toggle aria-controls="upnext-nav" className="custom-collapse" />

        <Navbar.Collapse id="upnext-nav">
        <Nav className="ms-auto custom-nav mt-2 mt-lg-0">
            <Nav.Link as={Link} to="/organiser/create" className="my-events-create-btn">Create an Event</Nav.Link>
            <Nav.Link as={Link} to="/organiser/event" className="my-events-btn">My Events</Nav.Link>
            <NavDropdown title="Profile" id="profile-dropdown" align="end">
            <NavDropdown.Item as={Link} to="/account">My Account</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
        </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBarOrg