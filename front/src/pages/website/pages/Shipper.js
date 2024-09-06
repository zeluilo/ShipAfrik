import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../components/Context';
import { useNavigate } from 'react-router-dom';

const Shipper = () => {
  // State for handling form input
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    phoneNumber: '',
    shippingLicense: '',
    address: '',
    vehicleDetails: '',
    email: '',
    documents: null
  });

//   const { isLoggedIn } = useAuth();
//   const navigate = useNavigate();

// //   useEffect(() => {
//     // if (!isLoggedIn) {
//     //   navigate('/login');
//     //   console.log('Logged IN: ', isLoggedIn);
//     // }
// //   }, [isLoggedIn, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    setFormData({ ...formData, documents: e.target.files[0] });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here (e.g., API call)
    console.log('Form submitted:', formData);
  };

  return (
    <section className="bg-dark min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row gy-4 align-items-center">
          {/* Left Side Info */}
          <div className="col-12 col-md-6 col-xl-7">
            <div className="d-flex justify-content-center text-bg-dark">
              <div className="col-12 col-xl-9">
                <hr className="border-primary-subtle mb-4" />
                <h2 className="h1 mb-4">Become a Shipper on ShipAfrik</h2>
                <p className="lead mb-5" style={{ color: '#feb900' }}>
                  Register to become a certified shipper and start transporting goods efficiently.
                </p>
                <hr className="border-primary-subtle mb-4" />
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="col-12 col-md-6 col-xl-5">
            <div className="d-flex justify-content-center py-4">
              <a href="/" className="logo d-flex align-items-center w-auto">
                <img height={30} src={`${process.env.PUBLIC_URL}/logo.png`} alt="" />
                <span className="d-none d-lg-block">ShipAfrik</span>
              </a>
            </div>
            <div className="card border-0 rounded-4">
              <div className="card-body p-3 p-md-4 p-xl-5">
                <form onSubmit={handleSubmit}>
                  <div className="row gy-3">
                    <div className="col-12">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          name="businessName"
                          id="businessName"
                          placeholder="Business Name"
                          value={formData.businessName}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="businessName" className="form-label">Business Name</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          name="businessType"
                          id="businessType"
                          placeholder="Business Type"
                          value={formData.businessType}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="businessType" className="form-label">Business Type</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-floating mb-3">
                        <input
                          type="tel"
                          className="form-control"
                          name="phoneNumber"
                          id="phoneNumber"
                          placeholder="Phone Number"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          name="shippingLicense"
                          id="shippingLicense"
                          placeholder="Shipping License Number"
                          value={formData.shippingLicense}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="shippingLicense" className="form-label">Shipping License Number</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          id="address"
                          placeholder="Address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="address" className="form-label">Address</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          name="vehicleDetails"
                          id="vehicleDetails"
                          placeholder="Vehicle Details"
                          value={formData.vehicleDetails}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="vehicleDetails" className="form-label">Vehicle Details</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="documents" className="form-label">Upload Documents</label>
                      <input
                        type="file"
                        className="form-control"
                        name="documents"
                        id="documents"
                        onChange={handleFileChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <div className="d-grid">
                        <button className="btn btn-warning btn-lg" type="submit">Become a Shipper</button>
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

export default Shipper;
