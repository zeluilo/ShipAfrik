import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Perform any necessary logout actions
    navigate('/login');
  };

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
        
        <Link to="/" className="logo d-flex align-items-center">
          {/* Uncomment the line below if you also wish to use an image logo */}
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="" />
          <h1 className="sitename">SHIPAFRIK</h1> <span>.</span>
        </Link>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li><Link to="/" className="active">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/projects">Projects</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li className="dropdown">
              <a href=" "><span>Dropdown</span> <i className="bi bi-chevron-down toggle-dropdown"></i></a>
              <ul>
                <li><a href=" ">Dropdown 1</a></li>
                <li className="dropdown">
                  <a href=" "><span>Deep Dropdown</span> <i className="bi bi-chevron-down toggle-dropdown"></i></a>
                  <ul>
                    <li><a href=" ">Deep Dropdown 1</a></li>
                    <li><a href=" ">Deep Dropdown 2</a></li>
                    <li><a href=" ">Deep Dropdown 3</a></li>
                    <li><a href=" ">Deep Dropdown 4</a></li>
                    <li><a href=" ">Deep Dropdown 5</a></li>
                  </ul>
                </li>
                <li><a href=" ">Dropdown 2</a></li>
                <li><a href=" ">Dropdown 3</a></li>
                <li><a href=" ">Dropdown 4</a></li>
              </ul>
            </li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Sign In</Link></li>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

      </div>
    </header>
  );
}

export default Header;
