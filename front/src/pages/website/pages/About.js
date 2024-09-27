import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../components/Context";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const About = () => {
  const { isLoggedIn, currentUser } = useAuth();
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

  const [serviceTypes, setServiceTypes] = useState([]);
  const [postcodeDetails, setPostcodeDetails] = useState({ region: '', country: '' });
  const [postcodeSuccess, setPostcodeSuccess] = useState('');
  const [postcodeError, setPostcodeError] = useState('');
  const [data, setData] = useState([]);

  // Fetch service types from the database
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/shipafrik/get-service-types');
        setServiceTypes(response.data);
      } catch (error) {
        toast.error('Failed to load service types');
      }
    };
    fetchServiceTypes();
  }, []);

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

  // Postcode Lookup
  const postCodeLookUp = async () => {
    setPostcodeError('');
    setPostcodeSuccess('');
    setPostcodeDetails({ region: '', country: '' }); // Clear previous details

    if (!formData.pickupPostcode) {
      setPostcodeError('Please enter a postcode.');
      return;
    }

    try {
      const response = await axios.get(`https://api.postcodes.io/postcodes/${formData.pickupPostcode}`);
      const { region, country } = response.data.result;
      setPostcodeDetails({ region, country });
      setPostcodeSuccess('Postcode lookup successful.'); // Set success message
    } catch (error) {
      setPostcodeError('Invalid postcode or postcode lookup failed.'); // Set error if lookup fails
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['serviceType', 'pickupPostcode', 'destinationCity', 'collectBy', 'arriveBy'];
    for (let field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return;
      }
    }

    const payload = { ...formData, userId: currentUser };
    if (isLoggedIn) {
      try {
        const response = await axios.post('http://localhost:3001/shipafrik/create-quote', payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.status === 201) {
          toast.success('Quote request submitted successfully!');
          resetForm();
          navigate('/compare-quotes');
        }
      } catch (error) {
        toast.error('Failed to submit quote request.');
      }
    } else {
      localStorage.setItem('quoteFormData', JSON.stringify(formData));
      toast.success('Quote details stored successfully in local storage!');
      navigate('/compare-quotes');
    }
  };

  const resetForm = () => {
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
    setPostcodeDetails({ region: '', country: '' });
  };

  useEffect(() => {
    fetchCountriesAndCities();
  }, []);

  // Fetch countries and cities
  const fetchCountriesAndCities = async () => {
    try {
      const response = await axios.get('http://localhost:3001/shipafrik/get-countries');
      const countries = response.data;

      // Combine cities with their respective countries into a single list for react-select options
      const combined = countries.flatMap(country =>
        country.cities.map(city => ({
          value: `${city.name}, ${country.name}`, // city, country combined as value
          label: `${city.name}, ${country.name}`  // city, country combined as label
        }))
      );

      setData(combined); // Set the combined city-country list for Select component
    } catch (error) {
      console.error('Error fetching countries and cities:', error);
    }
  };

  return (
    <section id="get-started" className="get-started section">
      <div className="container">
        <div className="row justify-content-between gy-4">
          <div className="col-lg-12 content" data-aos="zoom-out" data-aos-delay="200">
            <h3 className='my-0'>Ship To Accra From London</h3>
            <form onSubmit={handleSubmit} className="php-email-form">
              <p>Fill out the form below to get a customized shipping quote. Our team will get back to you with detailed information and options tailored to your needs.</p>
              <div className="row">
                <div className="col-xl-12">
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
                              onChange={handleChange}
                              name="serviceType"
                              required
                            >
                              <option value="">Select service type</option>
                              {serviceTypes.map((type, index) => (
                                <option key={index} value={type.name}>{type.name}</option>
                              ))}
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
                            <button type="button" className="btn btn-secondary ms-2" onClick={postCodeLookUp}>Postcode</button>
                          </div>
                          {/* Display the region and country if found */}
                          {postcodeDetails.region && (
                            <div className="mt-2">
                              <strong>Region:</strong> {postcodeDetails.region} <br />
                              <strong>Country:</strong> {postcodeDetails.country}
                            </div>
                          )}

                          {postcodeSuccess && (
                            <div className="mt-2 text-success">
                              {postcodeSuccess}
                            </div>
                          )}

                          {/* Display error message if postcode lookup fails */}
                          {postcodeError && (
                            <div className="mt-2 text-danger">
                              {postcodeError}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <label htmlFor="destinationCity" className="me-2">Destination City:</label>
                            <select
                              id="destinationCity"
                              className="form-control w-75"
                              value={formData.destinationCity}
                              onChange={handleChange}
                              name="destinationCity"
                              required
                            >
                              <option value="">Select destination city</option>
                              {data.map((option, index) => (
                                <option key={index} value={option.value}>
                                 {option.label}
                                </option>
                              ))}
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
                  <div className="col-xl-12 text-center">
                    <button type="submit" className="btn btn-primary mt-3">Compare Quotes</button>
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
