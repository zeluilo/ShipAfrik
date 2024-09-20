import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/website/pages/Admin/Dashboard';
import Country from '../pages/website/pages/Admin/Country';
// import ShipperHub from "../pages/website/pages/Shipper/ShipperHub";
// import BecomeShipper from "../pages/website/pages/Shipper/BecomeShipper";
// import CustomerHub from "../pages/website/pages/Customer/CustomerHub";
// import OrderSummary from "../pages/website/pages/Customer/OrderSummary";
// import CompareQuotes from "../pages/website/pages/Customer/CompareQuotes";
// import ManageDoctor from '../pages/website/pages/Admin/ManageDoctor';
// import ManageNurse from '../pages/website/pages/Admin/ManageNurse';
// import ManagePharmacist from '../pages/website/pages/Admin/ManagePharmacist';
// import ManageAccountant from '../pages/website/pages/Admin/ManageAccountant';
// import ManageReceptionist from '../pages/website/pages/Admin/ManageReceptionist';
// import RegisterPatient from '../pages/website/pages/Patient/RegisterPatient';
// import ManagePatient from '../pages/website/pages/Patient/ManagePatient';
// import AddFamily from '../pages/website/pages/Patient/AddFamily';
// import BioData from '../pages/website/pages/Patient/BioData';
// import ViewRecords from '../pages/website/pages/Patient/ViewRecords';
// import CheckQueue from '../pages/website/pages/Customer/CheckQueue';
// import CreateAppointments from '../pages/website/pages/Customer/CreateAppointments';
// import ManageAppointments from '../pages/website/pages/Customer/ManageAppointments';
// import DataReport from '../pages/website/pages/Other/DataReport';
// import ViewBookings from '../pages/website/pages/Customer/ViewBookings';

const RouteSwitch = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/admin-dashboard" element={<Dashboard />} />
      <Route path="/countries-cities" element={<Country />} />
      {/* <Route path="/become-shipper" element={<BecomeShipper />} />
      <Route path="/shipper-hub" element={<ShipperHub />} />
      <Route path="/customer-hub" element={<CustomerHub />} />
      <Route path="/order-summary" element={<OrderSummary />} />
      <Route path="/compare-quotes" element={<CompareQuotes />} />
      <Route path="/manage-doctor" element={<ManageDoctor />} />
      <Route path="/manage-nurse" element={<ManageNurse />} />
      <Route path="/manage-pharmacist" element={<ManagePharmacist />} />
      <Route path="/manage-accountant" element={<ManageAccountant />} />
      <Route path="/manage-receptionist" element={<ManageReceptionist />} />
      <Route path="/register-patient" element={<RegisterPatient />} />
      <Route path="/manage-patient" element={<ManagePatient />} />
      <Route path="/add-family" element={<AddFamily />} />
      <Route path="/bio-data" element={<BioData />} />
      <Route path="/view-records" element={<ViewRecords />} />
      <Route path="/check-queue" element={<CheckQueue />} />
      <Route path="/create-appointments" element={<CreateAppointments />} />
      <Route path="/manage-appointments" element={<ManageAppointments />} />
      <Route path="/data-report" element={<DataReport />} />
      <Route path="/view-bookings" element={<ViewBookings />} /> */}
    </Routes>
  );
};

export default RouteSwitch;
