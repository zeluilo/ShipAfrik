import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import { toast } from 'react-toastify';

const Orders = () => {
    const { currentUser } = useAuth();

    useEffect(() => {
        console.log('Order User Details:', currentUser);
    }, [currentUser]);

    const [orders, setOrders] = useState([]); // Ensure it's initialized as an array
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrderId] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const handleViewOrders = (order) => {
        setSelectedOrderId(order);
        // setOrders(order);
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get(http://localhost:3001/shipafrik/orders/${currentUser});
            console.log('Fetched Orders:', response.data.orders);
            setOrders(response.data.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentUser]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleUpdateStatus = async (orderId) => {
        try {
            await axios.put(http://localhost:3001/shipafrik/orders/${orderId}/status, { status: newStatus });
            toast.success('Order status updated successfully!');
            setShowStatusModal(false);
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update order status');
        }
    };


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // Filter orders safely, ensuring orders is an array
    const filteredOrders = Array.isArray(orders)
        ? orders.filter(order => order.orderReference.includes(searchTerm))
        : [];

    // Separate orders by status: In Progress and Shipped
    const inProgressOrders = filteredOrders.filter(order => order.status === 'In Progress');
    const shippedOrders = filteredOrders.filter(order =>
        order.status === 'Shipped' ||
        order.status === 'Shipment Has Left the Dock' ||
        order.status === 'Shipment Has Landed in Ghana' ||
        order.status === 'Shipment Delivered'
    );

    // Calculate counts
    const inProgressCount = inProgressOrders.length;
    const shippedCount = shippedOrders.length;

    return (
        <>
            <div className="row">

                {/* Left side columns */}
                <div className="col-lg-12">
                    <div className="d-flex justify-content-between">
                        <div style={{ backgroundColor: '#ffc95c' }} className="text-center flex-fill border rounded p-2 m-1">
                            <h6>{inProgressCount}</h6>
                            <span className="text-muted small">Orders In Progress</span>
                        </div>
                        <div style={{ backgroundColor: '#6edb7e' }} className="text-center flex-fill border rounded p-2 m-1">
                            <h6>{shippedCount}</h6>
                            <span className="text-muted small">Orders Shipped</span>
                        </div>
                        <div className="text-center flex-fill border rounded p-2 m-1">
                            <h6>£2000</h6>
                            <span className="text-muted small">Revenue</span>
                        </div>
                        <div className="text-center flex-fill border rounded p-2 m-1">
                            <h6>okay</h6>
                            <span className="text-muted small">Avg Customer Rating</span>
                        </div>
                    </div>
                </div>


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
                <div className="row">
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
                                        <th>Revenue Generated</th>
                                        <th>Date</th>
                                        <th>Action</th>
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
                                                <td>£{order.grandTotal}</td>
                                                <td>{new Date(order.preferredCollectionDate).toLocaleDateString()}</td>
                                                <td>
                                                    <div>
                                                        <i
                                                            type="button"
                                                            className='bi bi-eye-fill'
                                                            style={{ color: 'blue' }}
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#viewShipmentDetails"
                                                            onClick={() => handleViewOrders(order)}
                                                        ></i>
                                                    </div>
                                                </td>
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
                <div className="row">
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
                                        <th>Revenue Generated</th>
                                        <th>Date</th>
                                        <th>Action</th>
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
                                                <td>£{order.grandTotal}</td>
                                                <td>{new Date(order.preferredCollectionDate).toLocaleDateString()}</td>
                                                <td>
                                                    <div>
                                                        <i
                                                            type="button"
                                                            className='bi bi-eye-fill'
                                                            style={{ color: 'blue' }}
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#viewShipmentDetails"
                                                            onClick={() => handleViewOrders(order)}
                                                        ></i>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7">No Shipped orders found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal for Viewing Shipment Details */}
                <div className="modal fade" id="viewShipmentDetails" tabIndex="-1" aria-labelledby="viewShipmentLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="viewShipmentLabel">Order Details</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                {selectedOrder ? (
                                    <>
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Order Reference:</strong></td>
                                                    <td>{selectedOrder.orderReference}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Customer Name:</strong></td>
                                                    <td>{selectedOrder.customerName}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Pickup Address:</strong></td>
                                                    <td>{selectedOrder.pickupAddress}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Dropoff Address:</strong></td>
                                                    <td>{selectedOrder.dropoffAddress}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Contact Phone:</strong></td>
                                                    <td>{selectedOrder.contactPhone}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Contact Email:</strong></td>
                                                    <td>{selectedOrder.contactEmail}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Preferred Collection Date:</strong></td>
                                                    <td>{formatDate(selectedOrder.preferredCollectionDate)}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Revenue Generated:</strong></td>
                                                    <td style={{ color: 'green' }}>£{selectedOrder.grandTotal}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Status:</strong></td>
                                                    <td style={{ color: 'red' }}>{selectedOrder.status}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Purchased On:</strong></td>
                                                    <td>{formatDate(selectedOrder.createdAt)}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Status Update Section */}
                                        <div className="mb-3">
                                            <label htmlFor="statusSelect" className="form-label"><strong>Update Status:</strong></label>
                                            <select
                                                id="statusSelect"
                                                className="form-select"
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                            >
                                                <option value="">Select New Status</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Shipment Has Left the Dock">Shipment Has Left the Dock</option>
                                                <option value="Shipment Has Landed in Ghana">Shipment Has Landed in Ghana</option>
                                                <option value="Shipment Delivered">Shipment Delivered</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <p>No order selected or details unavailable.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => handleUpdateStatus(selectedOrder?._id)}>Update Status</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Orders;