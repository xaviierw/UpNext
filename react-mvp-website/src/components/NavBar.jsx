import { Navbar, Nav, Container, Form, FormControl, NavDropdown } from "react-bootstrap"
import { Link } from "react-router"
import NotificationDropdown from "./NotificationDropdown";

const handleLogout = () => {
  localStorage.removeItem("token");   
  localStorage.removeItem("username"); 
  window.location.href = "/login";     
};

const NavBar = () => {
  return (
    <Navbar bg="light" expand="lg" fixed="top" className="shadow-sm">
      <Container fluid>
        
        <Navbar.Brand as={Link} to="/"><img src="/icons/Upnext.png" alt="logo" style={{ height: "45px", width: "auto" }}/></Navbar.Brand>

        <Navbar.Toggle aria-controls="upnext-nav" className="custom-collapse" />

        <Navbar.Collapse id="upnext-nav">
          <Nav className="me-auto mt-2 mt-lg-0 custom-nav">
            <Nav.Link as={Link} to="#">Saved</Nav.Link>
            <Nav.Link as={Link} to="#">Calendar</Nav.Link>
            <Nav.Link as={Link} to="#">Category</Nav.Link>
          </Nav>

          <Form className="d-flex flex-grow-1 mx-lg-3 my-2 my-lg-0 nav-search-wrapper">
            <FormControl type="search" placeholder="Search events..." className="nav-search-input"/>
          </Form>

          <Nav className="custom-nav nav-right mt-2 mt-lg-0">

            <Nav.Link as={Link} to="/myevents" className="my-events-btn">My Events</Nav.Link>

            <NotificationDropdown />

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

export default NavBar
