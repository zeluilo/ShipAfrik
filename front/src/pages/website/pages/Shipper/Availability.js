import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const Availability = () => {
    const { currentUser } = useAuth();
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

    // Handle changes in form inputs
    const handleCheckboxChange = (e) => setIsDoorToDoorChecked(e.target.checked);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleBoxSizeChange = (index, field, value) => {
        const newBoxSizes = [...formData.boxSizes];
        newBoxSizes[index][field] = value;
        setFormData(prevData => ({ ...prevData, boxSizes: newBoxSizes }));
    };

    const handleDateChange = (dates) => {
        setFormData(prevData => ({ ...prevData, availableCollectionDays: dates }));
    };

    const handleSubmit = async (e, isPost = false) => {
        e.preventDefault();
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

        let payload = {
            ...formData,
            userId: currentUser,
            doorToDoorChecked: isDoorToDoorChecked,
            availableCollectionDays: formData.availableCollectionDays.map(date => date.toISOString().split('T')[0]),
        };

        if (isPost) {
            payload = { ...payload, datePosted: new Date().toISOString() };
        }

        try {
            let response;
            if (showEditShipment && shipment) {
                response = await axios.put(`http://localhost:3001/shipafrik/update-shipment/${shipment._id}`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log('Shipment updated successfully:', response.data);
            } else {
                response = await axios.post('http://localhost:3001/shipafrik/create-shipment', payload, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }

            if (response.status === 200 || response.status === 201) {
                toast.success(response.data.message || (showEditShipment ? 'Shipment Updated successfully!' : 'New Shipment Created successfully!'));
                fetchShipments();
                handleClear();
                setShowCreateShipment(false);
                setShowEditShipment(false);
            } else {
                toast.error(response.data.message || 'Error with submission details.');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        }
    };


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

    const [shipments, setShipments] = useState([]);
    const [filteredShipments, setFilteredShipments] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [sortBy, setSortBy] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [noShipmentsMessage, setNoShipmentsMessage] = useState('');
    const [selectedShipmentId, setSelectedShipmentId] = useState(null);

    // Fetch shipments initially
    const fetchShipments = async () => {
        try {
            setLoading(true); // Set loading to true before fetching data

            const response = await axios.get(`http://localhost:3001/shipafrik/shipments/${currentUser}`);
            setShipments(response.data);
            console.log('Shipments: ', response.data)


            // Check if no shipments are found
            if (response.data.length === 0) {
                setNoShipmentsMessage('No shipments found.');
            } else {
                setNoShipmentsMessage('');
            }

            setTotalPages(Math.ceil(response.data.length / pageSize));
        } catch (error) {
            console.error('Error fetching shipments:', error);
            // toast.error('Failed to fetch shipments');
        } finally {
            setLoading(false); // Set loading to false once data is fetched
        }
    };

    useEffect(() => {
        fetchShipments();
    }, [currentUser]);

    // Search and Filter Logic
    useEffect(() => {
        let filtered = shipments;

        // // Filter by status
        // if (statusFilter) {
        //     filtered = filtered.filter(shipment => shipment.status.toLowerCase().includes(statusFilter.toLowerCase()));
        // }

        // Filter by search term (name or id)
        if (searchTerm) {
            filtered = filtered.filter(shipment =>
                shipment.destinationPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shipment.warehousePostcode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by date range
        if (startDate && endDate) {
            filtered = filtered.filter(shipment => {
                const shipmentDate = new Date(shipment.estimatedVesselDepartureDate);
                return shipmentDate >= startDate && shipmentDate <= endDate;
            });
        }

        // Check if no shipments are found after filtering
        if (filtered.length === 0) {
            setNoShipmentsMessage('No shipments found.');
        } else {
            setNoShipmentsMessage('');
        }

        setFilteredShipments(filtered.slice((page - 1) * pageSize, page * pageSize));
        setTotalPages(Math.ceil(filtered.length / pageSize));
    }, [statusFilter, searchTerm, startDate, endDate, sortBy, page, pageSize, shipments]);


    // Event Handlers
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setPage(1);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setPage(1);
    };

    const formatDateToWords = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const [showCreateShipment, setShowCreateShipment] = useState(false);
    const [showEditShipment, setShowEditShipment] = useState(false);
    const [shipment, setShipment] = useState(null);

    const handleCreateShipment = () => {
        setShowCreateShipment(true);
        setShowEditShipment(false);
        setShipment(null);
        handleClear();
    };

    const fetchShipmentEdit = async (id) => {
        console.log('Fetching shipment with ID:', id);
        try {
            const response = await axios.get(`http://localhost:3001/shipafrik/shipment/${currentUser}/${id}`);
            setFormData({
                estimatedVesselDepartureDate: new Date(response.data.estimatedVesselDepartureDate),
                destinationPort: response.data.destinationPort,
                estimatedArrivalDate: response.data.estimatedArrivalDate,
                warehousePostcode: response.data.warehousePostcode,
                doorToDoorFee: response.data.doorToDoorFee,
                pickupRadius: response.data.pickupRadius,
                boxSizes: response.data.boxSizes,
                availableCollectionDays: response.data.availableCollectionDays.map(date => new Date(date)),
            });
            setIsDoorToDoorChecked(response.data.doorToDoorChecked);
        } catch (error) {
            toast.error('Failed to fetch shipment details');
        }
    };

    const handleEditShipment = (shipment) => {
        setShowCreateShipment(true);
        setShipment(shipment);
        fetchShipmentEdit(shipment._id);
        setShowEditShipment(true);
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth' // This makes the scroll smooth
        });
    };

    const handleOpenDeleteModal = (id) => {
        setSelectedShipmentId(id);
        fetchShipments();
    };

    const handleDelete = async () => {
        if (!selectedShipmentId) {
            toast.error('No shipment selected for deletion.');
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:3001/shipafrik/delete-shipment/${selectedShipmentId}`);
            if (response.status === 200 || response.status === 201) {
                toast.success(response.data.message || 'Shipment deleted successfully!');

                // Fetch updated shipments after deletion
                await fetchShipments();

                // If no shipments remain after deletion, update the message
                if (shipments.length === 1) {
                    setNoShipmentsMessage('No shipments found.');
                }

                // Reset form and states
                handleClear();
                setShowCreateShipment(false);
                setShowEditShipment(false);
            } else {
                toast.error(response.data.message || 'Error with deletion.');
            }
        } catch (error) {
            toast.error('Failed to delete shipment. Please try again.');
        }
    };

    const handleViewShipmentDetails = (shipment) => {
        setSelectedShipmentId(shipment._id);
        setShipment(shipment);
    };

    return (
        <>
            <div className="datatable-top">
                <div className="filters">
                    <div className="row">
                        <div className="col-md-3">
                            <label>Start Date</label>
                            <DatePicker
                                className="form-control mx-1"
                                placeholderText='Search by Departure Date'
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                isClearable
                            />
                        </div>
                        <div className="col-md-3">
                            <label>End Date</label>
                            <DatePicker
                                className="form-control mx-1"
                                selected={endDate}
                                placeholderText='Search by Departure Date'
                                onChange={(date) => setEndDate(date)}
                                isClearable
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by destination port / postcode"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : (
                    <>
                        {noShipmentsMessage || shipments.length === 0 ? (
                            <div className="m-3"><strong>{noShipmentsMessage}</strong></div>
                        ) : (
                            <>
                                <table className="table table-bordered table-hover mt-3">
                                    <thead>
                                        <tr>
                                            <th>Shipment ID</th>
                                            <th onClick={() => setSortBy('datePosted')}>Date of Post</th>
                                            <th onClick={() => setSortBy('estimatedVesselDepartureDate')}>Estimated Departure Date</th>
                                            <th>Small</th>
                                            <th>Medium</th>
                                            <th>Large</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredShipments.slice((page - 1) * pageSize, page * pageSize).map((shipment, index) => {
                                            const smallBox = shipment.boxSizes.find(box => box.size === 'Small') || {};
                                            const mediumBox = shipment.boxSizes.find(box => box.size === 'Medium') || {};
                                            const largeBox = shipment.boxSizes.find(box => box.size === 'Large') || {};

                                            return (
                                                <tr key={shipment.id}>
                                                    <td>{(index + 1) + (page - 1) * pageSize}</td>
                                                    <td>{shipment.datePosted ? formatDateToWords(shipment.datePosted) : 'Not Posted Yet'}</td>
                                                    <td>{formatDateToWords(shipment.estimatedVesselDepartureDate)}</td>
                                                    <td>£{smallBox.price || '-'} ({smallBox.quantity || '-'})</td>
                                                    <td>£{mediumBox.price || '-'} ({mediumBox.quantity || '-'})</td>
                                                    <td>£{largeBox.price || '-'} ({largeBox.quantity || '-'})</td>
                                                    <td>
                                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                                            <div>
                                                                <i
                                                                    type="button"
                                                                    className='bi bi-pencil-square'
                                                                    onClick={() => handleEditShipment(shipment)}
                                                                    style={{ color: 'green' }}
                                                                ></i>
                                                            </div>
                                                            <div>
                                                                <i
                                                                    type="button"
                                                                    className='bi bi-eye-fill'
                                                                    style={{ color: 'blue' }}
                                                                    data-bs-toggle="modal" data-bs-target="#viewShipmentDetails"
                                                                    onClick={() => handleViewShipmentDetails(shipment)}
                                                                ></i>
                                                            </div>
                                                            <div>
                                                                <i
                                                                    type="button"
                                                                    className='bi bi-trash-fill'
                                                                    onClick={() => handleOpenDeleteModal(shipment._id)} // Pass the shipment ID to the handler
                                                                    data-bs-toggle="modal"
                                                                    style={{ color: 'red' }}
                                                                    data-bs-target="#delete"
                                                                ></i>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="pagination-controls">
                                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>{'<'}</button>
                                    <span> Page {page} of {totalPages} </span>
                                    <button className="pagination-controls" disabled={page === totalPages} onClick={() => setPage(page + 1)}>{'>'}</button>
                                </div>
                            </>
                        )}
                    </>
                )}
                <div className="row mt-4">
                    <div className="col text-center">
                        <button type="button" className="btn btn-outline-warning mx-2" onClick={handleCreateShipment}>Create New Shipment</button>
                    </div>
                </div>
            </div>

            {showCreateShipment && (
                <div className="my-4">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header align-content-center justify-content-center">
                            <h3 className="modal-title m-1">{showEditShipment ? 'Edit Shipment Availability' : 'Create New Shipment'}</h3>
                            <button type="button" className="btn-close mx-1" onClick={() => setShowCreateShipment(false)} />
                        </div>
                        <div className="row">
                            <div className="col-xl-6">
                                <table className="table table-spacing table-borderless">
                                    <thread>
                                        <tr></tr>
                                    </thread>
                                    <tbody>
                                        <tr>
                                            <td><label>Estimated Vessel Departure Date</label></td>
                                            <td>
                                                <DatePicker
                                                    className="form-control"
                                                    selected={formData.estimatedVesselDepartureDate ? new Date(formData.estimatedVesselDepartureDate) : null}
                                                    onChange={date => setFormData(prevData => ({ ...prevData, estimatedVesselDepartureDate: date }))}
                                                    dateFormat="yyyy/MM/dd"
                                                    minDate={new Date()}
                                                    placeholderText="Select departure date"
                                                    required
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><label>Destination Port</label></td>
                                            <td><input type="text" name='destinationPort' className="form-control"
                                                value={formData.destinationPort} onChange={handleChange} placeholder="Enter destination port" required /></td>
                                        </tr>
                                        <tr>
                                            <td><label>Estimated Arrival Date</label></td>
                                            <td>
                                                <DatePicker
                                                    className="form-control"
                                                    selected={formData.estimatedArrivalDate ? new Date(formData.estimatedArrivalDate) : null}
                                                    onChange={date => setFormData(prevData => ({ ...prevData, estimatedArrivalDate: date }))}
                                                    dateFormat="yyyy/MM/dd"
                                                    minDate={formData.estimatedVesselDepartureDate ? new Date(formData.estimatedVesselDepartureDate) : new Date()}
                                                    placeholderText="Select arrival date"
                                                    required
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><label>Warehouse Postcode</label></td>
                                            <td><input type="text" name='warehousePostcode' className="form-control"
                                                value={formData.warehousePostcode} onChange={handleChange} placeholder="Enter warehouse postcode" required /></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input className="form-check-input mx-2" type="checkbox" checked={isDoorToDoorChecked}
                                                    onChange={handleCheckboxChange} />
                                                <label>Door To Door</label>
                                            </td>
                                        </tr>
                                        {isDoorToDoorChecked && (
                                            <>
                                                <tr>
                                                    <td><label>Door to Door Fee</label></td>
                                                    <td><input type="text" name='doorToDoorFee' className="form-control"
                                                        value={formData.doorToDoorFee} onChange={handleChange} placeholder="Enter door to door fee" required /></td>
                                                </tr>
                                                <tr>
                                                    <td><label>Pickup Radius</label></td>
                                                    <td><input type="text" name='pickupRadius' className="form-control"
                                                        value={formData.pickupRadius} onChange={handleChange} placeholder="Enter pickup radius" required /></td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>

                                </table>
                            </div>
                            <div className="col-xl-6">
                                <table className="table table-spacing">
                                    <thead>
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
                                                    <input type="number" className="form-control" placeholder={`Enter ${box.size} Price`}
                                                        value={box.price} onChange={(e) => handleBoxSizeChange(index, 'price', e.target.value)} />
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control" placeholder={`Enter ${box.size} Quantity`}
                                                        value={box.quantity} onChange={(e) => handleBoxSizeChange(index, 'quantity', e.target.value)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td><p>Available Collection Days</p></td>
                                            <td>
                                                <DatePicker
                                                    selected={formData.availableCollectionDays[0]}
                                                    onChange={handleDateChange}
                                                    selectsRange
                                                    startDate={formData.availableCollectionDays[0]}
                                                    endDate={formData.availableCollectionDays[1]}
                                                    inline
                                                    minDate={formData.estimatedArrivalDate ? new Date(formData.estimatedArrivalDate) : new Date()}
                                                    dateFormat="yyyy-MM-dd"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <div className="col text-center">
                                {/* Save button: does not save the datePosted */}
                                <button
                                    type="submit"
                                    className="btn btn-primary mx-2"
                                    style={{ width: '150px' }}
                                    onClick={(e) => handleSubmit(e, false)}
                                >
                                    {showEditShipment ? 'Update' : 'Save'}
                                </button>

                                {/* Post button: saves the current date to datePosted */}
                                <button
                                    type="button"
                                    className="btn btn-secondary mx-2"
                                    style={{ width: '150px' }}
                                    onClick={(e) => handleSubmit(e, true)}
                                >
                                    Post
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger mx-2"
                                    style={{ width: '150px' }}
                                    onClick={handleClear}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            )}
            <div className="modal fade" id="delete" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this shipment?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleDelete} data-bs-dismiss="modal">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="viewShipmentDetails" tabIndex="-1" aria-labelledby="viewShipmentLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="viewShipmentLabel">Shipment Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {selectedShipmentId && shipment ? (
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <td><strong>Estimated Vessel Departure Date:</strong></td>
                                            <td>{shipment.estimatedVesselDepartureDate ? new Date(shipment.estimatedVesselDepartureDate).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Destination Port:</strong></td>
                                            <td>{shipment.destinationPort || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Estimated Arrival Date:</strong></td>
                                            <td>{shipment.estimatedArrivalDate ? new Date(shipment.estimatedArrivalDate).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Warehouse Postcode:</strong></td>
                                            <td>{shipment.warehousePostcode || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Door to Door Fee:</strong></td>
                                            <td>£{shipment.doorToDoorFee || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Pickup Radius:</strong></td>
                                            <td>{shipment.pickupRadius || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Available Box Sizes:</strong></td>
                                            <td>
                                                <ul>
                                                    {shipment.boxSizes && shipment.boxSizes.map((box, index) => (
                                                        <li key={index}>{box.size}: <br /> Price - £{box.price || 'N/A'}<br />Quantity - {box.quantity || 'N/A'}<br /><br /></li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Available Collection Days:</strong></td>
                                            <td>
                                                {shipment.availableCollectionDays && shipment.availableCollectionDays.length > 0 ? (
                                                    `${new Date(shipment.availableCollectionDays[0]).toLocaleDateString()} - ${new Date(shipment.availableCollectionDays[shipment.availableCollectionDays.length - 1]).toLocaleDateString()}`
                                                ) : (
                                                    'No collection days available.'
                                                )}
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            ) : (
                                <p>No shipment selected or details unavailable.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Availability;
