import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import { toast } from 'react-toastify';

const Orders = () => {
    const { currentUser } = useAuth();
    console.log('Current User:', currentUser);
    const [orders, setOrders] = useState([]); // Ensure it's initialized as an array
    const [searchTerm, setSearchTerm] = useState(''); // State for the search input

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/shipafrik/orders/${currentUser}`); // Replace with your API endpoint
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter orders safely, ensuring orders is an array
    const filteredOrders = Array.isArray(orders)
        ? orders.filter(order => order.orderReference.includes(searchTerm))
        : [];

    // Separate orders by status: In Progress and Shipped
    const inProgressOrders = filteredOrders.filter(order => order.status === 'In Progress');
    const shippedOrders = filteredOrders.filter(order => order.status === 'Shipped');

    return (
        <>
            {/* Search Bar */}
            <div className="row py-4">
                <div className="col-md-6 mx-auto">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Order Reference"
                        value={searchTerm}
                onChange={handleSearch}
                    />
                </div>
            </div>

            {/* In Progress Orders Table */}
            <div className="row py-4">
                <div className="col-xl-12">
                    <div className="card-body pt-3">
                        <h5 className="card-title text-start">In Progress Orders</h5>

                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Order Reference</th>
                                    <th>Customer Name</th>
                                    <th>Pickup Address</th>
                                    <th>Dropoff Address</th>
                                    <th>Grand Total</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inProgressOrders.length > 0 ? (
                                    inProgressOrders.map(order => (
                                        <tr key={order._id}>
                                            <td>{order.orderReference}</td>
                                            <td>{order.customerName}</td>
                                            <td>{order.pickupAddress}</td>
                                            <td>{order.dropoffAddress}</td>
                                            <td>{order.grandTotal}</td>
                                            <td>{new Date(order.preferredCollectionDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No In Progress orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Shipped Orders Table */}
            <div className="row py-4">
                <div className="col-xl-12">
                    <div className="card-body pt-3">
                        <h5 className="card-title text-start">Shipped Orders</h5>

                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Order Reference</th>
                                    <th>Customer Name</th>
                                    <th>Pickup Address</th>
                                    <th>Dropoff Address</th>
                                    <th>Grand Total</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shippedOrders.length > 0 ? (
                                    shippedOrders.map(order => (
                                        <tr key={order._id}>
                                            <td>{order.orderReference}</td>
                                            <td>{order.customerName}</td>
                                            <td>{order.pickupAddress}</td>
                                            <td>{order.dropoffAddress}</td>
                                            <td>{order.grandTotal}</td>
                                            <td>{new Date(order.preferredCollectionDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No Shipped orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Orders;
