import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/website/pages/Admin/Dashboard';
import Country from '../pages/website/pages/Admin/Country';
import ServiceType from '../pages/website/pages/Admin/ServiceType';


const RouteSwitch = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/admin-dashboard" element={<Dashboard />} />
      <Route path="/countries-cities" element={<Country />} />
      <Route path="/service-type" element={<ServiceType />} />
    </Routes>
  );
};

export default RouteSwitch;
