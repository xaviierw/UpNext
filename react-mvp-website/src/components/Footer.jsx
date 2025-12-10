import "./css/Footer.css";

const Footer = () => {
  return (
    <footer className="upnext-footer">
      <div className="footer-container">
        {/* <p className="footer-text">© {new Date().getFullYear()} UpNext. All rights reserved.</p> */}
        <p className="footer-text">© {new Date().getFullYear()} Professional Scrum Master</p>
      </div>
    </footer>
  );
};

export default Footer;
