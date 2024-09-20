import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Context';
import { toast } from 'react-toastify';
import axios from 'axios';

function Login() {
  const { login, setCurrentUser, setAuthData } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate email format
    const { email, password } = formData;

    // Check if email or password is empty
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setShowErrorAlert(true);
      toast.error('Please enter both email and password.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Enter a valid email address.');
      setShowErrorAlert(true);
      toast.error('Invalid email format.');
      return;
    }

    try {
      console.log('Attempting login...');

      // Authenticate user with server
      const response = await axios.post('http://localhost:3001/shipafrik/login', { email, password });
      console.log('Response: ', response.data);

      const { token, user } = response.data;
      console.log('User:', user);
      console.log('Token:', token);
      // Handle successful login
      setCurrentUser(user);

      // Set token expiration
      const tokenValidityPeriodInMillis = 3600000; // 1 hour in milliseconds
      const tokenCreationTime = new Date().getTime(); // Current time
      const tokenExpiration = tokenCreationTime + tokenValidityPeriodInMillis;
      login(user, token, tokenExpiration);
      setAuthData({ user, token, tokenExpiration });
      
      const userResponse = await axios.get(`http://localhost:3001/shipafrik/user/${user}`);
      console.log('User Data:', userResponse.data)

      if (userResponse.data.userType === 'SHIPPER') {
        navigate('/shipper-hub', { state: { successMessage: 'Logged in successfully!' } });
      } else if (userResponse.data.userType === 'USER') {
        navigate('/customer-hub', { state: { successMessage: 'Logged in successfully!' } });
      } else {
        navigate('/', { state: { successMessage: 'Logged in successfully!' } });
      }
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Error during login:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setErrorMessage(errorMessage);
      setShowErrorAlert(true);
      toast.warn(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  return (
    <section className="bg-dark min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row gy-4 align-items-center" data-aos="zoom-up" data-aos-delay="150">
          <div className="col-12 col-md-6 col-xl-7">
            <div className="d-flex justify-content-center text-bg-dark">
              <div className="col-12 col-xl-9">
                <hr className="border-primary-subtle mb-4" />
                <h2 className="h1 mb-4">Welcome Back to ShipAfrik.</h2>
                <p className="lead mb-5" style={{ color: '#feb900' }}>
                  Log in to manage your shipments, track deliveries, and access your personalized dashboard for a
                  smooth and efficient shipping experience.                  </p>
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
                      <h3>Sign in</h3>
                      <p>Don't have an account? <Link to='/register'>Sign up</Link></p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="row gy-3 overflow-hidden">
                    <div className="col-12">
                      <div className="form-floating mb-3">
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          id="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="email" className="form-label">Email</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating mb-3">
                        <input
                          type={showPassword ? 'text' : 'password'} // Toggle between text and password
                          className="form-control"
                          name="password"
                          id="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="password" className="form-label">Password</label>
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label"
                          onClick={togglePasswordVisibility} // Toggle password visibility on click
                          style={{ marginTop: 5, cursor: 'pointer' }}
                        >
                          {showPassword ? 'Hide Password' : 'Show Password'}{' '}
                          <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-grid">
                        <button className="btn btn-warning btn-lg" type="submit">Login</button>
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
}

export default Login;
