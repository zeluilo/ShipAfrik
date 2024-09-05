import React from 'react';

const About = () => {
  return (
    <section id="get-started" className="get-started section">
      <div className="container">
        <div className="row justify-content-between gy-4">

          {/* Left content */}
          <div className="col-lg-6 d-flex align-items-center" data-aos="zoom-out" data-aos-delay="100">
            <div className="content">
              <h3>About ShipAfrik</h3>
              <p>
                ShipAfrik is a cutting-edge platform designed to streamline the shipping process across Africa. Our goal is to provide a seamless experience for users to compare shipping options, book shipments, and track deliveries in real-time.
              </p>
              <p>
                Our platform integrates user-friendly interfaces with powerful tools for both customers and shippers, ensuring efficient and transparent logistics solutions. With ShipAfrik, managing your shipping needs has never been easier.
              </p>
            </div>
          </div>

          {/* Right form */}
          <div className="col-lg-5" data-aos="zoom-out" data-aos-delay="200">
            <form action="forms/quote.php" method="post" className="php-email-form">
              <h3>Request a Quote</h3>
              <p>Fill out the form below to get a customized shipping quote. Our team will get back to you with detailed information and options tailored to your needs.</p>
              <div className="row gy-3">

                <div className="col-12">
                  <input type="text" name="name" className="form-control" placeholder="Name" required />
                </div>

                <div className="col-12">
                  <input type="email" className="form-control" name="email" placeholder="Email" required />
                </div>

                <div className="col-12">
                  <input type="text" className="form-control" name="phone" placeholder="Phone" required />
                </div>

                <div className="col-12">
                  <textarea className="form-control" name="message" rows="6" placeholder="Message" required></textarea>
                </div>

                <div className="col-12 text-center">
                  <div className="loading">Loading</div>
                  <div className="error-message"></div>
                  <div className="sent-message">Your quote request has been sent successfully. Thank you!</div>
                  <button type="submit">Get a Quote</button>
                </div>

              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
