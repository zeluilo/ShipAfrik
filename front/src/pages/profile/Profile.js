import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "../../components/Context";
import { ip } from "../constants";

const Profile = () => {
    const { currentUser, login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        userType: '',
        id: currentUser,
        profileImage: null
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [imagePreview, setImagePreview] = useState(null); // State for image preview

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:3001/shipafrik/user/${currentUser}`);
                const userData = response.data;
                console.log('123: ', userData)
                setUser(userData);
                setFormData({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                    address: userData.address || '',
                    userType: userData.userType || '',
                    id: userData._id || '',
                });
                setImagePreview(userData.profileImage || null); // Set initial image preview
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) {
            fetchUserData();
        }
    }, [currentUser]);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file)); // Preview the selected image
            setFormData({ ...formData, profileImage: file }); // Store the file in formData
        }

        // Log the file details
        if (file) {
            console.log('Selected file:', file);
            console.log('File name:', file.name);
            console.log('File size:', file.size);
            console.log('File type:', file.type);
        }
    };


    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();

        // Append form data
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }

        console.log('Form Data ', formData.id)

        try {
            const response = await axios.put(`http://localhost:3001/shipafrik/update-user/${formData.id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Check if there's a message indicating success or an error
            if (response.data.message) {
                setErrorMessage(response.data.message);
                setShowErrorAlert(true);

                // Reload the page if the update is successful
                if (response.status === 200) {
                    const updatedUser = response.data.user;
                    setUser(updatedUser);
                    setImagePreview(updatedUser.imageUrl || null);                    
                    window.location.reload();
                    // navigate('/', { state: { successMessage: 'Profile updated successfully!' } });
                }
            }

        } catch (error) {
            // Handle the error if the response status is 400
            if (error.response && error.response.status === 400) {
                setErrorMessage(error.response.data.message); // Display the message from the server
            } else {
                setErrorMessage('Error updating profile. Please try again.');
            }
            setShowErrorAlert(true);
        }
    };



    return (
        <section className="profile section bg-dark min-vh-100 d-flex">
            <div className="container section-title" data-aos="fade-up">
                <h2 style={{ marginTop: '50px', color: 'white' }}>Profile</h2>
                <p style={{ color: 'white' }}>Manage and update your personal information</p>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="row py-4">
                        <div className="col-xl-4">
                            <div className="card">
                                <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                                <img 
                                        src={imagePreview || `${process.env.PUBLIC_URL}/profile.png`} 
                                        alt="Profile" 
                                        className="img-fluid rounded-circle mb-2" 
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />                                    
                                    <h2>{user?.firstName} {user?.lastName}</h2>
                                    <h3>{user?.userType}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-8">
                            <div className="card">
                                <div className="card-body pt-3">
                                    <ul className="nav nav-tabs nav-tabs-bordered">
                                        <li className="nav-item">
                                            <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-overview">Overview</button>
                                        </li>
                                        <li className="nav-item">
                                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit">Edit Profile</button>
                                        </li>
                                    </ul>
                                    <div className="tab-content pt-2">
                                        {/* Profile Overview */}
                                        <div className="tab-pane fade show active profile-overview" id="profile-overview">
                                            <h5 className="card-title">Profile Details</h5>
                                            <div className="row text-start">
                                                <div className="col-lg-3 col-md-4 label">Full Name</div>
                                                <div className="col-lg-9 col-md-8">{user?.firstName} {user?.lastName}</div>
                                            </div>
                                            <div className="row text-start">
                                                <div className="col-lg-3 col-md-4 label">Email</div>
                                                <div className="col-lg-9 col-md-8">{user?.email}</div>
                                            </div>
                                            <div className="row text-start">
                                                <div className="col-lg-3 col-md-4 label">Phone Number</div>
                                                <div className="col-lg-9 col-md-8">{user?.phoneNumber}</div>
                                            </div>

                                        </div>

                                        {/* Profile Edit */}
                                        <div className="tab-pane fade profile-edit pt-3" id="profile-edit">
                                            <form onSubmit={handleUpdateProfile}>
                                                <h5 className="card-title">Edit Profile Information</h5>

                                                <div className="row mb-3 text-start">
                                                    <label htmlFor="profileImage" className="col-md-4 col-lg-3 col-form-label">Profile Image</label>
                                                    <div className="col-md-8 col-lg-9">
                                                        <input
                                                            type="file"
                                                            name="profileImage" // This should match the field name in multer
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            style={{ display: 'none' }}
                                                            id="profileImageInput"
                                                        />

                                                        <img
                                                            src={imagePreview || user?.profileImage || `${process.env.PUBLIC_URL}/profile.png`}
                                                            alt="Profile"
                                                            className="img-fluid rounded-circle mb-2"
                                                            style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                                            onClick={() => document.getElementById('profileImageInput').click()} // Trigger file input click
                                                        />
                                                        <div className="pt-2">
                                                            <button type="button" className="btn btn-primary btn-sm" onClick={() => document.getElementById('profileImageInput').click()} title="Upload new profile image">
                                                                <i className="bi bi-upload"></i> Upload
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* First Name Input */}
                                                <div className="row mb-3 text-start">
                                                    <label htmlFor="firstName" className="col-md-4 col-lg-3 col-form-label">First Name</label>
                                                    <div className="col-md-8 col-lg-9">
                                                        <input
                                                            type="text"
                                                            name='firstName'
                                                            className="form-control"
                                                            id="firstName"
                                                            placeholder="Enter first name"
                                                            value={formData.firstName}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Last Name Input */}
                                                <div className="row mb-3 text-start">
                                                    <label htmlFor="lastName" className="col-md-4 col-lg-3 col-form-label">Last Name</label>
                                                    <div className="col-md-8 col-lg-9">
                                                        <input
                                                            type="text"
                                                            name='lastName'
                                                            className="form-control"
                                                            id="lastName"
                                                            placeholder="Enter last name"
                                                            value={formData.lastName}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Email Input */}
                                                <div className="row mb-3 text-start">
                                                    <label htmlFor="email" className="col-md-4 col-lg-3 col-form-label">Email</label>
                                                    <div className="col-md-8 col-lg-9">
                                                        <input
                                                            type="email"
                                                            name='email'
                                                            className="form-control"
                                                            id="email"
                                                            placeholder="Enter email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Phone Number Input */}
                                                <div className="row mb-3 text-start">
                                                    <label htmlFor="phoneNumber" className="col-md-4 col-lg-3 col-form-label">Phone Number</label>
                                                    <div className="col-md-8 col-lg-9">
                                                        <input
                                                            type="text"
                                                            name='phoneNumber'
                                                            className="form-control"
                                                            id="phoneNumber"
                                                            placeholder="Enter phone number"
                                                            value={formData.phoneNumber}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <button type="submit" style={{ width: '60%', marginTop: '10px' }} className="btn btn-outline-warning">Update Profile</button>
                                            </form>

                                            {/* Display error message */}
                                            {showErrorAlert && (
                                                <div className="d-flex justify-content-center">
                                                    <div className={`form-control my-2 align-content-center w-50 alert ${errorMessage.includes('successfully') ? 'alert-success' : 'alert-danger'}`} role="alert">
                                                        {errorMessage}
                                                    </div>
                                                </div>

                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Profile;
