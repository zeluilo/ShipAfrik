import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import QuotesTable from './QuotesTable'; // Import the new table component
import { ip } from "../../../constants";

const CompareQuotes = () => {
    const [shipments, setShipments] = useState([]);
    const [quote, setQuotes] = useState([]);
    const [noShipmentsMessage, setNoShipmentsMessage] = useState('');
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedQuote = JSON.parse(localStorage.getItem('quoteFormData'));
        if (savedQuote) {
            setQuotes(savedQuote);
            handleCompareQuote(savedQuote);
        } else {
            setNoShipmentsMessage('No quote found in local storage.');
        }
    }, []);

    const handleCompareQuote = async (quote) => {
        const shipmentsResponse = await axios.get(`${ip}/shipafrik/shipments`);
        const shipments = shipmentsResponse.data;
        if (quote) {
            const filteredByCity = shipments.filter(shipment =>
                shipment.destinationPort.toLowerCase() === quote.destinationCity.toLowerCase()
            );
            if (filteredByCity.length === 0) {
                setNoShipmentsMessage('No shipments found in your city.');
                setShipments(shipments);
            } else {
                setNoShipmentsMessage('');
                const sortedShipments = filteredByCity.sort((a, b) => compareShipments(a, b, quote));
                setShipments(sortedShipments);
                const otherQuotes = shipments.filter(shipment =>
                    shipment.destinationPort.toLowerCase() !== quote.destinationCity.toLowerCase()
                );
                if (otherQuotes.length > 0) {
                    const sortedOtherQuotes = otherQuotes.sort((a, b) => compareShipments(a, b, quote));
                    setShipments(prevShipments => [...prevShipments, ...sortedOtherQuotes]);
                }
            }
        }
    };

    const handleViewShipmentDetails = (shipment) => {
        if (selectedShipment === shipment._id) {
            setSelectedShipment(null);
            setShowDetails(false);
        } else {
            setSelectedShipment(shipment._id);
            setShowDetails(true);
        }
    };

    const handleBuyNow = () => {
        // console.log('Navigating with shipment and quote data:', { selectedShipment, quote });
        window.scrollTo(0, 0);
        navigate('/order-summary', { state: { selectedShipment, quote } });
    };

    const formatDateToWords = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    const compareShipments = (a, b, quote) => {
        // Comparison logic remains the same
        return a - b;
    };

    return (
        <section id="constructions" className="constructions section bg-dark min-vh-100 d-flex" style={{ textAlign: 'center' }}>
            <div className="container section-title" data-aos="fade-up">
                <div className="row py-5">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body pt-3">
                                <div className="my-4">
                                    <div className="modal-header">
                                        <h3 className="modal-title m-1 text-start" style={{ fontWeight: 'bold' }}>Your Quotes</h3>
                                    </div>
                                    {{noShipmentsMessage} && <div className="m-3 text-danger"><strong>{noShipmentsMessage}</strong></div>}
                                    {shipments.length > 0 ? (
                                        <QuotesTable
                                            shipments={shipments}
                                            selectedShipment={selectedShipment}
                                            showDetails={showDetails}
                                            handleViewShipmentDetails={handleViewShipmentDetails}
                                            handleBuyNow={handleBuyNow}
                                            quotes={quote}
                                            formatDateToWords={formatDateToWords}
                                        />
                                    ) : (
                                        <p>No shipments available for comparison.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default CompareQuotes;
