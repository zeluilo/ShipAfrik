import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import GLightbox from 'glightbox';
import AOS from 'aos';
import Isotope from 'isotope-layout';
import imagesLoaded from 'imagesloaded';
import PureCounter from '@srexi/purecounterjs';
import Swiper from 'swiper';
// import 'swiper/swiper-bundle.min.css'; // Import Swiper styles

function Header() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [scrollTopActive, setScrollTopActive] = useState(false);

  useEffect(() => {
    // Handle scroll events for adding 'scrolled' class
    const toggleScrolled = () => {
      const header = document.querySelector('#header');
      if (
        header &&
        (header.classList.contains('scroll-up-sticky') ||
          header.classList.contains('sticky-top') ||
          header.classList.contains('fixed-top'))
      ) {
        setIsScrolled(window.scrollY > 100);
      }
    };

    // Handle scroll-to-top button visibility
    const toggleScrollTop = () => {
      setScrollTopActive(window.scrollY > 100);
    };

    // Init AOS
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
    });

    // Init GLightbox
    GLightbox({
      selector: '.glightbox',
    });

    // Init Isotope
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

    // Init Swiper
    document.querySelectorAll('.init-swiper').forEach((swiperElement) => {
      let config = JSON.parse(swiperElement.querySelector('.swiper-config').innerHTML.trim());
      new Swiper(swiperElement, config);
    });

    // Init Pure Counter
    new PureCounter();

    // Add event listeners for scrolling
    window.addEventListener('scroll', toggleScrolled);
    window.addEventListener('scroll', toggleScrollTop);
    window.addEventListener('load', toggleScrolled);
    window.addEventListener('load', toggleScrollTop);

    return () => {
      window.removeEventListener('scroll', toggleScrolled);
      window.removeEventListener('scroll', toggleScrollTop);
    };
  }, []);

  // Mobile nav toggle
  const handleMobileNavToggle = () => {
    setMobileNavActive(!mobileNavActive);
  };

  // Scroll to top handler
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <header id="header" className={`header d-flex align-items-center fixed-top`}>
        <div className="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
          <Link to="/" className="logo d-flex align-items-center">
            {/* Uncomment the line below if you also wish to use an image logo */}
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
              {/* <li>
                <Link to="/about">About</Link>
              </li> */}
              <li>
                <Link to="/services">Be a Shipper</Link>
              </li>
              <li>
                <Link to="/projects">Testimonials</Link>
              </li>
              {/* <li>
                <Link to="/blog">Blog</Link>
              </li> */}
              {/* <li className="dropdown">
                <a href=" " onClick={(e) => e.preventDefault()}>
                  <span>Dropdown</span> <i className="bi bi-chevron-down toggle-dropdown"></i>
                </a>
                <ul>
                  <li>
                    <a href=" ">Dropdown 1</a>
                  </li>
                  <li className="dropdown">
                    <a href=" " onClick={(e) => e.preventDefault()}>
                      <span>Deep Dropdown</span> <i className="bi bi-chevron-down toggle-dropdown"></i>
                    </a>
                    <ul>
                      <li>
                        <a href=" ">Deep Dropdown 1</a>
                      </li>
                      <li>
                        <a href=" ">Deep Dropdown 2</a>
                      </li>
                      <li>
                        <a href=" ">Deep Dropdown 3</a>
                      </li>
                      <li>
                        <a href=" ">Deep Dropdown 4</a>
                      </li>
                      <li>
                        <a href=" ">Deep Dropdown 5</a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href=" ">Dropdown 2</a>
                  </li>
                  <li>
                    <a href=" ">Dropdown 3</a>
                  </li>
                  <li>
                    <a href=" ">Dropdown 4</a>
                  </li>
                </ul>
              </li> */}
              <li>
                <a href="#contact">Contact Us</a>
              </li>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list" onClick={handleMobileNavToggle}></i>
          </nav>
        </div>
      </header>

      {/* Scroll to Top Button */}
      {scrollTopActive && (
          <a href="#top" id="scroll-top" className="scroll-top active d-flex align-items-center justify-content-center">
            <i class="bi bi-arrow-up-short"></i>
            </a>

      )}
    </>
  );
}

export default Header;
