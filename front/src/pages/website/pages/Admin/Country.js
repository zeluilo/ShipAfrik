import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { ip } from "../../../constants";

const Country = () => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isCreatingNewCountry, setIsCreatingNewCountry] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [cities, setCities] = useState(['']);
  const [filterName, setFilterName] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // New state for success messages

  // Fetch countries from server
  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${ip}/shipafrik/get-countries`);
      setCountries(response.data);
      setFilteredCountries(response.data);
      // console.log('Countries fetched successfully:', response.data);
    } catch (error) {
      // console.error('Error fetching countries:', error);
      // setError('Failed to fetch countries.');
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // Handle selection between creating a new country or selecting an existing one
  const handleCountrySelection = (e) => {
    const value = e.target.value;
    if (value === 'new') {
      setIsCreatingNewCountry(true);
      setSelectedCountry('');
    } else {
      setIsCreatingNewCountry(false);
      setSelectedCountry(value);
    }
    // console.log('Selected country:', value);
  };

  // Handle city change
  const handleCityChange = (index, value) => {
    const updatedCities = [...cities];
    updatedCities[index] = value.trim(); // Remove leading/trailing spaces
    setCities(updatedCities);
    // console.log(`City ${index} changed to:`, value);
  };

  // Add a new city input
  const addCity = () => setCities([...cities, '']);

  // Remove a city input
  const removeCity = (index) => {
    const updatedCities = cities.filter((_, i) => i !== index);
    setCities(updatedCities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredCities = cities.filter(city => city.trim() !== '');

    // console.log('Filtered cities before submission:', filteredCities);

    try {
      if (isCreatingNewCountry) {
        // console.log('Submitting new country:', newCountryName);
        // console.log('Submitting cities:', filteredCities);

        const response = await axios.post(`${ip}/shipafrik/add-country`, {
          name: newCountryName,
          cities: filteredCities
        });

        // console.log('New country created:', response.data);

        if (response.data.country && response.data.country.cities) {
          // console.log('Cities added to new country:', response.data.country.cities);
          setSuccessMessage('Country and cities created successfully.');
          setNewCountryName('');
          setCities([]);
          setError('');

        } else {
          // console.warn('No cities were returned for the new country.');
        }

      } else {
        // console.log('Adding cities to existing country:', selectedCountry);
        // console.log('Submitting cities:', filteredCities);

        try {
          const response = await axios.put(`${ip}/shipafrik/add-city/${selectedCountry}`, {
            cities: filteredCities
          });

          // console.log('Response from server:', response.data);
          // console.log('Cities added to country:', selectedCountry);
          // console.log('Country updated with cities:', response.data);

          setSuccessMessage('Cities added to country successfully.');
          setError('');


        } catch (error) {
          // console.error('Error while updating cities:', error);
          setError('Failed to update cities.');
        }
      }


      // Refresh country list
      fetchCountries();
      // Reset form
      setNewCountryName('');
      setCities(['']);
      setIsCreatingNewCountry(false);
      setSelectedCountry('');

    } catch (error) {
      // console.error('Error submitting form:', error);
      setError('Failed to submit form.');
    }
  };


  // Handle filtering
  const handleFilterChange = () => {
    const nameFilter = filterName.toLowerCase();
    const cityFilter = filterCity.toLowerCase();
    const filtered = countries.filter((country) => {
      const matchName = country.name.toLowerCase().includes(nameFilter);
      const matchCity = country.cities.some((city) =>
        city.name.toLowerCase().includes(cityFilter)
      );
      return (nameFilter === '' || matchName) && (cityFilter === '' || matchCity);
    });
    setFilteredCountries(filtered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [filterName, filterCity, countries]);

  // Handle delete country
  const handleDeleteCountry = async (id) => {
    try {
      await axios.delete(`${ip}/shipafrik/delete-country/${id}`);
      // console.log('Country deleted:', id);
      fetchCountries();
    } catch (error) {
      // console.error('Error deleting country:', error);
      setError('Failed to delete country.');
    }
  };

  // Handle delete city
  const handleDeleteCity = async (countryId, cityId) => {
    try {
      await axios.delete(`${ip}/shipafrik/delete-city/${countryId}/city/${cityId}`);
      // console.log('City deleted:', cityId);
      fetchCountries();
    } catch (error) {
      // console.error('Error deleting city:', error);
      setError('Failed to delete city.');
    }
  };

  return (
    <section className="dashboard-container">
      <div className="container">
        <div className="row gy-4" data-aos="fade-up" data-aos-delay="200">
          <div className="col-12">
            <div className="text-center mb-4">
              <h2 className="display-4">Manage Countries and Cities</h2>
              <p className="lead text-warning">
                Select an existing country to add cities, or create a new one.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-5 mx-auto">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      id="country-select"
                      value={selectedCountry || (isCreatingNewCountry ? 'new' : '')}
                      onChange={handleCountrySelection}
                      required
                    >
                      <option value="" disabled>Select an existing country</option>
                      {countries.map((country) => (
                        <option key={country._id} value={country._id}>
                          {country.name}
                        </option>
                      ))}
                      <option value="new">Create a new country</option>
                    </select>
                    <label htmlFor="country-select">Country</label>
                  </div>

                  {isCreatingNewCountry && (
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="new-country"
                        placeholder="New Country Name"
                        value={newCountryName}
                        onChange={(e) => setNewCountryName(e.target.value)}
                        required
                      />
                      <label htmlFor="new-country">New Country Name</label>
                    </div>
                  )}

                  {cities.map((city, index) => (
                    <div className="form-floating mb-3" key={index}>
                      <input
                        type="text"
                        className="form-control"
                        id={`city-${index}`}
                        placeholder="City Name"
                        value={city}
                        onChange={(e) => handleCityChange(index, e.target.value)}
                        required
                      />
                      <label htmlFor={`city-${index}`}>City Name</label>
                      {cities.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger mt-2"
                          onClick={() => removeCity(index)}
                        >
                          Remove City
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-primary mb-3"
                    onClick={addCity}
                  >
                    Add Another City
                  </button>

                  <div className="d-grid">
                    <button className="btn btn-warning btn-lg" type="submit">
                      {isCreatingNewCountry ? 'Create Country and Cities' : 'Add Cities to Country'}
                    </button>
                  </div>
                </form>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
              </div>
            </div>
          </div>

          {/* Table with filter */}
          <div className="col-12 mt-4">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4">
                <div className="row gy-4">
                  <div className="col-12">
                    <div className="d-flex justify-content-center">
                      <div className="col-4 me-2">
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Filter by Country Name"
                          value={filterName}
                          onChange={(e) => setFilterName(e.target.value)}
                        />
                      </div>
                      <div className="col-4 me-2">                        
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Filter by City Name"
                          value={filterCity}
                          onChange={(e) => setFilterCity(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>


                {filteredCountries.length === 0 ? (
                  <p className="text-center text-muted">No countries found.</p>
                ) : (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Country Name</th>
                        <th>Cities</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCountries.map((country) => (
                        <tr key={country._id}>
                          <td>{country.name}</td>
                          <td>
                            <tbody>
                              {country.cities.map((city) => (
                                <tr key={city._id}>
                                  <td>{city.name}</td>
                                  <td>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleDeleteCity(country._id, city._id)}
                                    >
                                      Delete City
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDeleteCountry(country._id)}
                            >
                              Delete Country
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Country;
