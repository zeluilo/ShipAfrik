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
    const { selectedShipment, quotes } = location.state || {};
    console.log('Selected Shipment:', selectedShipment);
    console.log('Quotes:', quotes);
    const [loading, setLoading] = useState(true);
    const [shipmentDetails, setShipmentDetails] = useState(null);
    const [preferredDate, setPreferredDate] = useState(null);
    const [grandTotal, setGrandTotal] = useState(0);

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

    useEffect(() => {
        if (shipmentDetails && quotes) {
            const quoteSizes = Array.isArray(quotes)
                ? quotes.map(q => q.boxSizes).flat()
                : quotes.boxSizes || [];

            const total = shipmentDetails.boxSizes.reduce((total, box) => {
                return total + (box.price * (quoteSizes.find(q => q.size === box.size)?.quantity || 0));
            }, 0);

            setGrandTotal(total);
        }
    }, [shipmentDetails, quotes]); // Calculate grand total whenever shipmentDetails or quotes change

    const handlePaymentOrder = async () => {
                    // Validate required fields
    if (!customerName) {
        toast.error("Customer name is required");
        return;
    }
    if (!pickupAddress) {
        toast.error("Pickup address is required");
        return;
    }
    if (!contactPhone) {
        toast.error("Contact phone is required");
        return;
    }
    if (!contactEmail) {
        toast.error("Contact email is required");
        return;
    }
    if (!dropoffAddress) {
        toast.error("Dropoff address is required");
        return;
    }
    if (!preferredDate) {
        toast.error("Preferred collection date is required");
        return;
    }
    if (grandTotal === 0 || isNaN(grandTotal)) {
        toast.error("Grand total is missing or invalid");
        return;
    }
        try {
            const orderData = {
                customerName,
                pickupAddress,
                contactPhone,
                contactEmail,
                dropoffAddress,
                quotes,
                shipmentId: shipmentDetails._id,
                preferredDate,
                grandTotal,
                status: 'In Progress',
            };
            console.log('Order Data:', orderData);

            const response = await axios.post('http://localhost:3001/shipafrik/payment-orders', orderData);
            console.log('Order placed successfully:', response.data);
            if (response.status === 201) {
                toast.success('Order placed successfully!');
                // navigate('/customer-hub');
            } else {
                toast.error('Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order');
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
                                                    <th>Requested Quantity</th>
                                                    <th>Total (£)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shipmentDetails && shipmentDetails.boxSizes && quotes ? (
                                                    <>
                                                        {shipmentDetails.boxSizes.map((box, index) => {
                                                            const quoteSizes = Array.isArray(quotes)
                                                                ? quotes.map(q => q.boxSizes).flat()
                                                                : quotes.boxSizes || [];

                                                            const boxInQuote = quoteSizes.find(b => b.size === box.size);
                                                            const requestedQuantity = boxInQuote ? boxInQuote.quantity : 0;

                                                            return (
                                                                <tr key={index}>
                                                                    <td>{box.size || '-'}</td>
                                                                    <td>£{box.price || '-'}</td>
                                                                    <td>{requestedQuantity || '-'}</td>
                                                                    <td>£{(box.price && requestedQuantity) ? (box.price * requestedQuantity).toFixed(2) : '-'}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                        <tr>
                                                            <td colSpan="2">Preferred Collection Date</td>
                                                            <td colSpan="2">
                                                                <DatePicker
                                                                    selected={preferredDate}
                                                                    onChange={(date) => {
                                                                        setPreferredDate(date);
                                                                    }}
                                                                    dateFormat="dd/MM/yyyy"
                                                                    minDate={new Date(shipmentDetails.availableCollectionDays[0])}
                                                                    maxDate={new Date(shipmentDetails.availableCollectionDays[1])}
                                                                    className='form-control'
                                                                    placeholderText="Select a date"
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr style={{ border: '1px solid black' }}>
                                                            <td colSpan="3"><strong>Grand Total</strong></td>
                                                            <td>
                                                                <strong>£{grandTotal}</strong>
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
                                            data-bs-toggle="modal" data-bs-target="#buy"
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

<div className="modal fade" id="buy" tabIndex="-1">
    <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
            <div className="modal-header">
                <h4 className="modal-title">Confirm Your Shipment</h4>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
                <p className="text-muted pb-3">
                    Please review the shipment details and make the payment to proceed.
                </p>

                <div className="shipment-details px-3 py-4 border border-primary rounded mb-3">
                    <h5 className="mb-3">Shipment Details</h5>
                    <div className="mb-2">
                        <strong>Customer Name:</strong>
                        <span className="ms-2">{customerName}</span>
                    </div>
                    <div className="mb-2">
                        <strong>Pickup Address:</strong>
                        <span className="ms-2">{pickupAddress}</span>
                    </div>
                    <div className="mb-2">
                        <strong>Contact Phone:</strong>
                        <span className="ms-2">{contactPhone}</span>
                    </div>
                    <div className="mb-2">
                        <strong>Contact Email:</strong>
                        <span className="ms-2">{contactEmail}</span>
                    </div>
                    <div className="mb-2">
                        <strong>Dropoff Address:</strong>
                        <span className="ms-2">{dropoffAddress}</span>
                    </div>
                    <div className="mb-2">
                        <strong>Preferred Collection Date:</strong>
                        <span className="ms-2">{preferredDate ? preferredDate.toLocaleDateString() : 'Not specified'}</span>
                    </div>
                </div>

                <h4 className="mt-3">Payment Details</h4>
                <form>
                    <div className="form-group mb-3">
                        <label htmlFor="cardOwner" className="form-label">
                            <h6>Card Owner Name</h6>
                        </label>
                        <input
                            type="text"
                            name="cardOwner"
                            className="form-control"
                            required
                            // value={cardDetails.cardOwner}
                            // onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label">
                            <h6>Card Details</h6>
                        </label>
                        {/* <CardElement className="form-control" options={cardElementOptions} /> */}
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="userEmail" className="form-label">
                            <h6>Email Address</h6>
                        </label>
                        <input
                            type="email"
                            name="userEmail"
                            className="form-control"
                            required
                            // value={cardDetails.userEmail}
                            // onChange={handleInputChange}
                        />
                    </div>
                </form>

                <div className="d-flex justify-content-between mt-3">
                    <span><strong>Grand Total:</strong></span>
                    <span className="h5">£{grandTotal.toFixed(2)}</span>
                </div>

                <div className="mt-4">
                    <button
                        onClick={handlePaymentOrder}
                        data-bs-dismiss="modal"
                        className="btn btn-primary btn-block"
                        style={{ width: '100%' }}
                    >
                        Proceed to Payment <i className="fas fas-long-arrow-alt-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

        </section>
    );
};

export default OrderSummary;
