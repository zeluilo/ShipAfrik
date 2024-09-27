import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserMd, FaHome, FaUserNurse, FaPills, FaUser, FaNotesMedical, FaCalendarDay, FaUserFriends, FaIdCard, FaFileAlt, FaArrowDown, FaHome as FaHouse } from 'react-icons/fa';
import './Sidebar.css'; // Import a CSS file for sidebar styles

const Sidebar = () => {
    const location = useLocation();

    // Function to check if the link is active
    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <aside className="sidebar bg-dark text-white" data-aos="fade-in" data-aos-delay="100">
            <div className="sidebar-header d-flex align-items-center justify-content-center mb-4">
                <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="sidebar-logo" />
            </div>
            <ul className="sidebar-nav">
                <li className={`nav-item ${isActive('/admin-dashboard') ? 'active' : ''}`}>
                    <Link to='/admin-dashboard' className="nav-link">
                        <FaHome /><span>Dashboard</span>
                    </Link>
                </li>

                <li className="nav-item">
                    <Link className="nav-link collapsed" data-bs-target="#admins" data-bs-toggle="collapse">
                        <FaUser /><span>Admins</span><FaArrowDown className="ms-auto" />
                    </Link>
                    <ul id="admins" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li className={`nav-item ${isActive('/manage-doctor') ? 'active' : ''}`}>
                            <Link to="/manage-doctor">
                                <FaUserMd /><span>Create Admins</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/manage-nurse') ? 'active' : ''}`}>
                            <Link to="/manage-nurse">
                                <FaUserNurse /><span>Registered Admins</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/manage-pharmacist') ? 'active' : ''}`}>
                            <Link to="/manage-pharmacist">
                                <FaPills /><span>Shippers</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/manage-accountant') ? 'active' : ''}`}>
                            <Link to="/manage-accountant">
                                <FaUser /><span>Users</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/manage-receptionist') ? 'active' : ''}`}>
                            <Link to="/manage-receptionist">
                                <FaUser /><span>Receptionist</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className="nav-item">
                    <Link className="nav-link collapsed" data-bs-target="#patients-nav" data-bs-toggle="collapse">
                        <FaNotesMedical /><span>Shippers</span><FaArrowDown className="ms-auto" />
                    </Link>
                    <ul id="patients-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li className={`nav-item ${isActive('/register-patient') ? 'active' : ''}`}>
                            <Link to="/register-patient">
                                <FaIdCard /><span>Created Shipments</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/manage-patient') ? 'active' : ''}`}>
                            <Link to="/manage-patient">
                                <FaUserFriends /><span>Availability</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/add-family') ? 'active' : ''}`}>
                            <Link to="/add-family">
                                <FaUserFriends /><span>Track Shipments</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/bio-data') ? 'active' : ''}`}>
                            <Link to="/bio-data">
                                <FaFileAlt /><span>Medical Biological Data</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/view-records') ? 'active' : ''}`}>
                            <Link to="/view-records">
                                <FaFileAlt /><span>View Patient Records</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className="nav-item">
                    <Link className="nav-link collapsed" data-bs-target="#appointments-nav" data-bs-toggle="collapse">
                        <FaCalendarDay /><span>Customers</span><FaArrowDown className="ms-auto" />
                    </Link>
                    <ul id="appointments-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li className={`nav-item ${isActive('/check-queue') ? 'active' : ''}`}>
                            <Link to="/check-queue">
                                <FaCalendarDay /><span>Track Orders</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/create-appointments') ? 'active' : ''}`}>
                            <Link to="/create-appointments">
                                <FaCalendarDay /><span>Book Appointments</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/manage-appointments') ? 'active' : ''}`}>
                            <Link to="/manage-appointments">
                                <FaCalendarDay /><span>View Bookings</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className="nav-item">
                    <Link className="nav-link collapsed" data-bs-target="#other-nav" data-bs-toggle="collapse">
                        <FaCalendarDay /><span>Other</span><FaArrowDown className="ms-auto" />
                    </Link>
                    <ul id="other-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li className={`nav-item ${isActive('/data-report') ? 'active' : ''}`}>
                            <Link to="/data-report">
                                <FaCalendarDay /><span>Data Report/Revenue</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/admin-dashboard/countries-cities') ? 'active' : ''}`}>
                            <Link to="/admin-dashboard/countries-cities">
                                <FaCalendarDay/><span>Country/Cities</span>
                            </Link>
                        </li>
                        <li className={`nav-item ${isActive('/admin-dashboard/service-type') ? 'active' : ''}`}>
                            <Link to="/admin-dashboard/service-type">
                                <FaCalendarDay/><span>Type of Service</span>
                            </Link>
                        </li>

                        <li className={`nav-item ${isActive('/view-bookings') ? 'active' : ''}`}>
                            <Link to="/view-bookings">
                                <FaCalendarDay /><span>View Bookings</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className="nav-item mt-auto">
                    <Link to='/' className="nav-link">
                        <FaHouse /><span>Go to Home</span>
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
