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
import { ip } from '../../constants';

function Header() {
  const { isLoggedIn, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [scrollTopActive, setScrollTopActive] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // console.log('Current User Details:', currentUser);
  }, [currentUser]);

  // useEffect(() => {
    // console.log('isLoggedIn:', isLoggedIn);
    // console.log('location.pathname:', location.pathname);
  //   if (!isLoggedIn && location.pathname !== '/login') {
      // console.log('Redirecting to /login');
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
        const response = await axios.get(`${ip}/shipafrik/user/${currentUser}`);
        // console.log('User Data:', response.data);
        setUser(response.data);
      } catch (error) {
        // console.error('Error fetching user:', error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const toggleScrolled = () => {
      const header = document.querySelector('#header');
      const selectBody = document.querySelector('body');
      if (header && (header.classList.contains('scroll-up-sticky') || header.classList.contains('sticky-top') || header.classList.contains('fixed-top'))) {
        setIsScrolled(window.scrollY > 100);
        window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
      }
    };

    const toggleScrollTop = () => {
      setScrollTopActive(window.scrollY > 100);
    };

    // Mobile nav toggle
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
    const mobileNavToggle = () => {
      document.querySelector('body').classList.toggle('mobile-nav-active');
      mobileNavToggleBtn.classList.toggle('bi-list');
      mobileNavToggleBtn.classList.toggle('bi-x');
    };

    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.addEventListener('click', mobileNavToggle);
    }

    // Hide mobile nav on same-page/hash links
    document.querySelectorAll('#navmenu a').forEach(navmenu => {
      navmenu.addEventListener('click', () => {
        if (document.querySelector('.mobile-nav-active')) {
          mobileNavToggle();
        }
      });
    });

    // Toggle mobile nav dropdowns
    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
      navmenu.addEventListener('click', function (e) {
        e.preventDefault();
        this.parentNode.classList.toggle('active');
        this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
        e.stopImmediatePropagation();
      });
    });

    // AOS initialization
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
    });

    // GLightbox initialization
    GLightbox({
      selector: '.glightbox',
    });

    // Isotope initialization
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

    // Swiper initialization
    document.querySelectorAll('.init-swiper').forEach((swiperElement) => {
      let config = JSON.parse(swiperElement.querySelector('.swiper-config').innerHTML.trim());
      new Swiper(swiperElement, config);
    });

    // PureCounter initialization
    new PureCounter();

    // Scroll event listeners
    window.addEventListener('scroll', toggleScrolled);
    window.addEventListener('scroll', toggleScrollTop);
    window.addEventListener('load', toggleScrolled);
    window.addEventListener('load', toggleScrollTop);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', toggleScrolled);
      window.removeEventListener('scroll', toggleScrollTop);
      if (mobileNavToggleBtn) {
        mobileNavToggleBtn.removeEventListener('click', mobileNavToggle);
      }
    };
  }, []);


  const handleMobileNavToggle = () => {
    setMobileNavActive(!mobileNavActive);
  };

  return (
    <>
      <header id="header" className={`header d-flex align-items-center fixed-top`}>
        <div className="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
          <Link to="/" className="logo d-flex align-items-center">
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="logo" />
            <h1 className="sitename">SHIPAFRIK</h1> <span>.</span>
          </Link>

          <nav id="navmenu" className="navmenu">
            <ul>
              <li>
                <Link to="/" className="active">
                  Home
                </Link>
              </li>
              {(user?.userType === 'USER' || !isLoggedIn) && (
                <>
                  <li>
                    <Link to="/become-shipper">Be a Shipper</Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/track-orders">Track My Shipment</Link>
              </li>
              <li>
                <Link to="/">Testimonials</Link>
              </li>
              <li>
                <a href="#contact">Contact Us</a>
              </li>
              {!isLoggedIn ? (
                <li>
                  <Link to="/login">Sign In</Link>
                </li>
              ) : (
                <li className="dropdown">
                  <Link to="/profile" aria-expanded="false">
                    <img src={`${process.env.PUBLIC_URL}/profile.png`} style={{ height: 30 }} alt="Profile" className="rounded-circle" />
                    {loading ? (
                      <span className="d-none d-md-block ps-2">Loading...</span>
                    ) : (
                      <span className="ps-2">{user?.firstName} {user?.lastName}</span>
                    )}
                      <i class="bi bi-chevron-down toggle-dropdown"></i>
                  </Link>

                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                    <li className="dropdown-header">
                      <h6>{user?.firstName} {user?.lastName}</h6>
                      <span>{user?.userType}</span>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/profile">
                        <i className="bi bi-person"></i>
                        <span>My Profile</span>
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    {user?.userType === 'SHIPPER' && (
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/shipper-hub">
                          <i className="bi bi-truck"></i>
                          <span>Shipper Hub</span>
                        </Link>
                        <hr className="dropdown-divider" />
                      </li>
                    )}
                    {user?.userType === 'USER' && (
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/customer-hub">
                          <i className="bi bi-box"></i>
                          <span>My Shipments</span>
                        </Link>
                        <hr className="dropdown-divider" />
                      </li>
                    )}
                    {user?.userType === 'ADMIN' && (
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/admin-dashboard">
                          <i className="bi bi-gear"></i>
                          <span>Admin Dashboard</span>
                        </Link>
                        <hr className="dropdown-divider" />
                      </li>
                    )}
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to='/'>
                        <i className="bi bi-gear"></i>
                        <span>Settings</span>
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to='/' onClick={handleLogout}>
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
