import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Quotes = () => {
    const { currentUser } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [filteredQuotes, setFilteredQuotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [collectBy, setCollectBy] = useState(null);
    const [arriveBy, setArriveBy] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [noQuotesMessage, setNoQuotesMessage] = useState('');
    const [noShipmentsMessage, setNoShipmentsMessage] = useState('');
    const navigate = useNavigate();

    const fetchQuotes = async () => {
        try {
            setLoading(true); // Set loading to true before fetching data

            // Fetch quotes
            const quotesResponse = await axios.get(`http://localhost:3001/shipafrik/quotes/${currentUser}`);
            const quotes = quotesResponse.data;
            setQuotes(quotes);
            console.log('Quotes:', quotes);

            setTotalPages(Math.ceil(quotes.length / pageSize));
        } catch (error) {
            console.error('Error fetching quotes:', error);
            // toast.error('Failed to fetch quotes');
        } finally {
            setLoading(false); // Set loading to false once data is fetched
        }
    };

    const handleCompareQuote = async (quote) => {
        setShowCompareQuote(true);
        setQuote(quote);


        // Fetch all shipments
        const shipmentsResponse = await axios.get('http://localhost:3001/shipafrik/shipments');
        const shipments = shipmentsResponse.data;
        console.log('Shipments:', shipments);

        if (quote) {
            // Filter shipments by destination city
            const filteredByCity = shipments.filter(shipment =>
                shipment.destinationPort.toLowerCase() === quote.destinationCity.toLowerCase()
            );

            if (filteredByCity.length === 0) {
                setNoShipmentsMessage('No shipments found in your city.');
                console.log('No shipments found in your city.');

                // If no shipments are found in the city, display all shipments (quotes)
                setShipments(shipments);
            } else {
                setNoShipmentsMessage('');

                // Sort the filtered shipments
                const sortedShipments = filteredByCity.sort((a, b) => {
                    let comparison = 0;

                    // Compare estimated arrival date
                    const arriveByDate = new Date(quote.arriveBy);
                    const arrivalDateA = new Date(a.estimatedArrivalDate);
                    const arrivalDateB = new Date(b.estimatedArrivalDate);
                    comparison = Math.abs(arrivalDateA - arriveByDate) - Math.abs(arrivalDateB - arriveByDate);

                    // Compare box sizes
                    const boxSizeComparisonA = compareBoxSizes(a.boxSizes, quote.boxSizes);
                    const boxSizeComparisonB = compareBoxSizes(b.boxSizes, quote.boxSizes);
                    comparison += boxSizeComparisonA - boxSizeComparisonB;

                    return comparison;
                });

                // Set the shipments to display the city-specific ones first
                setShipments(sortedShipments);

                // Also set the other quotes to be displayed below the city-specific shipments
                const otherQuotes = shipments.filter(shipment =>
                    shipment.destinationPort.toLowerCase() !== quote.destinationCity.toLowerCase()
                );

                if (otherQuotes.length > 0) {
                    const sortedOtherQuotes = otherQuotes.sort((a, b) => {
                        let comparison = 0;

                        // Compare estimated arrival date
                        const arriveByDate = new Date(quote.arriveBy);
                        const arrivalDateA = new Date(a.estimatedArrivalDate);
                        const arrivalDateB = new Date(b.estimatedArrivalDate);
                        comparison = Math.abs(arrivalDateA - arriveByDate) - Math.abs(arrivalDateB - arriveByDate);

                        // Compare box sizes
                        const boxSizeComparisonA = compareBoxSizes(a.boxSizes, quote.boxSizes);
                        const boxSizeComparisonB = compareBoxSizes(b.boxSizes, quote.boxSizes);
                        comparison += boxSizeComparisonA - boxSizeComparisonB;

                        return comparison;
                    });

                    setShipments(prevShipments => [...prevShipments, ...sortedOtherQuotes]);
                }
            }
        } else {
            setNoShipmentsMessage('No quotes available.');
            setShipments([]);
        }
    };

    // Helper function to compare box sizes between shipment and quote
    const compareBoxSizes = (shipmentBoxSizes, quoteBoxSizes) => {
        let totalDifference = 0;
        // Compare box sizes and quantities
        for (const boxSize of quoteBoxSizes) {
            const shipmentBox = shipmentBoxSizes.find(b => b.size === boxSize.size) || { quantity: 0 };
            const boxSizeDifference = Math.abs(shipmentBox.quantity - boxSize.quantity);
            totalDifference += boxSizeDifference;
        }
        return totalDifference;
    };


    useEffect(() => {
        fetchQuotes();
    }, [currentUser]);

    const [showCompareQuote, setShowCompareQuote] = useState(false);
    const [quote, setQuote] = useState(null);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Search and Filter Logic
    useEffect(() => {
        let filtered = quotes;

        // Filter by search term (destination port or warehouse postcode)
        if (searchTerm) {
            filtered = filtered.filter(quote =>
                quote.destinationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.pickupPostcode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (collectBy) {
            filtered = filtered.filter(quote => {
                const quoteCollectDate = new Date(quote.collectBy);
                return quoteCollectDate.toDateString() === collectBy.toDateString();
            });
        }

        if (arriveBy) {
            filtered = filtered.filter(quote => {
                const quoteArriveDate = new Date(quote.arriveBy);
                return quoteArriveDate.toDateString() === arriveBy.toDateString();
            });
        }

        // Check if no quotes are found after filtering
        if (filtered.length === 0) {
            setNoQuotesMessage('No quotes found.');
        } else {
            setNoQuotesMessage('');
        }

        setFilteredQuotes(filtered.slice((page - 1) * pageSize, page * pageSize));
        setTotalPages(Math.ceil(filtered.length / pageSize));
    }, [searchTerm, collectBy, arriveBy, page, pageSize, quotes]);

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

    const handleViewShipmentDetails = async (shipment) => {
        try {
            // Optionally, fetch additional details about the shipment if needed
            const response = await axios.get(`http://localhost:3001/shipafrik/get-shipment/${shipment._id}`);
            const shipmentDetails = response.data;
            // Toggle details visibility based on current state
            if (selectedShipment === shipment._id) {
                // Hide details if the same shipment is clicked again
                setSelectedShipment(null);
                setShowDetails(false);
            } else {
                // Show details for the new shipment
                setSelectedShipment(shipment._id);
                setShowDetails(true);
            }
            console.log('Selected Shipment:', shipmentDetails);

        } catch (error) {
            console.error('Error fetching shipment details:', error);
            // Handle the error (e.g., show an error message)
        }
    };

    const handleGridClick = () => {
        setShowCompareQuote(false);
        setShowDetails(false);
    };

    const handleBuyNow = () => {
        console.log('Navigating with shipment and quote data:', { selectedShipment, quote });
        window.scrollTo(0, 0);
        navigate('/order-summary', { state: { selectedShipment, quote } });
    };
    return (
        <>
            <div className="datatable-top">
                <div className="filters">
                    <div className="row">
                        <div className="col-md-3">
                            <DatePicker
                                className="form-control mx-1"
                                placeholderText='Search by Collect By Date'
                                selected={collectBy}
                                onChange={(date) => setCollectBy(date)}
                                isClearable
                            />
                        </div>
                        <div className="col-md-3">
                            <DatePicker
                                className="form-control mx-1"
                                placeholderText='Search by Arrive By Date'
                                selected={arriveBy}
                                onChange={(date) => setArriveBy(date)}
                                isClearable
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by destination city / postcode"
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
                        {noQuotesMessage || quotes.length === 0 ? (
                            <div className="m-3"><strong>{noQuotesMessage}</strong></div>
                        ) : (
                            <>
                                <table className="table table-bordered table-hover mt-3">
                                    <thead>
                                        <tr>
                                            <th>Quote ID</th>
                                            <th>Destination City</th>
                                            <th>Collect By</th>
                                            <th>Arrive By</th>
                                            <th>Small</th>
                                            <th>Medium</th>
                                            <th>Large</th>
                                            <th>Barrel</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQuotes.map((quote, index) => {
                                            const smallBox = quote.boxSizes.find(box => box.size === 'Small') || {};
                                            const mediumBox = quote.boxSizes.find(box => box.size === 'Medium') || {};
                                            const largeBox = quote.boxSizes.find(box => box.size === 'Large') || {};
                                            const barrelBox = quote.boxSizes.find(box => box.size === 'Standard Barrel') || {};

                                            return (
                                                <tr key={quote.id}>
                                                    <td>{(index + 1) + (page - 1) * pageSize}</td>
                                                    <td>{quote.destinationCity}</td>
                                                    <td>{formatDateToWords(quote.collectBy)}</td>
                                                    <td>{formatDateToWords(quote.arriveBy)}</td>
                                                    <td>{smallBox.quantity || '-'}</td>
                                                    <td>{mediumBox.quantity || '-'}</td>
                                                    <td>{largeBox.quantity || '-'}</td>
                                                    <td>{barrelBox.quantity || '-'}</td>

                                                    <td>
                                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                                            <div>
                                                                <i
                                                                    type="button"
                                                                    className='bi bi-eye-fill'
                                                                    style={{ color: 'blue' }}
                                                                    onClick={() => handleCompareQuote(quote)}
                                                                ></i>
                                                            </div>
                                                            <div>
                                                                <i
                                                                    type="button"
                                                                    className='bi bi-trash-fill'
                                                                    // onClick={() => handleOpenDeleteModal(quote._id)} // Pass the quote ID to the handler
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
                        {showCompareQuote && (
                            loading ? (
                                <div className="loading-spinner">Loading...</div>
                            ) : (
                                <div className="my-4">
                                    <div className="modal-header align-content-center justify-content-center">
                                        <h3 className="modal-title m-1">Your Quotes</h3>
                                        <button type="button" className="btn-close mx-1" onClick={handleGridClick} />
                                    </div>
                                    <div className="m-3"><strong>{noShipmentsMessage}</strong></div>
                                    <table className="table table-bordered mt-3">
                                        <thead>
                                            <tr>
                                                <th>Shipping Agent</th>
                                                <th>Estimated Arrival Date</th>
                                                <th>Destination Port</th>
                                                <th>Type of Service</th>
                                                <th>Price</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shipments.map((shipment, index) => (
                                                <React.Fragment key={shipment._id}>
                                                    <tr>
                                                        <td>{`Shipping Agent ${(index + 1) + (page - 1) * pageSize}`}</td>
                                                        <td>{shipment.estimatedArrivalDate ? formatDateToWords(shipment.estimatedArrivalDate) : 'N/A'}</td>
                                                        <td>{shipment.destinationPort}</td>
                                                        <td>{quote.serviceType}</td>
                                                        <td>£{shipment.doorToDoorFee || 'N/A'}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-outline-info"
                                                                onClick={() => handleViewShipmentDetails(shipment)}
                                                            >
                                                                {selectedShipment === shipment._id ? 'Hide details' : 'Show details'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {selectedShipment === shipment._id && showDetails && (
                                                        <tr>
                                                            <td colSpan="6">
                                                                <table className="table table-borderless table-sm" style={{ border: '2px solid black', width: '100%' }}>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td className="text-start p-2 m-2">
                                                                                <i className="bi bi-check-circle-fill" style={{ color: 'green', fontSize: '36px' }}></i>
                                                                                <span style={{ fontSize: '24px', fontWeight: 'bold' }} className="ms-2">Shipment Overview</span>
                                                                            </td>
                                                                        </tr>

                                                                        {/* Shipment Details */}
                                                                        <tr>
                                                                            <td colSpan="3">
                                                                                <div className="shipment-details">
                                                                                    <h5 style={{ fontWeight: 'bold', marginBottom: '10px', textDecoration: 'underline' }}>Shipment Details</h5>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                                                        <div style={{ flex: '1', marginRight: '10px' }}>
                                                                                            <p><strong>Estimated Vessel Departure:</strong></p>
                                                                                            <p style={{ fontSize: '16px', color: '#555' }}>
                                                                                                {shipment.estimatedVesselDepartureDate ? new Date(shipment.estimatedVesselDepartureDate).toLocaleDateString() : '-'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div style={{ flex: '1', marginRight: '10px' }}>
                                                                                            <p><strong>Estimated Arrival Date:</strong></p>
                                                                                            <p style={{ fontSize: '16px', color: '#555' }}>
                                                                                                {shipment.estimatedArrivalDate ? new Date(shipment.estimatedArrivalDate).toLocaleDateString() : '-'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div style={{ flex: '1', marginRight: '10px' }}>
                                                                                            <p><strong>Destination Port:</strong></p>
                                                                                            <p style={{ fontSize: '16px', color: '#555' }}>
                                                                                                {shipment.destinationPort || '-'}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                                                        <div style={{ flex: '1', marginRight: '10px' }}>
                                                                                            <p><strong>Warehouse Postcode:</strong></p>
                                                                                            <p style={{ fontSize: '16px', color: '#555' }}>
                                                                                                {shipment.warehousePostcode || '-'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div style={{ flex: '1', marginRight: '10px' }}>
                                                                                            <p><strong>Door-to-Door Fee:</strong></p>
                                                                                            <p style={{ fontSize: '16px', color: '#555' }}>
                                                                                                £{shipment.doorToDoorFee || '-'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div style={{ flex: '1', marginRight: '10px' }}>
                                                                                            <p><strong>Pickup Radius:</strong></p>
                                                                                            <p style={{ fontSize: '16px', color: '#555' }}>
                                                                                                {shipment.pickupRadius || '-'}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>

                                                                        {/* Box Sizes and Pricing Table */}
                                                                        <tr>
                                                                            <td colSpan="3">
                                                                                <h5 style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>Package Sizes & Pricing</h5>
                                                                                <p style={{ textAlign: 'center', fontSize: '14px', color: '#555' }}>Available package sizes and prices below.</p>
                                                                                <table className="table table-bordered table-sm" style={{ maxWidth: '80%', margin: '0 auto' }}>
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th>Size</th>
                                                                                            <th>Price (£)</th>
                                                                                            <th>Quantity Available</th>
                                                                                            {/* <th>Requested Quantity</th> */}
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {shipment.boxSizes.map(box => {
                                                                                            // const requestedQuantity = quote.reduce((total, q) => {
                                                                                            //     const boxInQuote = q.boxSizes.find(b => b.size === box.size);
                                                                                            //     return boxInQuote ? boxInQuote.quantity : 0;
                                                                                            // }, 0);

                                                                                            return (
                                                                                                <tr key={box._id}>
                                                                                                    <td>{box.size || '-'}</td>
                                                                                                    <td>{box.price || '-'}</td>
                                                                                                    <td>{box.quantity || '-'}</td>
                                                                                                    {/* <td>{requestedQuantity || '-'}</td> */}
                                                                                                </tr>
                                                                                            );
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>

                                                                            </td>
                                                                        </tr>

                                                                        {/* Buy Now Button - Moved to the Bottom */}
                                                                        <tr>
                                                                            <td className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                                                                                <button className="btn btn-outline-secondary w-50" onClick={handleBuyNow}
                                                                                    style={{ fontSize: '18px', padding: '12px 24px' }}>BUY NOW</button>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>

                                                            </td>
                                                        </tr>

                                                    )}
                                                </React.Fragment >
                                            ))}
                                        </tbody >
                                    </table >
                                </div >
                            )
                        )}



                    </>
                )}
            </div >
        </>
    );
};

export default Quotes;
