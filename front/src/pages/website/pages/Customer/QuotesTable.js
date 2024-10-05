import React from 'react';

const QuotesTable = ({
  shipments,
  selectedShipment,
  showDetails,
  handleViewShipmentDetails,
  handleBuyNow,
  quotes,
  formatDateToWords
}) => {
  return (
    <table className="table table-bordered mt-3">
      <thead className="table-secondary">
        <tr>
          <th>Shipping Agent</th>
          <th>Estimated Arrival Date</th>
          <th>Type of Service</th>
          <th>Total Price</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {shipments.map((shipment, index) => {
          // Calculate total price
          const boxPrices = shipment.boxSizes.map(box => {
            const quoteSizes = Array.isArray(quotes) ? quotes.map(q => q.boxSizes).flat() : quotes.boxSizes || [];
            const boxInQuote = quoteSizes.find(b => b.size === box.size);
            const requestedQuantity = boxInQuote ? boxInQuote.quantity : 0;
            const boxPrice = parseFloat(box.price) || 0; // Ensure price is a number
            return boxPrice * requestedQuantity; // Calculate total price for each box
          });

          const totalPrice = boxPrices.reduce((acc, price) => acc + price, 0) + (parseFloat(shipment.doorToDoorFee) || 0); // Total price with door-to-door fee

          return (
            <React.Fragment key={shipment._id}>
              <tr>
                <td>{`Shipping Agent ${(index + 1)}`}</td>
                <td>{shipment.estimatedArrivalDate ? formatDateToWords(shipment.estimatedArrivalDate) : 'N/A'}</td>
                <td>{quotes.serviceType.map((service, index) => (
                  <div>{service}</div>
                )
                )}
                </td>
                <td>£{totalPrice.toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => handleViewShipmentDetails(shipment)}
                  >
                    {selectedShipment === shipment._id ? 'Hide details' : 'Show details'}
                  </button>
                </td>
              </tr>
              {selectedShipment === shipment._id && showDetails && (
                <tr>
                  <td colSpan="12">
                    <table className="table table-borderless table-sm" style={{ border: '2px solid black', width: '100%' }}>
                      <tbody>
                        <tr>
                          <td className="text-start p-2 m-2">
                            <i className="bi bi-check-circle-fill" style={{ color: 'green', fontSize: '36px' }}></i>
                            <span style={{ fontSize: '24px', fontWeight: 'bold' }} className="ms-2">Shipment Overview</span>
                          </td>
                          <td className="text-end p-3 m-2">
                            <span style={{ fontSize: '24px', fontWeight: 'bold' }} className="ms-2">£{totalPrice.toFixed(2)}</span>
                          </td>
                        </tr>
                        

                        {/* Shipment Details */}
                        <tr>
                          <td colSpan="3">
                            <div className="shipment-details">
                              <h5 style={{ fontWeight: 'bold', marginBottom: '10px', textDecoration: 'underline' }}>Shipment Details</h5>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ flex: '1', marginRight: '10px' }}>
                                  <p><strong>Estimated Vessel Departure:</strong></p>
                                  <p style={{ fontSize: '16px', color: '#555' }}>
                                    {shipment.estimatedVesselDepartureDate ? new Date(shipment.estimatedVesselDepartureDate).toLocaleDateString() : '-'}
                                  </p>
                                </div>
                                <div style={{ flex: '1', marginRight: '10px' }}>
                                  <p><strong>Estimated Arrival Date:</strong></p>
                                  <p style={{ fontSize: '16px', color: '#555' }}>
                                    {shipment.estimatedArrivalDate ? new Date(shipment.estimatedArrivalDate).toLocaleDateString() : '-'}
                                  </p>
                                </div>
                                <div style={{ flex: '1', marginRight: '10px' }}>
                                  <p><strong>Destination Port:</strong></p>
                                  <p style={{ fontSize: '16px', color: '#555' }}>
                                    {shipment.destinationPort || '-'}
                                  </p>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ flex: '1', marginRight: '10px' }}>
                                  <p><strong>Warehouse Postcode:</strong></p>
                                  <p style={{ fontSize: '16px', color: '#555' }}>
                                    {shipment.warehousePostcode || '-'}
                                  </p>
                                </div>
                                <div style={{ flex: '1', marginRight: '10px' }}>
                                  <p><strong>Door-to-Door Fee:</strong></p>
                                  <p style={{ fontSize: '16px', color: '#555' }}>
                                    £{shipment.doorToDoorFee || '-'}
                                  </p>
                                </div>
                                <div style={{ flex: '1', marginRight: '10px' }}>
                                  <p><strong>Pickup Radius:</strong></p>
                                  <p style={{ fontSize: '16px', color: '#555' }}>
                                    {shipment.pickupRadius || '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Box Sizes and Pricing Table */}
                        <tr>
                          <td colSpan="3">
                            <h5 style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>Package Sizes & Pricing</h5>
                            <p style={{ textAlign: 'center', fontSize: '14px', color: '#555' }}>Available package sizes and prices below.</p>
                            <table className="table table-bordered table-sm" style={{ maxWidth: '80%', margin: '0 auto' }}>
                              <thead>
                                <tr>
                                  <th>Size</th>
                                  <th>Price (£)</th>
                                  <th>Quantity Available</th>
                                  <th>Requested Quantity</th>
                                </tr>
                              </thead>
                              <tbody>
                                {shipment.boxSizes.map(box => {
                                  const quoteSizes = Array.isArray(quotes) ? quotes.map(q => q.boxSizes).flat() : quotes.boxSizes || [];
                                  const boxInQuote = quoteSizes.find(b => b.size === box.size);
                                  const requestedQuantity = boxInQuote ? boxInQuote.quantity : 0;
                                  return (
                                    <tr key={box._id}>
                                      <td>{box.size || '-'}</td>
                                      <td>{box.price || '-'}</td>
                                      <td>{box.quantity || '-'}</td>
                                      <td>{requestedQuantity || '-'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </td>
                        </tr>

                      </tbody>
                      <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                            <button className="btn btn-outline-secondary w-50" onClick={handleBuyNow} style={{ fontSize: '18px', padding: '12px 24px' }}>
                              BUY NOW
                            </button>
                          </div>
                    </table>
                    
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default QuotesTable;
