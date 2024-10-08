import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from "../../../../components/Context";
import { ip } from "../../../constants";

const BecomeShipper = () => {
  const { isLoggedIn, currentUser } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirmation: '',
    image: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  // Function to validate the password
  const validatePassword = (password) => {
    // Check length and contains a number
    const hasNumber = /\d/;
    return password.length > 8 && hasNumber.test(password);
  };

  // Function to handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({
      ...form,
      image: file, // Update with the file object
    });

    // Log the file details
    if (file) {
      // console.log('Selected file:', file);
      // console.log('File name:', file.name);
      // console.log('File size:', file.size);
      // console.log('File type:', file.type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isLoggedIn) {
      // Validate password and passwordConfirmation match
      if (form.password !== form.passwordConfirmation) {
        toast.error('Passwords do not match');
        return;
      }
  
      // Validate password criteria
      if (!validatePassword(form.password)) {
        toast.error('Password must be more than 8 characters and include at least one number');
        return;
      }
  
      try {
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
          formData.append(key, form[key]);
        });
  
        // console.log('Submitting registration form with data:', formData); // Log the form data
  
        const response = await axios.post(`${ip}/shipafrik/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        // console.log('Response from server:', response.data); // Log server response
  
        // Handle response based on status code
        if (response.status === 201) { // Created
          toast.success(response.data.message || 'Registration successful!');
          setSuccessMessage('Thank you for registering as a shipper. An email confirmation will be sent once your application is approved.');
          // Reset the form fields
          setForm({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            passwordConfirmation: '',
            image: null,
          });
          document.getElementById('image').value = '';
        } else if (response.status === 400) { // Bad Request
          toast.error(response.data.message || 'Error with registration details.');
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      } catch (error) {
        // console.error('Error registering Customer:', error);
  
        // Handle different types of errors
        if (error.response) {
          toast.error(error.response.data.message || 'Error registering Customer. Please try again.');
        } else if (error.request) {
          toast.error('No response received from server. Please try again.');
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      }
    } else {
      // Update profile image only
      try {
        const formData = new FormData();
        formData.append('image', form.image);
  
        // console.log('Updating profile image with data:', formData); // Log the form data
  
        const response = await axios.put(`${ip}/shipafrik/update-user/${currentUser}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        // console.log('Response from server:', response.data); // Log server response
  
        if (response.status === 200) { // OK
          toast.success('Profile image updated successfully!');
          setSuccessMessage('Thank you for registering as a shipper. An email confirmation will be sent once your application is approved.');
          setForm({ image: null });
          document.getElementById('image').value = '';

        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      } catch (error) {
        // console.error('Error updating profile image:', error);
  
        if (error.response) {
          toast.error(error.response.data.message || 'Error updating profile image. Please try again.');
        } else if (error.request) {
          toast.error('No response received from server. Please try again.');
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      }
    }
  };
  

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="bg-dark min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row gy-4 align-items-center" data-aos="zoom-up" data-aos-delay="150">
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
                  {!isLoggedIn ? (
                    <div className="row gy-3">
                      <div className="col-12 col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            id="firstName"
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                          />
                          <label htmlFor="firstName" className="form-label">First Name</label>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            id="lastName"
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                          />
                          <label htmlFor="lastName" className="form-label">Last Name</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-floating mb-3">
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            id="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                          />
                          <label htmlFor="email" className="form-label">Email</label>
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
                            value={form.phoneNumber}
                            onChange={handleChange}
                            required
                          />
                          <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-floating mb-3">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            name="password"
                            id="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                          />
                          <label htmlFor="password" className="form-label">Password</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-floating mb-3">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            name="passwordConfirmation"
                            id="passwordConfirmation"
                            placeholder="Confirm Password"
                            value={form.passwordConfirmation}
                            onChange={handleChange}
                            required
                          />
                          <label htmlFor="passwordConfirmation" className="form-label">Confirm Password</label>
                        </div>
                        <div className="col-12">
                          <label
                            className="form-label"
                            onClick={togglePasswordVisibility}
                            style={{ marginTop: 5, cursor: 'pointer' }}
                          >
                            {showPassword ? 'Hide Password' : 'Show Password'}{' '}
                            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <label htmlFor="businessLogo" className="form-label">Upload Business Logo</label>
                        <input
                          type="file"
                          className="form-control"
                          name="image"
                          accept="image/*"
                          id="image"
                          onChange={handleFileChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <div className="d-grid">
                          <button className="btn btn-warning btn-lg" type="submit">Become A Shipper</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="row gy-3">
                        <div className="col-12">
                          <label htmlFor="businessLogo" className="form-label">Upload Business Logo</label>
                          <input
                            type="file"
                            className="form-control"
                            name="image"
                            accept="image/*"
                            id="image"
                            onChange={handleFileChange}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <div className="d-grid">
                            <button className="btn btn-warning btn-lg" type="submit">Become A Shipper</button>
                          </div>
                        </div>
                      </div>
                  )}
                </form>
                {successMessage && (
                  <div className="alert alert-success mt-4">
                    {successMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeShipper;
