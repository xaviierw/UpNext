import { Navbar, Nav, Container, Form, FormControl, NavDropdown } from "react-bootstrap"
import { Link } from "react-router"   // keep as-is for your setup

const NavBar = () => {
  return (
    <Navbar bg="light" expand="lg" fixed="top" className="shadow-sm">
      <Container>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/">
          <img
            src="/icons/Upnext.png"
            alt="logo"
            style={{ height: "45px", width: "auto" }}
          />
        </Navbar.Brand>

        {/* Toggler must come BEFORE Collapse for mobile */}
        <Navbar.Toggle aria-controls="upnext-nav" className="custom-collapse" />

        {/* Collapsible content */}
        <Navbar.Collapse id="upnext-nav">
          {/* Left links */}
          <Nav className="me-auto mt-2 mt-lg-0 custom-nav">
            <Nav.Link as={Link} to="#">Saved</Nav.Link>
            <Nav.Link as={Link} to="#">Calendar</Nav.Link>
            <Nav.Link as={Link} to="#">Category</Nav.Link>
          </Nav>

          {/* Search (full width on mobile, centered & flexible on larger screens) */}
          <Form className="d-flex flex-grow-1 mx-lg-3 my-2 my-lg-0 nav-search-wrapper">
            <FormControl
              type="search"
              placeholder="Search events..."
              className="nav-search-input"
            />
          </Form>

          {/* Profile dropdown (right side on large, stacked on small) */}
          <Nav className="ms-lg-auto mt-2 mt-lg-0 custom-nav">
            <NavDropdown title="Profile" id="profile-dropdown" align="end">
              <NavDropdown.Item as={Link} to="/account">My Account</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/logout">Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
