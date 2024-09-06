import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import GLightbox from 'glightbox';
import AOS from 'aos';
import Isotope from 'isotope-layout';
import imagesLoaded from 'imagesloaded';
import PureCounter from '@srexi/purecounterjs';
import Swiper from 'swiper';
import { useAuth } from "../../../components/Context";
import axios from 'axios';

function Header() {
  const { isLoggedIn, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [scrollTopActive, setScrollTopActive] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    console.log('Current User Details:', currentUser);
  }, [currentUser]);

  // useEffect(() => {
  //   console.log('isLoggedIn:', isLoggedIn);
  //   console.log('location.pathname:', location.pathname);
  //   if (!isLoggedIn && location.pathname !== '/login') {
  //     console.log('Redirecting to /login');
  //     navigate('/');
  //   }
  // }, [isLoggedIn, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        const response = await axios.get(`http://localhost:3001/shipafrik/user/${currentUser}`);
        console.log('User Data:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const toggleScrolled = () => {
      const header = document.querySelector('#header');
      if (header && (header.classList.contains('scroll-up-sticky') || header.classList.contains('sticky-top') || header.classList.contains('fixed-top'))) {
        setIsScrolled(window.scrollY > 100);
      }
    };

    const toggleScrollTop = () => {
      setScrollTopActive(window.scrollY > 100);
    };

    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
    });

    GLightbox({
      selector: '.glightbox',
    });

    document.querySelectorAll('.isotope-layout').forEach((isotopeItem) => {
      let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
      let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
      let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

      imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
        let initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
          itemSelector: '.isotope-item',
          layoutMode: layout,
          filter: filter,
          sortBy: sort,
        });

        isotopeItem.querySelectorAll('.isotope-filters li').forEach((filterItem) => {
          filterItem.addEventListener('click', () => {
            isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
            filterItem.classList.add('filter-active');
            initIsotope.arrange({
              filter: filterItem.getAttribute('data-filter'),
            });
          });
        });
      });
    });

    document.querySelectorAll('.init-swiper').forEach((swiperElement) => {
      let config = JSON.parse(swiperElement.querySelector('.swiper-config').innerHTML.trim());
      new Swiper(swiperElement, config);
    });

    new PureCounter();

    window.addEventListener('scroll', toggleScrolled);
    window.addEventListener('scroll', toggleScrollTop);
    window.addEventListener('load', toggleScrolled);
    window.addEventListener('load', toggleScrollTop);

    return () => {
      window.removeEventListener('scroll', toggleScrolled);
      window.removeEventListener('scroll', toggleScrollTop);
    };
  }, []);

  const handleMobileNavToggle = () => {
    setMobileNavActive(!mobileNavActive);
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <header id="header" className={`header d-flex align-items-center fixed-top`}>
        <div className="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
          <Link to="/" className="logo d-flex align-items-center">
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="logo" />
            <h1 className="sitename">SHIPAFRIK</h1> <span>.</span>
          </Link>

          <nav id="navmenu" className={`navmenu ${mobileNavActive ? 'mobile-nav-active' : ''}`}>
            <ul>
              <li>
                <Link to="/" className="active">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/become-shipper">Be a Shipper</Link>
              </li>
              <li>
                <Link to="/projects">Testimonials</Link>
              </li>
              <li>
                <a href="#contact">Contact Us</a>
              </li>

              {!isLoggedIn ? (
                <li>
                  <Link to="/login">Sign In</Link>
                </li>
              ) : (
                <li className="nav-item dropdown pe-3">

                  <Link className="nav-link nav-profile d-flex align-items-center pe-0" href=" " aria-expanded="false">
                    <img src={`${process.env.PUBLIC_URL}/profile.png`} style={{ height: 30 }} alt="Profile" className="rounded-circle" />
                    {loading ? (
                      <span className="d-none d-md-block ps-2">Loading...</span>
                    ) : (
                      <span className="d-none d-md-block ps-2">{user?.firstName} {user?.lastName}</span>
                    )}                
                    </Link>

                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile" >
                    <li className="dropdown-header">
                      <h6>{user?.firstName} {user?.lastName}</h6>
                      <span>{user?.userType}</span>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <a className="dropdown-item d-flex align-items-center" href="users-profile.html">
                        <i className="bi bi-person"></i>
                        <span>My Profile</span>
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <a className="dropdown-item align-items-center" href="users-profile.html">
                        <i className="bi bi-gear"></i>
                        <span>Settings</span>
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Sign Out</span>
                      </Link>
                    </li>

                  </ul>
                </li>
              )}


            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list" onClick={handleMobileNavToggle}></i>
          </nav>
        </div>
      </header>

      {scrollTopActive && (
        <a href="#top" id="scroll-top" className="scroll-top active d-flex align-items-center justify-content-center">
          <i className="bi bi-arrow-up-short"></i>
        </a>
      )}
    </>
  );
}

export default Header;
