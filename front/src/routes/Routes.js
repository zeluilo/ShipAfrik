import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../components/Context'; // Adjust the path as needed
import ShipperHub from "../pages/website/pages/Shipper/ShipperHub";
import  BecomeShipper from "../pages/website/pages/Shipper/BecomeShipper";
import CustomerHub from "../pages/website/pages/Customer/CustomerHub";
import OrderSummary from "../pages/website/pages/Customer/OrderSummary";
import CompareQuotes from "../pages/website/pages/Customer/CompareQuotes";

const AppRoutes = () => {
  const { isLoggedIn, currentUser } = useAuth();
  // const [userDetails, setUserDetails] = useState([]);

  // useEffect(() => {
  //   const fetchUserProfile = async () => {
  //     try {
  //       const token = localStorage.getItem('token');
  //       if (!token) {
  //         throw new Error('No token found');
  //       }

  //       const uid = currentUser?.uid
  //       console.log('User UiD: ', uid)

  //       const response = await axios.get(`http://localhost:3001/universe/profile/${uid}`, {
  //         headers: {
  //           'Authorization': `Bearer ${token}`
  //         }
  //       });
  //       console.log('Response: ', response.data.userProfile)
  //       setUserDetails(response.data.userProfile)

  //     } catch (error) {
  //       console.error('Error fetching user profile:', error);
  //       // toast.info('Fetching UniMate');
  //     }
  //   };

  //   fetchUserProfile();
  // }, [currentUser]);

  // if (!isLoggedIn) {
  //   // Redirect to login page if not logged in
  //   return <Navigate to="/login" />;
  // }

  // const adminType = currentUser;

  // console.log('Account Type: ', adminType)

  return (
    <>
      <Routes>
        <Route path="/become-shipper" element={<BecomeShipper />} />
        <Route path="/shipper-hub" element={<ShipperHub />} />
        <Route path="/customer-hub" element={<CustomerHub />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/compare-quotes" element={<CompareQuotes />} />

        </Routes>
    </>
  );
};

// const getAdminComponent = (adminType) => {
//   switch (adminType) {
//     case 'Receptionist':
//       return <Main />;
//     case 'Pharmacist':
//       return <BodyPharmacist />;
//     default:
//       return null;
//   }
// };


export default AppRoutes;
