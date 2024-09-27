import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const ServiceType = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [newServiceTypeName, setNewServiceTypeName] = useState('');
  const [editServiceType, setEditServiceType] = useState(null);
  const [filterServiceType, setFilterServiceType] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch service types from server
  const fetchServiceTypes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/shipafrik/get-service-types');
      setServiceTypes(response.data);
      console.log('Service types fetched successfully:', response.data);
    } catch (error) {
      console.error('Error fetching service types:', error);
      setError('Failed to fetch service types.');
    }
  };

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  // Handle input change for new service type
  const handleInputChange = (e) => {
    setNewServiceTypeName(e.target.value);
  };

  // Handle form submission for creating/updating service type
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editServiceType) {
        // Update existing service type
        const response = await axios.put(`http://localhost:3001/shipafrik/update-service-type/${editServiceType._id}`, {
          name: newServiceTypeName,
        });
        console.log('Service type updated:', response.data);
        setSuccessMessage('Service type updated successfully.');
      } else {
        // Create new service type
        const response = await axios.post('http://localhost:3001/shipafrik/add-service-type', {
          name: newServiceTypeName,
        });
        console.log('New service type created:', response.data);
        setSuccessMessage('Service type created successfully.');
      }
      fetchServiceTypes();
      setNewServiceTypeName('');
      setEditServiceType(null);
      setError('');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form.');
    }
  };

  // Handle editing a service type
  const handleEdit = (serviceType) => {
    setNewServiceTypeName(serviceType.name);
    setEditServiceType(serviceType);
  };

  // Handle deleting a service type
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/shipafrik/delete-service-type/${id}`);
      console.log('Service type deleted:', id);
      fetchServiceTypes();
    } catch (error) {
      console.error('Error deleting service type:', error);
      setError('Failed to delete service type.');
    }
  };

  // Handle filtering service types
  const handleFilterChange = (e) => {
    setFilterServiceType(e.target.value.toLowerCase());
  };

  const filteredServiceTypes = serviceTypes.filter((serviceType) =>
    serviceType.name.toLowerCase().includes(filterServiceType)
  );

  return (
    <section className="dashboard-container">
      <div className="container">
        <div className="row gy-4" data-aos="fade-up" data-aos-delay="200">
          <div className="col-12">
            <div className="text-center mb-4">
              <h2 className="display-4">Manage Service Types</h2>
              <p className="lead text-warning">Create, update, and delete service types.</p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-5 mx-auto">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="service-type-name"
                      placeholder="Service Type Name"
                      value={newServiceTypeName}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="service-type-name">Service Type Name</label>
                  </div>

                  <div className="d-grid">
                    <button className="btn btn-warning btn-lg" type="submit">
                      {editServiceType ? 'Update Service Type' : 'Create Service Type'}
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
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Filter by Service Type Name"
                      value={filterServiceType}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                {filteredServiceTypes.length === 0 ? (
                  <p className="text-center text-muted">No service types found.</p>
                ) : (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Service Type Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServiceTypes.map((serviceType) => (
                        <tr key={serviceType._id}>
                          <td>{serviceType.name}</td>
                          <td>
                            <button className="btn btn-primary me-2" onClick={() => handleEdit(serviceType)}>
                              Edit
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDelete(serviceType._id)}>
                              Delete
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

export default ServiceType;
