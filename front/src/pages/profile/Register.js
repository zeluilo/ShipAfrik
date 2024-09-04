import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const payload = {
        ...form,
        userType: 'USER', // Include userType if required by your server
      };

      console.log('Submitting registration form with data:', payload); // Log the form data

      const response = await axios.post('https://localhost:3001/shipafrik/register', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response from server:', response.data); // Log server response

      if (response.data.message.includes('successfully')) {
        toast.success('Registration successful!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error registering Customer:', error);
      toast.error('Error registering Customer. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="bg-dark min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row gy-4 align-items-center">
          <div className="col-12 col-md-6 col-xl-7">
            <div className="d-flex justify-content-center text-bg-dark">
              <div className="col-12 col-xl-9">
                <hr className="border-primary-subtle mb-4" />
                <h2 className="h1 mb-4">Join ShipAfrik.</h2>
                <p className="lead mb-5" style={{ color: '#feb900' }}>
                  Sign up to start booking shipments, tracking deliveries, and accessing your personalized
                  dashboard for easy and efficient shipping management.
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
                <div className="row">
                  <div className="col-12">
                    <div className="mb-4">
                      <h3>Create Account</h3>
                      <p>Already have an account? <Link to='/login'>Login</Link></p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit}>
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
                      <div className="d-grid">
                        <button className="btn btn-warning btn-lg" type="submit">Create your account</button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex gap-2 gap-md-4 flex-column flex-md-row justify-content-md-end mt-4">
                      <a href="#!">Forgot password</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
