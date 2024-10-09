import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from "../../../../components/Context";
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ip } from "../../../constants";

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Test Cards
// 4000058260000005
// 5555558265554449
// 4000008260000000

const OrderConfirmation = () => {
    const { currentUser } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const { order } = location.state || {};
    // console.log('Orders:', order);

    return (
        <section id="constructions" className="constructions section bg-dark min-vh-100 d-flex" style={{ textAlign: 'center' }}>
            <div className="container section-title" data-aos="fade-up">
                <div className="row py-4 my-3">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body pt-3">
                                <h2 style={{ color: 'green' }}>Thank you for Booking with ShipAfrik!</h2>
                                <p className="mt-1">
                                    <strong>Order Reference: </strong>{order.orderReference}
                                </p>
                                <div className="row p-3">
                                    <div className="col-xl-6">
                                        {/* First Table with Box Sizes */}
                                        <table className="table table-borderless mt-3 table-lg h-75" style={{ border: '1px solid black' }}>
                                            <thead>
                                                <tr>
                                                    <th>Box Size</th>
                                                    <th>Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order && order.quote && order.quote[0].boxSizes ? (
                                                    <>
                                                        {order.quote[0].boxSizes.map((box, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{box.size || '-'}</td>
                                                                    <td>{box.quantity || '-'}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                        <tr>
                                                            <td>Preferred Collection Date</td>
                                                            <td>
                                                                {new Date(order.preferredCollectionDate).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                        <tr style={{ border: '1px solid black' }}>
                                                            <td >
                                                                <strong>Grand Total</strong>
                                                            </td>
                                                            <td>
                                                                <strong>£{order.grandTotal || '-'}</strong>
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
                                    </div>

                                    {/* Form Inputs Side */}
                                    <div className="col-xl-6">
                                        <div>
                                            <h5><strong>Customer Details</strong></h5>
                                            <table className="table table-borderless mt-3 table-sm">
                                                <tbody>
                                                    <tr>
                                                        <td>Full Name</td>
                                                        {/* <td><input
                                                            type="text"
                                                            className="form-control"
                                                            // placeholder="Enter full name"
                                                        /></td> */}
                                                    </tr>
                                                    <tr>
                                                        <td>Pickup Address</td>
                                                        {/* <td><input
                                                            type="text"
                                                            className="form-control"
                                                            // placeholder="Enter pickup address"
                                                        /></td> */}
                                                    </tr>
                                                    <tr>
                                                        <td>Contact Phone</td>
                                                        {/* <td><input
                                                            type="tel"
                                                            className="form-control"
                                                            // placeholder="Enter phone number"
                                                        /></td> */}
                                                    </tr>
                                                    <tr>
                                                        <td>Contact E-mail</td>
                                                        {/* <td><input
                                                            type="email"
                                                            className="form-control"
                                                            // placeholder="Enter email"
                                                            // value={contactEmail}
                                                            // onChange={(e) => setContactEmail(e.target.value)}
                                                        /></td> */}
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
                                                        {/* <td><input
                                                            type="text"
                                                            className="form-control"
                                                            // placeholder="Enter full name"
                                                            // value={customerName}
                                                            // onChange={(e) => setCustomerName(e.target.value)}
                                                        /></td> */}
                                                    </tr>
                                                    <tr>
                                                        <td>Drop-off Address</td>
                                                        {/* <td><input
                                                            type="text"
                                                            className="form-control"
                                                            // placeholder="Enter drop-off address"
                                                            // value={dropoffAddress}
                                                            // onChange={(e) => setDropoffAddress(e.target.value)}
                                                        /></td> */}
                                                    </tr>
                                                    <tr>
                                                        <td>Contact Phone</td>
                                                        {/* <td><input
                                                            type="tel"
                                                            className="form-control"
                                                            // placeholder="Enter phone number"
                                                            // value={destinationContactPhone}
                                                            // onChange={(e) => setDestinationContactPhone(e.target.value)}
                                                        /></td> */}
                                                    </tr>
                                                    <tr>
                                                        <td>Contact E-mail</td>
                                                        {/* <td><input
                                                            type="email"
                                                            className="form-control"
                                                            // placeholder="Enter email"
                                                            // value={destinationContactEmail}
                                                            // onChange={(e) => setDestinationContactEmail(e.target.value)}
                                                        /></td> */}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* <p className="mt-2 text-muted" style={{ fontSize: '13px' }}>
                                            <strong>Drop-Off Address (only if the customer chooses a drop-off to shipper warehouse) </strong><br /><br />
                                            The Shipper will get in touch with you directly to let you know where to drop off your shipment.
                                        </p> */}
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

export default OrderConfirmation;
