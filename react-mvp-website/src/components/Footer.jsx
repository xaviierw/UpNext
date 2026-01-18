// This componenet is being use on every page at the bottom
import "./css/Footer.css";

const Footer = () => {
  return (
    <footer className="upnext-footer">
      <div className="footer-container"><p className="footer-text">© {new Date().getFullYear()} UpNext. All rights reserved.</p></div>
    </footer>
  );
};

export default Footer;