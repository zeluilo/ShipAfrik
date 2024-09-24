import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TrackOrders = () => {
    const [orderReference, setOrderReference] = useState(''); // State for order reference input
    const [email, setEmail] = useState(''); // State for email input
    const [orderDetails, setOrderDetails] = useState(null); // State for storing fetched order details
    const [loading, setLoading] = useState(false); // State for loading indicator

    const handleSearchOrder = async () => {
        if (!orderReference || !email) {
            toast.error("Please enter both order reference and email.");
            return;
        }
    
        try {
            setLoading(true);
            const lowercaseOrderReference = orderReference.toLowerCase();

            const response = await axios.get(`http://localhost:3001/shipafrik/orders?orderReference=${orderReference}&email=${email}`); // Fetch order
    
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
                    <div className="mt-4">
                        <h5>Order Details</h5>
                        <p><strong>Order Reference:</strong> {orderDetails.orderReference}</p>
                        <p><strong>Email:</strong> {orderDetails.contactEmail}</p>
                        {/* Add more details from the fetched order here */}
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
