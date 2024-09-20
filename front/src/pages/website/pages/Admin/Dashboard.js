import React from 'react';
import './Dashboard.css'; // Ensure you have the corresponding CSS file for custom styles

const Dashboard = () => {
  // Dummy data for demonstration
  const dummyData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    password: 'password123',
    passwordConfirmation: 'password123'
  };

  return (
    <section className="dashboard-container">
      <div className="container">
        <div className="row gy-4 align-items-center">
          <div className="col-12 col-md-6 col-xl-7">
            <div className="text-center">
              <h2 className="display-4 mb-4">Become a Shipper on ShipAfrik</h2>
              <p className="lead mb-5 text-warning">
                Register to become a certified shipper and start transporting goods efficiently.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-5">
            <div className="d-flex justify-content-center py-4">
              <a href="/" className="logo d-flex align-items-center">
                <img height={30} src={`${process.env.PUBLIC_URL}/logo.png`} alt="ShipAfrik Logo" />
                <span className="d-none d-lg-block ms-2">ShipAfrik</span>
              </a>
            </div>
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4">
                <form>
                  <div className="row gy-3">
                    {Object.entries(dummyData).map(([key, value]) => (
                      <div className="col-12" key={key}>
                        <div className="form-floating mb-3">
                          <input
                            type={key.includes('password') ? 'password' : 'text'}
                            className="form-control"
                            id={key}
                            placeholder={key.replace(/([A-Z])/g, ' $1').trim()}
                            value={value}
                            readOnly
                          />
                          <label htmlFor={key} className="form-label">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                        </div>
                      </div>
                    ))}
                    <div className="col-12">
                      <label htmlFor="businessLogo" className="form-label">Upload Business Logo</label>
                      <input
                        type="file"
                        className="form-control"
                        name="image"
                        accept="image/*"
                        id="image"
                        disabled
                      />
                    </div>
                    <div className="col-12">
                      <div className="d-grid">
                        <button className="btn btn-warning btn-lg" type="button" disabled>
                          Become A Shipper
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
