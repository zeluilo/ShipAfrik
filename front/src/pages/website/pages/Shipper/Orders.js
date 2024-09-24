import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import { toast } from 'react-toastify';

const Orders = () => {
    const { currentUser } = useAuth();

    useEffect(() => {
        console.log('Order User Details:', currentUser);
    }, [currentUser]);

    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrderId] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [combinedData, setCombinedData] = useState([]);

    // Sorting, filtering, and pagination states
    const [sortOrderInProgress, setSortOrderInProgress] = useState('orderRefAsc');
    const [filterServiceType, setFilterServiceType] = useState('');
    const [filterPlannedDate, setFilterPlannedDate] = useState('');
    const [filterPickupLocation, setFilterPickupLocation] = useState('');
    const [filterRevenueRange, setFilterRevenueRange] = useState([0, 10000]); // Example range

    const [sortOrderShipped, setSortOrderShipped] = useState('orderRefAsc');

    // Pagination state
    const [currentPageInProgress, setCurrentPageInProgress] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page

    const [currentPageShipped, setCurrentPageShipped] = useState(1);

    const handleViewOrders = (order) => {
        setSelectedOrderId(order);
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/shipafrik/orders/${currentUser}`);
            console.log('Fetched Orders:', response.data.orders);

            const ordersWithShipments = await Promise.all(
                response.data.orders.map(async (order) => {
                    const shipmentResponse = await axios.get(`http://localhost:3001/shipafrik/get-shipment/${order.shipmentId}`);
                    return {
                        ...order,
                        shipment: shipmentResponse.data, // Assuming the shipment details are returned as an array
                    };
                })
            );
            console.log('Fetched Orders with Shipments:', ordersWithShipments);

            setOrders(ordersWithShipments);
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
            await axios.put(`http://localhost:3001/shipafrik/orders/${orderId}/status`, { status: newStatus });
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

    const filteredOrders = Array.isArray(orders)
        ? orders.filter(order =>
            order.orderReference.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];

    // Separate orders by status: In Progress and Shipped
    const inProgressOrders = filteredOrders.filter(order => order.status === 'In Progress');
    const shippedOrders = filteredOrders.filter(order =>
        order.status === 'Shipped' ||
        order.status === 'Shipment Has Left the Dock' ||
        order.status === 'Shipment Has Landed in Ghana' ||
        order.status === 'Shipment Delivered'
    );

    // Sort In Progress Orders
    const sortInProgressOrders = (orders) => {
        const sortedOrders = [...orders];
        switch (sortOrderInProgress) {
            case 'orderRefAsc':
                return sortedOrders.sort((a, b) => a.orderReference.localeCompare(b.orderReference));
            case 'orderRefDesc':
                return sortedOrders.sort((a, b) => b.orderReference.localeCompare(a.orderReference));
            case 'serviceType':
                return sortedOrders.sort((a, b) => a.serviceType.localeCompare(b.serviceType));
            case 'plannedDateAsc':
                return sortedOrders.sort((a, b) => new Date(a.preferredCollectionDate) - new Date(b.preferredCollectionDate));
            case 'plannedDateDesc':
                return sortedOrders.sort((a, b) => new Date(b.preferredCollectionDate) - new Date(a.preferredCollectionDate));
            case 'revenueAsc':
                return sortedOrders.sort((a, b) => a.grandTotal - b.grandTotal);
            case 'revenueDesc':
                return sortedOrders.sort((a, b) => b.grandTotal - a.grandTotal);
            default:
                return sortedOrders;
        }
    };

    // Sort Shipped Orders
    const sortShippedOrders = (orders) => {
        const sortedOrders = [...orders];
        switch (sortOrderShipped) {
            case 'orderRefAsc':
                return sortedOrders.sort((a, b) => a.orderReference.localeCompare(b.orderReference));
            case 'orderRefDesc':
                return sortedOrders.sort((a, b) => b.orderReference.localeCompare(a.orderReference));
            case 'departureDateAsc':
                return sortedOrders.sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate));
            case 'departureDateDesc':
                return sortedOrders.sort((a, b) => new Date(b.departureDate) - new Date(a.departureDate));
            case 'estimatedArrivalAsc':
                return sortedOrders.sort((a, b) => new Date(a.estimatedArrival) - new Date(b.estimatedArrival));
            case 'estimatedArrivalDesc':
                return sortedOrders.sort((a, b) => new Date(b.estimatedArrival) - new Date(a.estimatedArrival));
            case 'actualArrivalAsc':
                return sortedOrders.sort((a, b) => new Date(a.actualArrival) - new Date(b.actualArrival));
            case 'actualArrivalDesc':
                return sortedOrders.sort((a, b) => new Date(b.actualArrival) - new Date(a.actualArrival));
            case 'revenueGeneratedAsc':
                return sortedOrders.sort((a, b) => a.grandTotal - b.grandTotal);
            case 'revenueGeneratedDesc':
                return sortedOrders.sort((a, b) => b.grandTotal - a.grandTotal);
            default:
                return sortedOrders;
        }
    };

    // Filter In Progress Orders
    const filteredInProgressOrders = inProgressOrders.filter(order => {
        const isServiceTypeMatch = filterServiceType ? order.quotes[0].serviceType === filterServiceType : true;
        const isPlannedDateMatch = filterPlannedDate ? new Date(order.preferredCollectionDate) >= new Date(filterPlannedDate) : true;
        const isPickupLocationMatch = filterPickupLocation ? order.pickupAddress.includes(filterPickupLocation) : true;
        const isRevenueMatch = order.grandTotal >= filterRevenueRange[0] && order.grandTotal <= filterRevenueRange[1];

        return isServiceTypeMatch && isPlannedDateMatch && isPickupLocationMatch && isRevenueMatch;
    });

    const filteredShippedOrders = shippedOrders; // You can apply similar filtering for shipped orders as needed

    const sortedInProgressOrders = sortInProgressOrders(filteredInProgressOrders);
    const sortedShippedOrders = sortShippedOrders(filteredShippedOrders);

    const inProgressCount = sortedInProgressOrders.length;
    const shippedCount = sortedShippedOrders.length;

    // Pagination logic for In Progress Orders
    const indexOfLastInProgressOrder = currentPageInProgress * itemsPerPage;
    const indexOfFirstInProgressOrder = indexOfLastInProgressOrder - itemsPerPage;
    const currentInProgressOrders = sortedInProgressOrders.slice(indexOfFirstInProgressOrder, indexOfLastInProgressOrder);

    // Pagination logic for Shipped Orders
    const indexOfLastShippedOrder = currentPageShipped * itemsPerPage;
    const indexOfFirstShippedOrder = indexOfLastShippedOrder - itemsPerPage;
    const currentShippedOrders = sortedShippedOrders.slice(indexOfFirstShippedOrder, indexOfLastShippedOrder);

    const totalPagesInProgress = Math.ceil(sortedInProgressOrders.length / itemsPerPage);
    const totalPagesShipped = Math.ceil(sortedShippedOrders.length / itemsPerPage);

    const totalRevenue = orders.reduce((accumulator, order) => {
        return accumulator + (order.grandTotal || 0);
    }, 0);

    const handlePageChangeInProgress = (pageNumber) => {
        setCurrentPageInProgress(pageNumber);
    };

    const handlePageChangeShipped = (pageNumber) => {
        setCurrentPageShipped(pageNumber);
    };

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
                            <span className="text-muted small">Shipped Orders</span>
                        </div>
                        <div className="text-center flex-fill border rounded p-2 m-1">
                            <h6>£{totalRevenue}</h6>
                            <span className="text-muted small">Revenue</span>
                        </div>
                        <div className="text-center flex-fill border rounded p-2 m-1">
                            <h6>£{totalRevenue}</h6>
                            <span className="text-muted small">Avg Customer Rating</span>
                        </div>
                    </div>

                    {/* In Progress Orders Table */}
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="card-body pt-3">
                                <h5 className="card-title text-start">In Progress Orders</h5>

                                {/* Search Bar */}
                                <div className="row align-items-end justify-content-end">

                                    <div className="col-sm-3 d-flex align-items-center my-3">
                                        <i className="bi bi-search me-2" style={{ fontSize: '1.2em', color: '#007bff' }}></i>
                                        <input type="text" placeholder="Search by Order Reference" value={searchTerm} onChange={handleSearch} className="form-control" />
                                    </div>
                                </div>

                                {/* Filter and Sort Options */}
                                <div className="row mb-3 align-items-end justify-content-end">
                                    <div className="col-sm-6 d-flex align-items-center">
                                        <label htmlFor="sortBy" className="col-form-label me-2">Sort By:</label>
                                        <i className="bi bi-arrow-down-up me-2" style={{ fontSize: '1.2em', color: '#007bff' }}></i>
                                        <select
                                            id="sortBy"
                                            className='form-control w-50'
                                            value={sortOrderInProgress}
                                            onChange={(e) => setSortOrderInProgress(e.target.value)}
                                        >
                                            <option value="orderRefAsc">Order Reference (A to Z)</option>
                                            <option value="orderRefDesc">Order Reference (Z to A)</option>
                                            <option value="plannedDateAsc">Planned Date (Earliest to Latest)</option>
                                            <option value="plannedDateDesc">Planned Date (Latest to Earliest)</option>
                                            <option value="revenueAsc">Revenue (Low to High)</option>
                                            <option value="revenueDesc">Revenue (High to Low)</option>

                                        </select>
                                    </div>

                                    <div className="col-sm-6 d-flex align-items-center">
                                        <label htmlFor="serviceType" className="col-form-label me-2">Service Type:</label>
                                        <i className="bi bi-tags me-2" style={{ fontSize: '1.2em', color: '#007bff' }}></i>
                                        <select
                                            id="serviceType"
                                            className='form-control w-50'
                                            value={filterServiceType}
                                            onChange={(e) => setFilterServiceType(e.target.value)}
                                        >
                                            <option value="">All</option>
                                            <option value="Warehouse to Door">Warehouse to Door</option>
                                            <option value="Door to Door">Door to Door</option>
                                        </select>
                                    </div>
                                </div>


                                <table className="table table-hover table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Order Reference</th>
                                            <th>Customer Name</th>
                                            <th>Type of Service</th>
                                            <th>Planned Date</th>
                                            <th>Pick up Location</th>
                                            <th>Revenue Generated</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentInProgressOrders.map((order) => (
                                            <tr key={order._id}>
                                                <td>{order.orderReference}</td>
                                                <td>{order.customerName}</td>
                                                <td>{order.quotes[0].serviceType}</td>
                                                <td>{formatDate(order.preferredCollectionDate)}</td>
                                                <td>{order.pickupAddress}</td>
                                                <td>£{order.grandTotal}</td>
                                                <td>
                                                    <i
                                                        type="button"
                                                        className='bi bi-eye-fill'
                                                        style={{ color: 'blue' }}
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#viewOrders"
                                                        onClick={() => handleViewOrders(order)}
                                                    ></i>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination Controls for In Progress Orders */}
                                <nav aria-label="In Progress Orders Pagination">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPageInProgress === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChangeInProgress(currentPageInProgress - 1)}>&laquo; Previous</button>
                                        </li>
                                        {Array.from({ length: totalPagesInProgress }, (_, index) => (
                                            <li className={`page-item ${currentPageInProgress === index + 1 ? 'active' : ''}`} key={index}>
                                                <button className="page-link" onClick={() => handlePageChangeInProgress(index + 1)}>{index + 1}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPageInProgress === totalPagesInProgress ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChangeInProgress(currentPageInProgress + 1)}>Next &raquo;</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Shipped Orders Table */}
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="card-body pt-3">
                                <h5 className="card-title text-start">Shipped Orders</h5>

                                {/* Sort Options */}
                                <div className="row mb-3 align-items-end justify-content-end">
                                    <div className="col-sm-12 d-flex align-items-center">
                                        <label htmlFor="sortBy" className="col-form-label me-2">Sort By:</label>
                                        <i className="bi bi-arrow-down-up me-2" style={{ fontSize: '1.2em', color: '#007bff' }}></i>
                                        <select className='form-control w-25' value={sortOrderShipped} onChange={(e) => setSortOrderShipped(e.target.value)}>
                                            <option value="orderRefAsc">Order Reference (A to Z)</option>
                                            <option value="orderRefDesc">Order Reference (Z to A)</option>
                                            <option value="departureDateAsc">Departure Date (Earliest to Latest)</option>
                                            <option value="departureDateDesc">Departure Date (Latest to Earliest)</option>
                                            <option value="estimatedArrivalAsc">Estimated Arrival (Earliest to Latest)</option>
                                            <option value="estimatedArrivalDesc">Estimated Arrival (Latest to Earliest)</option>
                                            <option value="actualArrivalAsc">Actual Arrival (Earliest to Latest)</option>
                                            <option value="actualArrivalDesc">Actual Arrival (Latest to Earliest)</option>
                                            <option value="revenueGeneratedAsc">Revenue Generated (Low to High)</option>
                                            <option value="revenueGeneratedDesc">Revenue Generated (High to Low)</option>

                                        </select>
                                    </div>
                                </div>

                                <table className="table table-hover table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Order Reference</th>
                                            <th>Bill Of Landing</th>
                                            <th>Date of Departure</th>
                                            <th>Estimated Arrival at Port</th>
                                            <th>Actual Arrival at Door</th>
                                            <th>Revenue Generated</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentShippedOrders.length > 0 ? (
                                            currentShippedOrders.map((order) => (
                                                <tr key={order._id}>
                                                    <td>{order.orderReference}</td>
                                                    <td>1111</td>
                                                    <td>{formatDate(order.shipment.estimatedVesselDepartureDate)}</td>
                                                    <td>{formatDate(order.shipment.estimatedArrivalDate)}</td>
                                                    <td>{formatDate(order.quotes[0].arriveBy)}</td>

                                                    <td>£{order.grandTotal}</td>

                                                    <td>
                                                        <i
                                                            type="button"
                                                            className='bi bi-eye-fill'
                                                            style={{ color: 'blue' }}
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#viewShipmentDetails"
                                                            onClick={() => handleViewOrders(order)}
                                                        ></i>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6">No Shipped orders found</td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>

                                {/* Pagination Controls for Shipped Orders */}
                                <nav aria-label="Shipped Orders Pagination">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPageShipped === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChangeShipped(currentPageShipped - 1)}>&laquo; Previous</button>
                                        </li>
                                        {Array.from({ length: totalPagesShipped }, (_, index) => (
                                            <li className={`page-item ${currentPageShipped === index + 1 ? 'active' : ''}`} key={index}>
                                                <button className="page-link" onClick={() => handlePageChangeShipped(index + 1)}>{index + 1}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPageShipped === totalPagesShipped ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChangeShipped(currentPageShipped + 1)}>Next &raquo;</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="viewOrders" tabIndex="-1" aria-labelledby="viewShipmentLabel" aria-hidden="true">
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

                                        {/* Additional Details for Shipped Status */}
                                        {["Shipped", "Shipment Has Left the Dock", "Shipment Has Landed in Ghana", "Shipment Delivered"].includes(selectedOrder.status) && (
                                            <>
                                            <label htmlFor="statusSelect" className="form-label"><strong>Shipment Detaiks</strong></label>
                                            <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <td><strong>Estimated Arrival Date:</strong></td>
                                                            <td>{formatDate(selectedOrder.shipment.estimatedArrivalDate)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Estimated Vessel Departure Date:</strong></td>
                                                            <td>{formatDate(selectedOrder.shipment.estimatedVesselDepartureDate)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Pickup Radius:</strong></td>
                                                            <td>{selectedOrder.shipment.pickupRadius}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Destination Port:</strong></td>
                                                            <td>{selectedOrder.shipment.destinationPort}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                </>
                                        )}


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
};

export default Orders;
