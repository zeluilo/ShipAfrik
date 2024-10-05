import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './Context'; // Adjust the path as needed
import Login from '../pages/profile/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from '../pages/website/Home';
import Register from '../pages/profile/Register';
import Header from '../pages/website/main/Header';
import Footer from '../pages/website/main/Footer';
import Sidebar from '../pages/website/pages/Admin/Sidebar'; // Import the Sidebar component
import RouteSwitch from '../routes/RouteSwitch';
import AppRoutes from '../routes/Routes';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Create a Layout component to manage header and sidebar visibility
const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin-dashboard');
  
  return (
    <div className="main-container">
      {/* Conditionally render Header based on route */}
      {!isDashboard && <Header />}
      
      <div className="content-wrapper">
        {/* Conditionally render Sidebar based on route */}
        {isDashboard && <Sidebar />}
        <main className={`main ${isDashboard ? 'main-with-sidebar' : ''}`}>
          {/* Render child routes */}
          <Outlet />
        </main>
      </div>
      
      {/* Conditionally render Footer based on route */}
    </div>
  );
};

function App() {
  return (
    <Elements stripe={stripePromise}>
    <Router>
      <AuthProvider>
      {/* <Header /> */}
        <ToastContainer />
        <Routes>
          {/* Layout route manages common elements (header, sidebar, footer) */}
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<AppRoutes />} />

            {/* Admin dashboard routes */}
            <Route path="/admin-dashboard/*" element={<RouteSwitch />} />
          </Route>
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
    </Elements>
  );
}

export default App;
