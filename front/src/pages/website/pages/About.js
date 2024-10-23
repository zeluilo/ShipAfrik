import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../components/Context";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { ip } from "../../constants";
import { FaPlus, FaMinus } from 'react-icons/fa'; // Import Font Awesome icons

const About = () => {
  const { isLoggedIn, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    serviceType: [],
    pickupPostcode: '',
    destinationCity: '',
    collectBy: '',
    arriveBy: '',
  });

  const [serviceTypes, setServiceTypes] = useState([]);
  const [showOptions, setShowOptions] = useState(false); // State to control dropdown visibility
  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const [postcodeDetails, setPostcodeDetails] = useState({ region: '', country: '' });
  const [postcodeSuccess, setPostcodeSuccess] = useState('');
  const [postcodeError, setPostcodeError] = useState('');
  const [data, setData] = useState([]);

  // Fetch service types from the database
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const response = await axios.get(`${ip}/shipafrik/get-service-types`);
        setServiceTypes(response.data);
      } catch (error) {
        // toast.error('Failed to load service types');
      }
    };
    fetchServiceTypes();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox") {
      // Handle service type checkboxes
      setFormData((prevData) => {
        const serviceTypes = checked
          ? [...prevData.serviceType, value] // Add the value if checked
          : prevData.serviceType.filter((type) => type !== value); // Remove the value if unchecked

        return {
          ...prevData,
          serviceType: serviceTypes,
        };
      });
    } else {
      // Handle other input fields
      setFormData((prevData) => ({
        ...prevData,
        [name]: value, // Update the field based on name attribute
      }));
    }
  };

  const handleDateChange = (field, date) => {
    setFormData(prevData => ({ ...prevData, [field]: date }));
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
    // Prepare the rows (items) data
    const items = rows.map(row => ({
      weight: row.weight,
      length: row.length,
      height: row.height,
      width: row.width,
      fragile: row.fragile
    }));

    if (isLoggedIn) {
      const payload = {
        ...formData,
        userId: currentUser,
        items: rows
      };
      try {
        const response = await axios.post(`${ip}/shipafrik/create-quote`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.status === 201) {
          localStorage.removeItem('quoteFormData');
          localStorage.setItem('quoteFormData', JSON.stringify(payload));
          toast.success('Quote request submitted successfully!');
          resetForm();
          navigate('/compare-quotes');
        }
      } catch (error) {
        toast.error('Failed to submit quote request.');
      }
    } else {
      const dataToStore = {
        ...formData,
        items // Add the items to form data
      };
      console.log('Data Store: ', dataToStore);
      // Clear the form data from localStorage
      localStorage.removeItem('quoteFormData');

      // Update localStorage with the new formData
      localStorage.setItem('quoteFormData', JSON.stringify(dataToStore));

      toast.success('Quote details stored successfully in local storage!');

      // Clear the form data after saving to localStorage
      // resetForm();  // This function will reset the form fields
      navigate('/compare-quotes');
    }
  };

  const resetForm = () => {
    setFormData({
      serviceType: [],
      pickupPostcode: '',
      destinationCity: '',
      collectBy: '',
      arriveBy: '',
    });
    setRows([{ weight: '', length: '', height: '', width: '', fragile: '' }]);
    setPostcodeDetails({ region: '', country: '' });
  };

  useEffect(() => {
    fetchCountriesAndCities();
  }, []);

  // Fetch countries and cities
  const fetchCountriesAndCities = async () => {
    try {
      const response = await axios.get(`${ip}/shipafrik/get-countries`);
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

  const [rows, setRows] = useState([
    { weight: '', length: '', height: '', width: '', fragile: '' }
  ]);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { weight: '', length: '', height: '', width: '', fragile: '' }]);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((row, i) => i !== index);
    setRows(updatedRows);
  };

  return (
    <section id="get-started" className="get-started section">
      <div className="container">
        <div className="row justify-content-between">
          <div className="col-lg-12 content p-3" data-aos="zoom-out" data-aos-delay="200">
            <h3 className='my-3'>Ship To Accra From London</h3>
            <form onSubmit={handleSubmit}>
              <p>Fill out the form below to get a customized shipping quote. Our team will get back to you with detailed information and options tailored to your needs.</p>

              <div className="row">
                {/* First Row */}
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="collectBy" className="form-label">Collect by:</label>
                    <div className="d-flex">
                      <DatePicker
                        className="form-control"
                        selected={formData.collectBy ? new Date(formData.collectBy) : null}
                        dateFormat="yyyy/MM/dd"
                        onChange={(date) => handleDateChange('collectBy', date)}
                        minDate={new Date()}
                        placeholderText="Select collection date"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="arriveBy" className="form-label">Arrive by:</label>
                    <div className="d-flex">
                      <DatePicker
                        className="form-control"
                        id="arriveBy"
                        selected={formData.arriveBy ? new Date(formData.arriveBy) : null}
                        dateFormat="yyyy/MM/dd"
                        onChange={(date) => handleDateChange('arriveBy', date)}
                        minDate={formData.collectBy ? new Date(formData.collectBy) : new Date()}
                        placeholderText="Select arrival date"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="serviceType" className="form-label">Type of Service:</label>
                    <div className="form-control" onClick={toggleOptions} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                      <span>{formData.serviceType.length > 0 ? formData.serviceType.join(', ') : 'Select Service Type'}</span>
                    </div>
                    {showOptions && (
                      <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 1000, backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
                        {serviceTypes.length > 0 ? (
                          serviceTypes.map((type, index) => (
                            <div key={index} className="form-check">
                              <input
                                type="checkbox"
                                id={`serviceType${index}`}
                                name="serviceType"
                                value={type.name}
                                className="form-check-input"
                                checked={formData.serviceType.includes(type.name)}
                                onChange={handleChange}
                              />
                              <label htmlFor={`serviceType${index}`} className="form-check-label">
                                {type.name}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p>No service types available.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Second Row */}
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="pickupPostcode" className="form-label">Pickup Postcode:</label>
                    <div className="d-flex">
                      <input
                        type="text"
                        id="pickupPostcode"
                        name="pickupPostcode"
                        className="form-control"
                        placeholder="Enter postcode"
                        value={formData.pickupPostcode}
                        onChange={handleChange}
                        required
                      />
                      <button type="button" className="btn btn-secondary ms-2" onClick={postCodeLookUp}>Postcode</button>
                    </div>
                    {/* Region and Country Display */}
                    {postcodeDetails.region && (
                      <div className="mt-2">
                        <strong>Region:</strong> {postcodeDetails.region} <br />
                        <strong>Country:</strong> {postcodeDetails.country}
                      </div>
                    )}
                    {/* Postcode lookup messages */}
                    {postcodeSuccess && (
                      <div className="mt-2 text-success">{postcodeSuccess}</div>
                    )}
                    {postcodeError && (
                      <div className="mt-2 text-danger">{postcodeError}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="destinationCity" className="form-label">Destination City:</label>
                    <select
                      id="destinationCity"
                      className="form-control"
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
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Weight (kg)</th>
                          <th>Length (cm)</th>
                          <th>Height (cm)</th>
                          <th>Width (cm)</th>
                          <th>Fragile</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter weight"
                                value={row.weight}
                                onChange={(e) => handleRowChange(index, 'weight', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter length"
                                value={row.length}
                                onChange={(e) => handleRowChange(index, 'length', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter height"
                                value={row.height}
                                onChange={(e) => handleRowChange(index, 'height', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter width"
                                value={row.width}
                                onChange={(e) => handleRowChange(index, 'width', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <select
                                className="form-control"
                                value={row.fragile}
                                onChange={(e) => handleRowChange(index, 'fragile', e.target.value)}
                                required
                              >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => handleDeleteRow(index)}
                              >
                                <FaMinus />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button type="button" className="btn btn-success" onClick={handleAddRow}>
                      <FaPlus className="text-center m-2" />Add Row
                    </button>
                  </div>
                </div>
              </div>


              <div className="text-center">
                <button type="submit" className="btn btn-warning mt-3">Compare Quotes</button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
