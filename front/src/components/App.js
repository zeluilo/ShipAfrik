import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context'; // Adjust the path as needed
import AppRoutes from '../routes/Routes';
import Login from '../pages/profile/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from '../pages/website/Home';
import Register from '../pages/profile/Register';
import Shipper from '../pages/website/pages/Shipper';
import Header from '../pages/website/main/Header';
import Footer from '../pages/website/main/Footer';
// import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';
// const stripePromise = loadStripe('pk_test_51PVEeIDM9qphnwuRJA3P6Z3riumxF2MNP6D372ltE1rgc8EpbirnzeFpGZp0cnjSbywFWgTUweGESiMgq1W7Xqyl00XfrgLfW2');

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer />
        {/* <Elements stripe={stripePromise}> */}
        <Header />
        <main className="main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/become-shipper" element={<Shipper />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </main>
        <Footer />
        {/* </Elements> */}
      </AuthProvider>
    </Router>
  );
}

export default App;
