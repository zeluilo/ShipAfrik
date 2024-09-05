import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="footer" className="footer dark-background">
      {/* <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <Link to="/" className="logo d-flex align-items-center">
              <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="" />
              <span className="sitename">SHIPAFRIK</span>
            </Link>
            <div className="footer-contact pt-3">
              <p>A108 Adam Street</p>
              <p>New York, NY 535022</p>
              <p className="mt-3"><strong>Phone:</strong> <span>+1 5589 55488 55</span></p>
              <p><strong>Email:</strong> <span>info@example.com</span></p>
            </div>
            <div className="social-links d-flex mt-4">
              <a href=" " aria-label="Twitter"><i className="bi bi-twitter"></i></a>
              <a href=" " aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href=" " aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href=" " aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Useful Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/terms">Terms of service</Link></li>
              <li><Link to="/privacy">Privacy policy</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Our Services</h4>
            <ul>
              <li><Link to="/web-design">Web Design</Link></li>
              <li><Link to="/web-development">Web Development</Link></li>
              <li><Link to="/product-management">Product Management</Link></li>
              <li><Link to="/marketing">Marketing</Link></li>
              <li><Link to="/graphic-design">Graphic Design</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Hic solutasetp</h4>
            <ul>
              <li><Link to=" ">Molestiae accusamus iure</Link></li>
              <li><Link to=" ">Excepturi dignissimos</Link></li>
              <li><Link to=" ">Suscipit distinctio</Link></li>
              <li><Link to=" ">Dilecta</Link></li>
              <li><Link to=" ">Sit quas consectetur</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Nobis illum</h4>
            <ul>
              <li><Link to=" ">Ipsam</Link></li>
              <li><Link to=" ">Laudantium dolorum</Link></li>
              <li><Link to=" ">Dinera</Link></li>
              <li><Link to=" ">Trodelas</Link></li>
              <li><Link to=" ">Flexo</Link></li>
            </ul>
          </div>
        </div>
      </div> */}

      <div className="container copyright text-center mt-">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">ShipAfrik</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          Designed by <a href="/" rel="noopener noreferrer">EmmanuelGrase</a>
        </div>
      </div>
    </footer>

    
  );
}

export default Footer;
