import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MultiDatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/purple.css";
import { toast } from 'react-toastify';
import { ip } from "../../../constants";

const Availability = () => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        estimatedVesselDepartureDate: '',
        destinationPort: '',
        estimatedArrivalDate: '',
        warehousePostcode: '',
        doorToDoorFee: '',
        pickupRadius: '',
        latestDropOffDate: '',
        volumetricWeightDivider: '',
        price: '',
        fragileFee: '',
        warehouseToDoorFee: '',
        availableCollectionDays: [],
        withdraw: false
    });
    const [isDoorToDoorChecked, setIsDoorToDoorChecked] = useState(false);
    const [isWareHousePostcode, setIsWareHousePostcodeChecked] = useState(false);
    const [isWithdrawn, setIsWithdrawn] = useState(false);

    // Handle changes in form inputs
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        if (name === "doorToDoor") {
            setIsDoorToDoorChecked(checked);
        } else if (name === "wareHousePostcode") {
            setIsWareHousePostcodeChecked(checked);
        }
    };

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
        setFormData(prevData => ({
            ...prevData,
            availableCollectionDays: dates
        }));
    };

    const handleSubmit = async (e, isPost = false) => {
        e.preventDefault();
        const requiredFields = [
            'estimatedVesselDepartureDate',
            'destinationPort',
            'estimatedArrivalDate',
            'warehousePostcode',
            'availableCollectionDays',
        ];
        for (let field of requiredFields) {
            if (!formData[field]) {
                toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
                return;
            }
        }

        let estimatedDepartureDate = new Date(formData.estimatedVesselDepartureDate);
        let latestDropOffDate = new Date(estimatedDepartureDate);
        latestDropOffDate.setDate(estimatedDepartureDate.getDate() + 2);


        // Initialize serviceType as an array
        let serviceType = [];

        // If both fees (doorToDoorFee and warehouseToDoorFee) are empty or zero, set 'Warehouse to Warehouse'
        if (!formData.doorToDoorFee && !formData.warehouseToDoorFee) {
            serviceType.push('Warehouse to Warehouse');
        }

        // Check if doorToDoorFee is not empty or zero
        if (formData.doorToDoorFee && formData.doorToDoorFee !== 0) {
            serviceType.push('Door to Door');
        }

        // Check if warehouseToDoorFee is not empty or zero
        if (formData.warehouseToDoorFee && formData.warehouseToDoorFee !== 0) {
            serviceType.push('Warehouse to Door');
        }

        // Format selected dates to 'YYYY-MM-DD'
        const formattedCollectionDays = selectedDates.map(date => {
            return new Date(date).toISOString().split('T')[0]; // Format each date as 'YYYY-MM-DD'
        });

        let payload = {
            ...formData,
            userId: currentUser,
            doorToDoorChecked: isDoorToDoorChecked,
            availableCollectionDays: formattedCollectionDays,
            withdraw: isWithdrawn,
            latestDropOffDate: latestDropOffDate.toISOString().split('T')[0],
            serviceType
        };

        if (isPost) {
            payload = { ...payload, datePosted: new Date().toISOString() };
        }

        if (isWithdrawn) {
            payload.withdraw = !isWithdrawn; // Toggle the withdraw state
        }

        try {
            let response;
            if (showEditShipment && shipment) {
                response = await axios.put(`${ip}/shipafrik/update-shipment/${shipment._id}`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                // console.log('Shipment updated successfully:', response.data);
            } else {
                response = await axios.post(`${ip}/shipafrik/create-shipment`, payload, {
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
            destinationPort: null,
            estimatedArrivalDate: '',
            warehousePostcode: '',
            doorToDoorFee: '',
            pickupRadius: '',
            latestDropOffDate: '',
            volumetricWeightDivider: '',
            price: '',
            fragileFee: '',
            warehouseToDoorFee: '',
            availableCollectionDays: [],
        });
        setSelectedItem(null);
        setSearchTerm('');
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
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [selectedDates, setSelectedDates] = useState([]);

    // Fetch shipments initially
    const fetchShipments = async () => {
        try {
            setLoading(true); // Set loading to true before fetching data

            const response = await axios.get(`${ip}/shipafrik/shipments/${currentUser}`);
            setShipments(response.data);
            // console.log('Shipments: ', response.data)

            // const estimatedDepartureDate = new Date(response.data.estimatedVesselDepartureDate);
            // const date = estimatedDepartureDate.getDate() - 2;

            // Check if no shipments are found
            if (response.data.length === 0) {
                setNoShipmentsMessage('No shipments found.');
            } else {
                setNoShipmentsMessage('');
            }

            setTotalPages(Math.ceil(response.data.length / pageSize));
        } catch (error) {
            // console.error('Error fetching shipments:', error);
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

    const formatDateToWords = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const [showCreateShipment, setShowCreateShipment] = useState(false);
    const [showEditShipment, setShowEditShipment] = useState(false);
    const [shipment, setShipment] = useState(null);
    const [postcodeDetails, setPostcodeDetails] = useState({ region: '', country: '' });
    const [postcodeSuccess, setPostcodeSuccess] = useState('');
    const [postcodeError, setPostcodeError] = useState('');

    // Postcode Lookup
    const postCodeLookUp = async () => {
        setPostcodeError('');
        setPostcodeSuccess('');
        setPostcodeDetails({ region: '', country: '' }); // Clear previous details

        if (!formData.warehousePostcode) {
            setPostcodeError('Please enter a postcode.');
            return;
        }

        try {
            const response = await axios.get(`https://api.postcodes.io/postcodes/${formData.warehousePostcode}`);
            const { region, country } = response.data.result;
            setPostcodeDetails({ region, country });
            setPostcodeSuccess('Postcode lookup successful.'); // Set success message
        } catch (error) {
            setPostcodeError('Invalid postcode or postcode lookup failed.'); // Set error if lookup fails
        }
    };

    const handleCreateShipment = () => {
        setShowCreateShipment(true);
        setShowEditShipment(false);
        setShipment(null);
        handleClear();
    };

    const fetchShipmentEdit = async (id) => {
        // console.log('Fetching shipment with ID:', id);
        setLoading(true); // Set loading to true
        try {
            const response = await axios.get(`${ip}/shipafrik/shipment/${currentUser}/${id}`);
            setFormData({
                estimatedVesselDepartureDate: new Date(response.data.estimatedVesselDepartureDate),
                destinationPort: response.data.destinationPort,
                estimatedArrivalDate: response.data.estimatedArrivalDate,
                warehousePostcode: response.data.warehousePostcode,
                doorToDoorFee: response.data.doorToDoorFee,
                pickupRadius: response.data.pickupRadius,
                volumetricWeightDivider: response.data.volumetricWeightDivider,
                fragileFee: response.data.fragileFee,
                warehouseToDoorFee: response.data.warehouseToDoorFee,
                price: response.data.price,
                availableCollectionDays: response.data.availableCollectionDays.map(date => new Date(date)),
            });
            setIsDoorToDoorChecked(response.data.doorToDoorChecked);
            setIsWithdrawn(response.data.withdraw);
        } catch (error) {
            // console.error('Error fetching shipment details:', error);
            toast.error('Failed to fetch shipment details');
        } finally {
            setLoading(false); // Reset loading state
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
            const response = await axios.delete(`${ip}/shipafrik/delete-shipment/${selectedShipmentId}`);
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

    useEffect(() => {
        fetchCountriesAndCities();
    }, []);

    // Fetch countries and cities
    const fetchCountriesAndCities = async () => {
        try {
            const response = await axios.get(`${ip}/shipafrik/get-countries`);
            const countries = response.data;

            // Combine cities with their respective countries into a single list for react-select options
            const combined = countries.flatMap(country =>
                country.cities.map(city => ({
                    value: `${city.name}, ${country.name}`, // city, country combined as value
                    label: `${city.name}, ${country.name}`  // city, country combined as label
                }))
            );

            setData(combined); // Set the combined city-country list for Select component
        } catch (error) {
            // console.error('Error fetching countries and cities:', error);
        }
    };

    const handleSelectChange = (selectedOption) => {
        setSelectedItem(selectedOption);
        setFormData(prevData => ({ ...prevData, destinationPort: selectedOption ? selectedOption.value : '' }));
    };

    const updateWithdrawStatus = async (shipmentId, newWithdrawStatus) => {
        try {
            const response = await axios.put(`${ip}/shipafrik/update-shipment-withdraw/${shipmentId}`, {
                withdraw: newWithdrawStatus
            });

            if (response.status === 200) {
                // console.log('Withdraw status updated successfully:', response.data);
                setFormData(prevData => ({
                    ...prevData,
                    withdraw: newWithdrawStatus
                }));
                // toast.success('Withdraw status updated successfully!');
                fetchShipments()
            } else {
                // console.error('Error updating withdraw status:', response.status);
                // toast.error('Failed to update withdraw status.');
            }
        } catch (error) {
            // console.error('Error:', error);
            // toast.error('An error occurred while updating withdraw status.');
        }
    };

    // Example usage for calling the function when a button is clicked
    const handleWithdrawClick = (shipmentId) => {
        const newWithdrawStatus = !formData.withdraw; // Toggle the withdraw status
        updateWithdrawStatus(shipmentId, newWithdrawStatus);
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
                                            <th onClick={() => setSortBy('estimatedVesselDepartureDate')}>Estimated Departure Date</th>
                                            <th>Estimated Arrival Date</th>
                                            <th>Fragile Fee</th>
                                            <th>Price</th>
                                            <th>Weight Divider</th>
                                            <th>Action</th>
                                            <th>Withdrawn</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredShipments.slice((page - 1) * pageSize, page * pageSize).map((shipment, index) => {
                                            return (
                                                <tr key={shipment._id}>
                                                    <td>{(index + 1) + (page - 1) * pageSize}</td>
                                                    <td>{formatDateToWords(shipment.estimatedVesselDepartureDate)}</td>
                                                    <td>{formatDateToWords(shipment.estimatedArrivalDate)}</td>
                                                    <td>£{shipment.fragileFee}</td>
                                                    <td>£{shipment.price}</td>
                                                    <td>{shipment.volumetricWeightDivider}</td>
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
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#viewShipmentDetails"
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
                                                    <td>{shipment.withdraw ? 'Withdrawn' : 'Active'}</td>
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
                <div className="my-2">
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
                                            <td>
                                                <Select
                                                    options={data}
                                                    value={formData.destinationPort ? data.find(option => option.value === formData.destinationPort) : null}
                                                    onChange={handleSelectChange}
                                                    placeholder="Search destination port"
                                                    isClearable
                                                    required
                                                />
                                            </td>
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
                                            <td><label>WareHouse Postcode</label></td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="warehousePostcode"
                                                    className="form-control w-100"
                                                    value={formData.warehousePostcode}
                                                    onChange={handleChange}
                                                    placeholder="Enter warehouse postcode"
                                                    required
                                                />

                                                <button type="button" className="form-control btn btn-secondary my-2" onClick={postCodeLookUp}>Postcode</button>
                                                {postcodeDetails.region && (
                                                    <div className="mt-2">
                                                        <strong>Region:</strong> {postcodeDetails.region} <br />
                                                        <strong>Country:</strong> {postcodeDetails.country}
                                                    </div>
                                                )}

                                                {postcodeSuccess && (
                                                    <div className="mt-2 text-success">
                                                        {postcodeSuccess}
                                                    </div>
                                                )}

                                                {postcodeError && (
                                                    <div className="mt-2 text-danger">
                                                        {postcodeError}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                        {isWareHousePostcode && (
                                            <>
                                                <tr>
                                                    <td><label>WareHouse to Door Fee (per order)</label></td>
                                                    <td><input
                                                        type="number"
                                                        name="warehouseToDoorFee"
                                                        className="form-control"
                                                        value={formData.warehouseToDoorFee}
                                                        onChange={handleChange}
                                                        placeholder="Enter warehouse to door fee"
                                                        required
                                                    /></td>
                                                </tr>
                                            </>
                                        )}

                                        <tr>
                                            <td>
                                                <input
                                                    className="form-check-input mx-2"
                                                    type="checkbox"
                                                    name="doorToDoor"
                                                    checked={isDoorToDoorChecked}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label>Door To Door</label>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <input
                                                    className="form-check-input mx-2"
                                                    type="checkbox"
                                                    name="wareHousePostcode"
                                                    checked={isWareHousePostcode}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label>WareHouse To Door</label>
                                            </td>
                                        </tr>

                                        {isDoorToDoorChecked && (
                                            <>
                                                <tr>
                                                    <td><label>Door to Door Fee (per order)</label></td>
                                                    <td><input
                                                        type="number"
                                                        name="doorToDoorFee"
                                                        className="form-control"
                                                        value={formData.doorToDoorFee}
                                                        onChange={handleChange}
                                                        placeholder="Enter door to door fee"
                                                        required
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td><label>Pickup Radius</label></td>
                                                    <td><input
                                                        type="text"
                                                        name="pickupRadius"
                                                        className="form-control"
                                                        value={formData.pickupRadius}
                                                        onChange={handleChange}
                                                        placeholder="Enter pickup radius"
                                                        required
                                                    /></td>
                                                </tr>
                                            </>
                                        )}


                                    </tbody>
                                </table>
                            </div>
                            <div className="col-xl-6">
                                <table className="table table-spacing table-borderedless">
                                    <thread>
                                        <tr></tr>
                                    </thread>
                                    <tbody>
                                        <tr>
                                            <td><label>Fragile Fee (per item)</label></td>
                                            <td><input
                                                type="number"
                                                name="fragileFee"
                                                className="form-control"
                                                value={formData.fragileFee}
                                                onChange={handleChange}
                                                placeholder="Enter fragile Fee"
                                                required
                                            /></td>
                                        </tr>
                                        <tr>
                                            <td><label>Volumentric Weight Divider</label></td>
                                            <td><input
                                                type="number"
                                                name="volumetricWeightDivider"
                                                className="form-control"
                                                value={formData.volumetricWeightDivider}
                                                onChange={handleChange}
                                                placeholder="Enter Volumetric Weight Divider"
                                                required
                                            /></td>
                                        </tr>
                                        <tr>
                                            <td><label>Price (per kg)</label></td>
                                            <td><input
                                                type="number"
                                                name="price"
                                                className="form-control"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="Enter Price"
                                                required
                                            /></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table className="table table-borderless">
                                    <tbody>
                                        {isDoorToDoorChecked && (
                                            <>
                                                <tr>
                                                    <td><p>Available Collection Days</p></td>
                                                    <td>
                                                        <MultiDatePicker
                                                            multiple // Enable multiple date selection
                                                            value={selectedDates}
                                                            onChange={setSelectedDates}
                                                            maxDate={formData.estimatedVesselDepartureDate ? new Date(new Date(formData.estimatedVesselDepartureDate).setDate(new Date(formData.estimatedVesselDepartureDate).getDate() - 3)) : new Date()}
                                                            format="YYYY-MM-DD"
                                                            placeholder="Select collection days"
                                                        />
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="row">
                            <div className="text-center my-4">
                                <strong>Date Posted: </strong>{shipment && shipment.datePosted ? formatDateToWords(shipment.datePosted) : 'Not Posted Yet'}
                            </div>
                            <div className="col text-center">
                                <button
                                    type="submit"
                                    className="btn btn-primary mx-2"
                                    style={{ width: '150px' }}
                                    onClick={(e) => handleSubmit(e, false)}
                                >
                                    {showEditShipment ? 'Update' : 'Draft'}
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
                                    className="btn btn-warning"
                                    onClick={() => handleWithdrawClick(shipment._id)}
                                >
                                    {formData.withdraw ? 'Reinstate' : 'Withdraw'}
                                </button>


                                <button
                                    type="button"
                                    className="btn btn-danger mx-2"
                                    style={{ width: '150px' }}
                                    onClick={handleClear}
                                >
                                    Clear Entries
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
                                            <td><strong>WareHouse to Door Fee:</strong></td>
                                            <td>£{shipment.warehouseToDoorFee || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Fragile Fee:</strong></td>
                                            <td>£{shipment.fragileFee || 'N/A'}</td>
                                        </tr>

                                        <tr>
                                            <td><strong>Price:</strong></td>
                                            <td>£{shipment.price || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Volumentric Weight Divider:</strong></td>
                                            <td>{shipment.volumetricWeightDivider || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Pickup Radius:</strong></td>
                                            <td>{shipment.pickupRadius || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Available Collection Days:</strong></td>
                                            <td>
                                                {shipment.availableCollectionDays.map((days, index) => (
                                                    <div key={index}>
                                                        {days}
                                                    </div>
                                                ))}
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
