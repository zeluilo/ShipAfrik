import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the login logic here
    console.log({ email, password, rememberMe });
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
}

export default Login;
