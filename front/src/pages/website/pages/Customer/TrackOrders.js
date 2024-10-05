import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './TrackOrders.css'; // Make sure to create this CSS file for custom styles
import { ip } from "../../../constants";

const TrackOrders = () => {
    const [orderReference, setOrderReference] = useState(''); // State for order reference input
    const [email, setEmail] = useState(''); // State for email input
    const [orderDetails, setOrderDetails] = useState(null); // State for storing fetched order details
    const [loading, setLoading] = useState(false); // State for loading indicator

    // Define shipment statuses
    const statuses = [
        'In Progress',
        'Shipment Booked',
        'Shipment Has Left the Dock',
        'Shipment Has Landed in Ghana',
        'Shipment Delivered',
    ];

    const handleSearchOrder = async () => {
        if (!orderReference || !email) {
            toast.error("Please enter both order reference and email.");
            return;
        }

        try {
            setLoading(true);
            const lowercaseOrderReference = orderReference.toUpperCase();

            const response = await axios.get(`${ip}/shipafrik/orders?orderReference=${lowercaseOrderReference}&email=${email}`); // Fetch order
            console.log('Response Data: ', response.data)

            // Check if order is found
            if (response.status === 200 && response.data) {
                setOrderDetails(response.data); // Store fetched order details
                toast.success("Order fetched successfully!");
            } else {
                toast.error("Order not found. Please check the order reference and email.");
            }
        } catch (error) {
            console.error("Error fetching order", error);

            // Check if the error response is 404 (Order not found)
            if (error.response && error.response.status === 404) {
                toast.error("Order not found. Please check the order reference and email.");
            } else {
                toast.error("Failed to fetch the order. Please check the details and try again.");
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const renderStatusTracking = () => {
        if (!orderDetails) return null;

        const currentStatusIndex = statuses.indexOf(orderDetails.status);
        
        return (
            <div className="status-tracking">
                <h5>Shipment Status</h5>
                <ul className="status-list">
                    {statuses.map((status, index) => (
                        <li key={index} className={`status-item ${index <= currentStatusIndex ? 'completed' : ''}`}>
                            <span className="status-point">{index <= currentStatusIndex ? '✔️' : '✖️'}</span>
                            {status}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <section id="track-orders" className="section bg-dark min-vh-100 d-flex" style={{ textAlign: 'center' }}>
            <div className="container section-title" data-aos="fade-up">
                <h2 style={{ marginTop: '50px', color: 'white' }}>Track Your Shipments</h2>
                <p style={{ color: 'white' }}>Enter your order reference and email to track your order details.</p>

                <div className="row py-4">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body pt-3">
                                <div className="row mb-3 align-items-center justify-content-center">
                                    <div className="col-sm-8 d-flex align-items-center">
                                        <label htmlFor="orderReference" className="col-sm-2 col-form-label"><strong>Order Reference:</strong></label>
                                        <div className="col-sm-4">
                                            <input
                                                type="text"
                                                id="orderReference"
                                                className="form-control"
                                                value={orderReference}
                                                onChange={(e) => setOrderReference(e.target.value)}
                                                placeholder="Enter Order Reference"
                                            />
                                        </div>
                                        <label htmlFor="email" className="col-sm-2 col-form-label"><strong>Email:</strong></label>
                                        <div className="col-sm-4">
                                            <input
                                                type="email"
                                                id="email"
                                                className="form-control"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter Your Email"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-outline-primary" onClick={handleSearchOrder} disabled={loading}>
                                    {loading ? 'Fetching Order...' : 'Track Order'}
                                </button>

                                {orderDetails && (
                                    <div className="mt-4 order-details">
                                        <h5>Order Details</h5>
                                        <p><strong>Order Reference:</strong> {orderDetails.orderReference}</p>
                                        <p><strong>Customer Name:</strong> {orderDetails.customerName}</p>
                                        <p><strong>Email:</strong> {orderDetails.contactEmail}</p>
                                        <p><strong>Pickup Address:</strong> {orderDetails.pickupAddress}</p>
                                        <p><strong>Drop-off Address:</strong> {orderDetails.dropoffAddress}</p>
                                        <p><strong>Contact Phone:</strong> {orderDetails.contactPhone}</p>
                                        <p><strong>Grand Total:</strong> £{orderDetails.grandTotal}</p>
                                        <p><strong>Preferred Collection Date:</strong> {new Date(orderDetails.preferredCollectionDate).toLocaleDateString()}</p>
                                        {renderStatusTracking()} {/* Render the status tracking UI */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrackOrders;
