import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../components/Context";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const About = () => {
  const { isLoggedIn, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    boxSizes: [
      { size: 'Small', quantity: '' },
      { size: 'Medium', quantity: '' },
      { size: 'Large', quantity: '' },
      { size: 'Standard Barrel', quantity: '' },
    ],
    serviceType: '',
    pickupPostcode: '',
    destinationCity: '',
    collectBy: '',
    arriveBy: '',
  });

  // Handle changes in form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData(prevData => ({ ...prevData, [field]: date }));
  };

  const handleBoxSizeChange = (index, field, value) => {
    const newBoxSizes = [...formData.boxSizes];
    newBoxSizes[index][field] = value;
    setFormData(prevData => ({ ...prevData, boxSizes: newBoxSizes }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      'boxSizes',
      'serviceType',
      'pickupPostcode',
      'destinationCity',
      'collectBy',
      'arriveBy'
    ];

    for (let field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return;
      }
    }

    const payload = {
      ...formData,
      userId: currentUser,
    };

    if (isLoggedIn) {
      // If the user is logged in, use the API
      try {
        const response = await axios.post('http://localhost:3001/shipafrik/create-quote', payload, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.status === 201) {
          toast.success('Quote request submitted successfully!');
          setFormData({
            boxSizes: [
              { size: 'Small', quantity: '' },
              { size: 'Medium', quantity: '' },
              { size: 'Large', quantity: '' },
              { size: 'Standard Barrel', quantity: '' },
            ],
            serviceType: '',
            pickupPostcode: '',
            destinationCity: '',
            collectBy: '',
            arriveBy: '',
          });
          navigate('/compare-quotes');
        }
      } catch (error) {
        toast.error('Failed to submit quote request.');
      }
    } else {
      // If the user is not logged in, save the form data to local storage
      localStorage.setItem('quoteFormData', JSON.stringify(formData));
      toast.success('Quote details stored successfully in local storage!');
      navigate('/compare-quotes');
    }
  };

  return (
    <section id="get-started" className="get-started section">
      <div className="container">
        <div className="row justify-content-between gy-4">
          {/* Left content */}
          {/* <div className="col-lg-4 d-flex align-items-center" data-aos="zoom-out" data-aos-delay="100">
            <div className="content">
              <h3>About ShipAfrik</h3>
              <p>
                ShipAfrik is a cutting-edge platform designed to streamline the shipping process across Africa. Our goal is to provide a seamless experience for users to compare shipping options, book shipments, and track deliveries in real-time.
              </p>
              <p>
                Our platform integrates user-friendly interfaces with powerful tools for both customers and shippers, ensuring efficient and transparent logistics solutions. With ShipAfrik, managing your shipping needs has never been easier.
              </p>
            </div>
          </div> */}

          {/* Right form */}
          <div className="col-lg-12 content" data-aos="zoom-out" data-aos-delay="200">
          <h3 className='my-0'>Ship To Accra From London</h3>
            <form onSubmit={handleSubmit} className="php-email-form">
              {/* <h3>Request a Quote</h3> */}
              <p>
                Fill out the form below to get a customized shipping quote. Our team will get back to you with detailed information and options tailored to your needs.
              </p>
              <div className="row">
                <div className="col-xl-12">
                  {/* Table for Request Details */}
                  <table className="table table-borderless table-striped mb-4">
                    <tbody>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <label htmlFor="collectBy" className="me-2">Collect by:</label>
                            <DatePicker
                              className="form-control"
                              id="collectBy"
                              selected={formData.collectBy ? new Date(formData.collectBy) : null}
                              dateFormat="yyyy/MM/dd"
                              onChange={date => handleDateChange('collectBy', date)}
                              minDate={new Date()}
                              placeholderText="Select collection date"
                              required
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <label htmlFor="arriveBy" className="me-2">Arrive by:</label>
                            <DatePicker
                              className="form-control"
                              id="arriveBy"
                              selected={formData.arriveBy ? new Date(formData.arriveBy) : null}
                              dateFormat="yyyy/MM/dd"
                              onChange={date => handleDateChange('arriveBy', date)}
                              minDate={formData.collectBy ? new Date(formData.collectBy) : new Date()}
                              placeholderText="Select arrival date"
                              required
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <label htmlFor="serviceType" className="me-2">Type of Service:</label>
                            <select
                              id="serviceType"
                              className="form-control w-50"
                              value={formData.serviceType}
                              onChange={e => handleChange(e)}
                              name="serviceType"
                              required
                            >
                              <option value="">Select service type</option>
                              <option value="Door to Door">Door to Door</option>
                              <option value="Warehouse to Door">Warehouse to Door</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <label htmlFor="pickupPostcode" className="me-2">Pickup Postcode:</label>
                            <input
                              type="text"
                              id="pickupPostcode"
                              name="pickupPostcode"
                              className="form-control w-50"
                              placeholder="Enter postcode"
                              value={formData.pickupPostcode}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <label htmlFor="destinationCity" className="me-2">Destination City:</label>
                            <select
                              id="destinationCity"
                              className="form-control w-50"
                              value={formData.destinationCity}
                              onChange={e => handleChange(e)}
                              name="destinationCity"
                              required
                            >
                              <option value="">Select destination city</option>
                              <option value="Accra, Ghana">Accra, Ghana</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Table for Box Sizes */}
                  <div className="col-xl-6">
                    <table className="table table-borderless table-striped">
                      <thead>
                        <tr>
                          <th>Your Shipment</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.boxSizes.map((box, index) => (
                          <tr key={index}>
                            <td>{box.size}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                placeholder={`Enter ${box.size} Quantity`}
                                value={box.quantity}
                                onChange={(e) => handleBoxSizeChange(index, 'quantity', e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Submit Button */}
                  <div className="row mt-4">
                    <div className="col text-center">
                      <button type="submit" className="btn btn-primary">Compare Quotes</button>
                    </div>
                  </div>
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
