import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import QuotesTable from './QuotesTable'; // Import the new table component
import { ip } from "../../../constants";

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
            const quotesResponse = await axios.get(`${ip}/shipafrik/quotes/${currentUser}`);
            const quotes = quotesResponse.data;
            setQuotes(quotes);
            // console.log('Quotes:', quotes);

            // Check if no shipments are found
            if (quotes.length === 0) {
                setNoQuotesMessage('No shipments found.');
            } else {
                setNoQuotesMessage('');
            }

            setTotalPages(Math.ceil(quotes.length / pageSize));
        } catch (error) {
            // console.error('Error fetching quotes:', error);
            // toast.error('Failed to fetch quotes');
        } finally {
            setLoading(false); // Set loading to false once data is fetched
        }
    };

    const handleCompareQuote = async (quote) => {
        setShowCompareQuote(true);
        setQuote(quote);


        // Fetch all shipments
        const shipmentsResponse = await axios.get(`${ip}/shipafrik/shipments`);
        const shipments = shipmentsResponse.data;
        // console.log('Shipments:', shipments);

        if (quote) {
            // Filter shipments by destination city
            const filteredByCity = shipments.filter(shipment =>
                shipment.destinationPort.toLowerCase() === quote.destinationCity.toLowerCase()
            );

            if (filteredByCity.length === 0) {
                setNoShipmentsMessage('No shipments found in your city.');
                // console.log('No shipments found in your city.');

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

    const handleGridClick = () => {
        setShowCompareQuote(false);
        setShowDetails(false);
    };

    const handleBuyNow = () => {
        // console.log('Navigating with shipment and quote data:', { selectedShipment, quote });
        window.scrollTo(0, 0);
        navigate('/order-summary', { state: { selectedShipment, quote } });
    };

    const handleDeleteQuote = async (quoteId) => {
        try {
            // Make a DELETE request to delete the quote by its ID
            const response = await axios.delete(`${ip}/shipafrik/delete-quote/${quoteId}`);

            if (response.status === 200) {
                // Handle successful deletion (e.g., remove the deleted quote from the UI)
                // console.log('Quote deleted successfully:', response.data);
                await fetchQuotes()

                // Check if no quotes are found after filtering
                if (quotes.length === 0) {
                    setNoQuotesMessage('No quotes found.');
                } else {
                    setNoQuotesMessage('');
                }
            }
        } catch (error) {
            // console.error('Error deleting quote:', error);
            // Optionally, show an error message to the user
        }
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
                                            <th>Standard</th>
                                            <th>Medium</th>
                                            <th>Large</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQuotes.map((quote, index) => {
                                            const standardBox = quote.boxSizes.find(box => box.size === 'Standard') || {};
                                            const mediumBox = quote.boxSizes.find(box => box.size === 'Medium') || {};
                                            const largeBox = quote.boxSizes.find(box => box.size === 'Large') || {};

                                            return (
                                                <tr key={quote.id}>
                                                    <td>{(index + 1) + (page - 1) * pageSize}</td>
                                                    <td>{quote.destinationCity}</td>
                                                    <td>{formatDateToWords(quote.collectBy)}</td>
                                                    <td>{formatDateToWords(quote.arriveBy)}</td>
                                                    <td>{standardBox.quantity || '-'}</td>
                                                    <td>{mediumBox.quantity || '-'}</td>
                                                    <td>{largeBox.quantity || '-'}</td>

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
                                                                    onClick={() => handleDeleteQuote(quote._id)} // Call the delete handler with the quote ID
                                                                    style={{ color: 'red' }}
                                                                ></i>
                                                            </div>

                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="pagination-controls my-4">
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
                                    <div className="m-3 text-danger"><strong>{noShipmentsMessage}</strong></div>
                                    <QuotesTable
                                        shipments={shipments}
                                        // selectedShipment={selectedShipment}
                                        showDetails={showDetails}
                                        // handleViewShipmentDetails={handleViewShipmentDetails}
                                        handleBuyNow={handleBuyNow}
                                        quotes={quote}
                                        formatDateToWords={formatDateToWords}
                                    />
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
