import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <main className="main">

      {/* Hero Section */}
      <section id="hero" className="hero section dark-background">

        <div className="info d-flex align-items-center">
          <div className="container">
            <div className="row justify-content-center" data-aos="fade-up" data-aos-delay="100">
              <div className="col-lg-6 text-center">
                <h2>Welcome to UpConstruction</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <Link to="#get-started" className="btn-get-started">Get Started</Link>
              </div>
            </div>
          </div>
        </div>

        <div id="hero-carousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
          
          <div className="carousel-inner">
            <div className="carousel-item">
              <img src="assets/img/hero-carousel/hero-carousel-1.jpg" alt="Carousel slide 1" />
            </div>
            <div className="carousel-item active">
              <img src="assets/img/hero-carousel/hero-carousel-2.jpg" alt="Carousel slide 2" />
            </div>
            <div className="carousel-item">
              <img src="assets/img/hero-carousel/hero-carousel-3.jpg" alt="Carousel slide 3" />
            </div>
            <div className="carousel-item">
              <img src="assets/img/hero-carousel/hero-carousel-4.jpg" alt="Carousel slide 4" />
            </div>
            <div className="carousel-item">
              <img src="assets/img/hero-carousel/hero-carousel-5.jpg" alt="Carousel slide 5" />
            </div>
          </div>

          <a className="carousel-control-prev" href="#hero-carousel" role="button" data-bs-slide="prev" aria-label="Previous">
            <span className="carousel-control-prev-icon bi bi-chevron-left" aria-hidden="true"></span>
          </a>

          <a className="carousel-control-next" href="#hero-carousel" role="button" data-bs-slide="next" aria-label="Next">
            <span className="carousel-control-next-icon bi bi-chevron-right" aria-hidden="true"></span>
          </a>

        </div>

      </section>
      {/* /Hero Section */}

    </main>
  );
}

export default About;
