import React from 'react';

// Main Services Section Component
const Services = () => {
  const formContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
  };

  const formStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '30px',
    flexWrap: 'nowrap',
  };

  const inputStyle = {
    width: '300px',
  };

  const buttonStyle = {
    padding: '10px 40px',
    fontSize: '17px',
  };

  return (
    <section id="constructions" className="constructions section" style={{ textAlign: 'center' }}>
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Get in Touch</h2>
        <p>We offer solutions designed to make your shipping experience smooth and transparent.</p>
        {/* Contact Form */}
        <div className="contact-form-container" style={formContainerStyle}>
          <form action="your-submission-endpoint" method="post" className="contact-form" style={formStyle}>
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="floatingName"
                placeholder="Full Name"
                style={inputStyle}
                required
              />
              <label htmlFor="floatingName">Full Name</label>
            </div>
            <div className="form-floating">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                placeholder="Email Address"
                style={inputStyle}
                required
              />
              <label htmlFor="floatingEmail">Email Address</label>
            </div>
            <button type="submit" className="btn btn-warning" style={buttonStyle}>Subscribe</button>
          </form>
        </div>
      </div>
      {/* End Section Title */}
    </section>
  );
};

export default Services;
