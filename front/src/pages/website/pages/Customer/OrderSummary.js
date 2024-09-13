import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from "../../../../components/Context";
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const OrderSummary = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedShipment } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [shipmentDetails, setShipmentDetails] = useState(null);
    const [preferredDate, setPreferredDate] = useState(null);

    // Customer details state
    const [customerName, setCustomerName] = useState('');
    const [pickupAddress, setPickupAddress] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');

    // Destination details state
    const [dropoffAddress, setDropoffAddress] = useState('');
    const [destinationContactPhone, setDestinationContactPhone] = useState('');
    const [destinationContactEmail, setDestinationContactEmail] = useState('');

    useEffect(() => {
        const fetchShipment = async () => {
            try {
                setLoading(true);
                if (selectedShipment) {
                    const response = await axios.get(`http://localhost:3001/shipafrik/get-shipment/${selectedShipment}`);
                    const shipmentDetails = response.data;
                    console.log('Fetched Shipment:', shipmentDetails);
                    setShipmentDetails(shipmentDetails);
                }
            } catch (error) {
                console.error('Error fetching shipment details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShipment();
    }, [selectedShipment]);

    const handlePaymentOrder = async () => {
        try {
            const orderData = {
                customerName,
                pickupAddress,
                contactPhone,
                contactEmail,
                dropoffAddress,
                boxSizes: shipmentDetails.boxSizes,
                preferredDate,
                grandTotal: shipmentDetails.boxSizes.reduce((total, box) => total + (box.price * box.quantity), 0)
            };

            const response = await axios.post('http://localhost:3001/shipafrik/payment-orders', orderData);
            console.log('Order Data:', orderData);
            if (response.status === 200) {
                console.log('Order placed successfully!');
                toast.success('Order placed successfully!');
                navigate('/customer-hub');
            } else {
                console.error('Failed to place order');
                toast.error('Failed to place order');
            }
            alert('Order placed successfully!');
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order');
        }
    };

    return (
        <section id="constructions" className="constructions section bg-dark min-vh-100 d-flex" style={{ textAlign: 'center' }}>
            <div className="container section-title" data-aos="fade-up">
                <div className="row py-4 my-3">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body pt-3">
                                <h2>Order Summary</h2>
                                <p className="mt-1">
                                    Review the details of your shipment below. Ensure that all information is accurate before proceeding with the payment.
                                    If you have any questions or need further assistance, please contact our support team.
                                </p>
                                <div className="row p-3">
                                    <div className="col-xl-6">
                                        {/* First Table with Box Sizes */}
                                        <table className="table table-borderless mt-3 table-lg h-75" style={{ border: '1px solid black' }}>
                                            <thead>
                                                <tr>
                                                    <th>Box Size</th>
                                                    <th>Price (£)</th>
                                                    <th>Quantity</th>
                                                    <th>Total (£)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shipmentDetails && shipmentDetails.boxSizes ? (
                                                    <>
                                                        {shipmentDetails.boxSizes.map((box, index) => (
                                                            <tr key={index}>
                                                                <td>{box.size || '-'}</td>
                                                                <td>£{box.price || '-'}</td>
                                                                <td>{box.quantity || '-'}</td>
                                                                <td>£{box.price && box.quantity ? (box.price * box.quantity).toFixed(2) : '-'}</td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td colSpan="2">Preferred Collection Date</td>
                                                            <td colSpan="2">
                                                                <DatePicker
                                                                    selected={preferredDate}
                                                                    onChange={(date) => setPreferredDate(date)}
                                                                    dateFormat="dd/MM/yyyy"
                                                                    minDate={new Date()}
                                                                    className='form-control'
                                                                    placeholderText="Select a date"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr style={{ border: '1px solid black' }}>
                                                            <td colSpan="3"><strong>Grand Total</strong></td>
                                                            <td>
                                                                <strong>
                                                                    £{shipmentDetails.boxSizes.reduce((total, box) => total + (box.price * box.quantity), 0).toFixed(2) || '-'}
                                                                </strong>
                                                            </td>
                                                        </tr>
                                                    </>
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4">No shipment details available.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {/* Text Below the Table */}
                                        <div className="mt-1">
                                            <p><strong>Trusted by 1,000+ customers worldwide</strong></p>
                                            <p>We accept the following payment methods:</p>
                                            <div className="d-flex justify-content-center">
                                                <img src="/path-to-visa-icon.png" alt="VISA" className="mx-2" />
                                                <img src="/path-to-apple-pay-icon.png" alt="Apple Pay" className="mx-2" />
                                                <img src="/path-to-paypal-icon.png" alt="PayPal" className="mx-2" />
                                            </div>
                                        </div>
                                        <p className="text-center mt-4">© 2024 Pay</p>
                                    </div>

                                    {/* Form Inputs Side */}
                                    <div className="col-xl-6">
                                        <div>
                                            <h5><strong>Customer Details</strong></h5>
                                            <table className="table table-borderless mt-3 table-sm">
                                                <tbody>
                                                    <tr>
                                                        <td>Full Name</td>
                                                        <td><input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter full name"
                                                            value={customerName}
                                                            onChange={(e) => setCustomerName(e.target.value)}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Pickup Address</td>
                                                        <td><input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter pickup address"
                                                            value={pickupAddress}
                                                            onChange={(e) => setPickupAddress(e.target.value)}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Contact Phone</td>
                                                        <td><input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter phone number"
                                                            value={contactPhone}
                                                            onChange={(e) => setContactPhone(e.target.value)}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Contact E-mail</td>
                                                        <td><input
                                                            type="email"
                                                            className="form-control"
                                                            placeholder="Enter email"
                                                            value={contactEmail}
                                                            onChange={(e) => setContactEmail(e.target.value)}
                                                        /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div>
                                            <h5><strong>Destination Details</strong></h5>
                                            <table className="table table-borderless table-sm">
                                                <tbody>
                                                    <tr>
                                                        <td>Full Name</td>
                                                        <td><input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter full name"
                                                            value={customerName}
                                                            onChange={(e) => setCustomerName(e.target.value)}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Drop-off Address</td>
                                                        <td><input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter drop-off address"
                                                            value={dropoffAddress}
                                                            onChange={(e) => setDropoffAddress(e.target.value)}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Contact Phone</td>
                                                        <td><input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter phone number"
                                                            value={destinationContactPhone}
                                                            onChange={(e) => setDestinationContactPhone(e.target.value)}
                                                        /></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Contact E-mail</td>
                                                        <td><input
                                                            type="email"
                                                            className="form-control"
                                                            placeholder="Enter email"
                                                            value={destinationContactEmail}
                                                            onChange={(e) => setDestinationContactEmail(e.target.value)}
                                                        /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="mt-2 text-muted" style={{ fontSize: '13px' }}>
                                            <strong>Drop-Off Address (only if the customer chooses a drop-off to shipper warehouse) </strong><br /><br />
                                            The Shipper will get in touch with you directly to let you know where to drop off your shipment.
                                        </p>
                                    </div>
                                </div>
                                <div className="row mt-4 p-4">
                                    <div className="col text-center">
                                        <button
                                            type="button"
                                            className="btn btn-outline-success mx-2 w-25"
                                            onClick={handlePaymentOrder}
                                        >
                                            Pay Now
                                        </button>
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

export default OrderSummary;
