import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const ShipperHub = () => {
    const { currentUser } = useAuth();
    //---------------------------------Shipment Overview---------------------------------
    const [shipments, setShipments] = useState([]);
    const [filteredShipments, setFilteredShipments] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [sortBy, setSortBy] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch shipments initially
    const fetchShipments = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/shipments/${currentUser}`);
            setShipments(response.data.shipments);
            console.log('Shipments: ', response.data.shipments)
            setFilteredShipments(response.data.shipments);
            setTotalPages(Math.ceil(response.data.shipments.length / pageSize));
        } catch (error) {
            console.error('Error fetching shipments:', error);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, [currentUser]);

    // Filter and sort logic
    const applyFiltersAndSort = () => {
        let filtered = [...shipments];

        // Filter by date range
        if (startDate && endDate) {
            filtered = filtered.filter(shipment =>
                new Date(shipment.departureDate) >= startDate &&
                new Date(shipment.departureDate) <= endDate
            );
        }

        // Sort by selected field
        if (sortBy) {
            filtered.sort((a, b) => {
                if (sortBy === 'status') {
                    return a.status.localeCompare(b.status);
                }
                if (sortBy === 'departureDate') {
                    return new Date(a.departureDate) - new Date(b.departureDate);
                }
                if (sortBy === 'arrivalDate') {
                    return new Date(a.arrivalDate) - new Date(b.arrivalDate);
                }
                return 0;
            });
        }

        setFilteredShipments(filtered);
        setTotalPages(Math.ceil(filtered.length / pageSize));
    };

    useEffect(() => {
        applyFiltersAndSort();
    }, [startDate, endDate, sortBy, page, pageSize]);

    // Handle pagination
    const handlePageChange = (newPage) => setPage(newPage);
    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setPage(1); // Reset to first page on page size change
    };
    //---------------------------------Shipment Availablity---------------------------------

    // State for handling form input
    const [formData, setFormData] = useState({
        estimatedVesselDepartureDate: '',
        destinationPort: '',
        estimatedArrivalDate: '',
        warehousePostcode: '',
        doorToDoorFee: '',
        pickupRadius: '',
        boxSizes: [
            { size: 'Small', price: '', quantity: '' },
            { size: 'Medium', price: '', quantity: '' },
            { size: 'Large', price: '', quantity: '' },
        ],
        availableCollectionDays: [],
    });

    const [isDoorToDoorChecked, setIsDoorToDoorChecked] = useState(false);

    // Handle checkbox change
    const handleCheckboxChange = (e) => {
        setIsDoorToDoorChecked(e.target.checked);
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    // Handle box size input changes
    const handleBoxSizeChange = (index, field, value) => {
        const newboxSizes = [...formData.boxSizes];
        newboxSizes[index][field] = value;
        setFormData(prevData => ({ ...prevData, boxSizes: newboxSizes }));
    };

    // Handle date changes
    const handleDateChange = (dates) => {
        setFormData(prevData => ({ ...prevData, availableCollectionDays: dates }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if required fields are empty
        const requiredFields = [
            'estimatedVesselDepartureDate',
            'destinationPort',
            'estimatedArrivalDate',
            'warehousePostcode',
        ];
        for (let field of requiredFields) {
            if (!formData[field]) {
                toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
                return;
            }
        }

        // Prepare data for submission
        const payload = {
            ...formData,
            userId: currentUser,
            status: 'Pending',
            doorToDoorChecked: isDoorToDoorChecked,
            boxSizes: formData.boxSizes.map(box => ({
                size: box.size,
                price: box.price,
                quantity: box.quantity,
            })),
            availableCollectionDays: formData.availableCollectionDays.map(date => date.toISOString().split('T')[0]), // Format dates as YYYY-MM-DD
        };

        console.log('Form Data:', payload);

        try {
            const response = await axios.post('http://localhost:3001/shipafrik/create-shipment', payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Handle response based on status code
            if (response.status === 201) { // Created
                toast.success(response.data.message || 'New Shipment Created successfully!');
                handleClear();
            } else if (response.status === 400) { // Bad Request
                toast.error(response.data.message || 'Error with submission details.');
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting shipment:', error);

            // Handle different types of errors
            if (error.response) {
                toast.error(error.response.data.message || 'Error submitting shipment. Please try again.');
            } else if (error.request) {
                toast.error('No response received from server. Please try again.');
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
        }
    };

    // Handle form clear
    const handleClear = () => {
        setFormData({
            estimatedVesselDepartureDate: '',
            destinationPort: '',
            estimatedArrivalDate: '',
            warehousePostcode: '',
            doorToDoorFee: '',
            pickupRadius: '',
            boxSizes: [
                { size: 'Small', price: '', quantity: '' },
                { size: 'Medium', price: '', quantity: '' },
                { size: 'Large', price: '', quantity: '' },
            ],
            availableCollectionDays: [],
        });
        setIsDoorToDoorChecked(false);
    };
    //-----------------------------------------------------------------------------------------------


    return (
        <section id="constructions" className="constructions section bg-dark min-vh-100 d-flex" style={{ textAlign: 'center' }}>
            <div className="container section-title" data-aos="fade-up">
                <h2 style={{ marginTop: '30px', color: 'white' }}>Welcome to Shipper Hub</h2>
                <p style={{ color: 'white' }}>We offer solutions designed to make your shipping experience smooth and transparent.</p>

                <div className="row py-4">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body pt-3">
                                <ul className="nav nav-tabs nav-tabs-bordered">
                                    <li className="nav-item">
                                        <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-overview">Overview</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit">My Availability</button>
                                    </li>
                                </ul>

                                <div className="tab-content pt-2">
                                    <div className="tab-pane fade show active profile-overview" id="profile-overview">
                                        <h5 className="card-title">Profile Details</h5>
                                        <div className="filters d-flex justify-content-between align-items-center">
                                            <div>
                                                <button className="btn btn-secondary" onClick={() => setStartDate(null) || setEndDate(null)}>
                                                    Clear Filters
                                                </button>
                                            </div>
                                            <div className="d-flex">
                                                <div className="mr-3">
                                                    <label>Sort By:</label>
                                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-control">
                                                        <option value="">None</option>
                                                        <option value="status">Status</option>
                                                        <option value="departureDate">Departure Date</option>
                                                        <option value="arrivalDate">Arrival Date</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label>Filter By Date:</label>
                                                    <DatePicker
                                                        selected={startDate}
                                                        onChange={(date) => setStartDate(date)}
                                                        startDate={startDate}
                                                        endDate={endDate}
                                                        selectsRange={true}
                                                        // inline
                                                        isClearable
                                                        placeholderText="Select date range"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <table className="table table-hover mt-3">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Status</th>
                                                    <th>Departure Date</th>
                                                    <th>Arrival Date</th>
                                                    <th>Destination Port</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredShipments
                                                    .slice((page - 1) * pageSize, page * pageSize)
                                                    .map((shipment) => (
                                                        <tr key={shipment._id}>
                                                            <td>{shipment._id}</td>
                                                            <td>{shipment.status}</td>
                                                            <td>{new Date(shipment.departureDate).toLocaleDateString()}</td>
                                                            <td>{new Date(shipment.arrivalDate).toLocaleDateString()}</td>
                                                            <td>{shipment.destinationPort}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>

                                        <div className="pagination">
                                            <button
                                                onClick={() => handlePageChange(Math.max(page - 1, 1))}
                                                disabled={page === 1}
                                            >
                                                Previous
                                            </button>
                                            <span>Page {page} of {totalPages}</span>
                                            <button
                                                onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                                                disabled={page === totalPages}
                                            >
                                                Next
                                            </button>
                                            <select value={pageSize} onChange={handlePageSizeChange}>
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade profile-edit pt-3" id="profile-edit">
                                        <form onSubmit={handleSubmit}>
                                            <h3 className="card-title">New Shipment Availability</h3>
                                            <div className="row">
                                                <div className="col-xl-6">
                                                    <table className="table table-borderless table-spacing">
                                                        <thead className='table'>
                                                            <tr>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td><label>Estimated Vessel Departure Date</label></td>
                                                                <td><input type="date" name='estimatedVesselDepartureDate' className="form-control"
                                                                    placeholder="Enter date" min={new Date().toISOString().split('T')[0]}
                                                                    value={formData.estimatedVesselDepartureDate} onChange={handleChange} required /></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Destination Port</label></td>
                                                                <td><input type="text" name='destinationPort' className="form-control"
                                                                    placeholder="Enter destination port" value={formData.destinationPort}
                                                                    onChange={handleChange} required /></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Estimated Arrival Date</label></td>
                                                                <td><input type="date" name='estimatedArrivalDate' className="form-control"
                                                                    placeholder="Enter date" min={formData.estimatedVesselDepartureDate} value={formData.estimatedArrivalDate}
                                                                    onChange={handleChange} required /></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Warehouse Postcode</label></td>
                                                                <td><input type="text" name='warehousePostcode' className="form-control"
                                                                    placeholder="Enter postcode" value={formData.warehousePostcode}
                                                                    onChange={handleChange} required /></td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <strong>
                                                                        <input style={{ marginRight: '5px' }} className="form-check-input" type="checkbox"
                                                                            id="doorToDoor" checked={isDoorToDoorChecked} onChange={handleCheckboxChange} />
                                                                        <label htmlFor="doorToDoor">Door To Door</label>
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                            {isDoorToDoorChecked && (
                                                                <>
                                                                    <tr>
                                                                        <td><label>Door to Door Fee</label></td>
                                                                        <td><input type="text" name='doorToDoorFee' className="form-control" placeholder="Enter fee" value={formData.doorToDoorFee} onChange={handleChange} required /></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td><label>Pickup Radius</label></td>
                                                                        <td><input type="text" name='pickupRadius' className="form-control" placeholder="Enter radius" value={formData.pickupRadius} onChange={handleChange} required /></td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="col-xl-6">
                                                    <table className="table table-hover table-spacing">
                                                        <thead className='table'>
                                                            <tr>
                                                                <th>Box Size</th>
                                                                <th>Pricing</th>
                                                                <th>Available Quantity</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {formData.boxSizes.map((box, index) => (
                                                                <tr key={index}>
                                                                    <td>{box.size}</td>
                                                                    <td>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Enter price"
                                                                            value={box.price}
                                                                            onChange={(e) => handleBoxSizeChange(index, 'price', e.target.value)}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <input
                                                                            type="number"
                                                                            className="form-control"
                                                                            placeholder="Enter quantity"
                                                                            value={box.quantity}
                                                                            onChange={(e) => handleBoxSizeChange(index, 'quantity', e.target.value)}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <table className="table table-borderless table-spacing">
                                                        <tbody>
                                                            <tr>
                                                                <td><p>Available Collection Days (Comma-separated)</p></td>
                                                                {/* <td><p>Select Available Collection Days</p></td> */}
                                                                <td>
                                                                    <DatePicker
                                                                        selected={formData.availableCollectionDays[0]}
                                                                        onChange={handleDateChange}
                                                                        selectsRange={true}
                                                                        startDate={formData.availableCollectionDays[0]}
                                                                        endDate={formData.availableCollectionDays[1]}
                                                                        isClearable
                                                                        inline
                                                                        minDate={new Date()}
                                                                        // placeholderText="Select dates"
                                                                        dateFormat="yyyy-MM-dd"
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="scroll"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div className="row mt-4">
                                                <div className="col text-center">
                                                    <button type="button" className="btn btn-primary mx-2" style={{ width: '150px' }} onClick={handleSubmit}>Save</button>
                                                    <button type="button" className="btn btn-secondary mx-2" style={{ width: '150px' }}>Post</button>
                                                    <button type="button" className="btn btn-danger mx-2" style={{ width: '150px' }} onClick={handleClear}>Delete</button>
                                                </div>
                                            </div>
                                        </form>
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

export default ShipperHub;
