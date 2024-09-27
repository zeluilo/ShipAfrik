import React from 'react';

// Card Component
const ServiceCard = ({ iconClass, title, description, delay }) => {
  return (
    <div className="col-lg-4" data-aos="fade-up" data-aos-delay={delay}>
      <div className="card-item">
        <div className="row">
          <div className="col-xl-12 text-center">
            {/* Icon with larger size, bold and thick styling */}
            <div className="icon-container" style={{ height: 57, width: 57, border: '3px solid #ccc', borderRadius: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
              <i className={iconClass} style={{ fontSize: 26, color: '#feb900', fontWeight: 'bold', lineHeight: 1.5 }}></i>
            </div>
          </div>
          <div className="col-xl-12 d-flex align-items-center">
            <div className="card-body text-center">
              <h4 className="card-title">{title}</h4>
              <p>{description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Services Section Component
const Services = () => {
  const constructionData = [
    {
      iconClass: "bi bi-check2",
      title: "Simple Search",
      description: "No more having to call around. Now you can search all available shippers.",
      delay: 200
    },
    {
      iconClass: "bi bi-flag",
      title: "Transparency",
      description: "Compare all of the available shippers based on your requirements and their availability.",
      delay: 400
    },
    {
      iconClass: "bi bi-star",
      title: "Open Communication",
      description: "Communicate directly with your shipper.",
      delay: 600
    },
  ];

  return (
    <section id="constructions" className="constructions section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
      <h2>Our Services</h2>
      <p>We offer solutions designed to make your shipping experience smooth and transparent.</p>
      </div>
      {/* End Section Title */}

      <div className="container">
        <div className="row">
          {constructionData.map((item, index) => (
            <ServiceCard
              key={index}
              iconClass={item.iconClass}
              title={item.title}
              description={item.description}
              delay={item.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
