import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuotesTable = ({
  shipments,
  selectedShipment,
  showDetails,
  handleViewShipmentDetails,
  // handleBuyNow,
  quotes,
  formatDateToWords
}) => {
  const navigate = useNavigate();

  const handleBuyNow = (serviceType, totalCost, highestCosts, doorFee) => {
    const newQuote = {
      serviceType,
      totalCost,
      highestCosts,
      doorFee
    };
    // console.log('New quote:', newQuote);

    window.scrollTo(0, 0);
    navigate('/order-summary', { state: { selectedShipment, newQuote } });
  };

  const separateQuotesByServiceType = (quoteFormData) => {
    const separatedQuotes = [];

    // Loop through each service type and create a separate quote for each
    quoteFormData.serviceType.forEach((service) => {
      const newQuote = {
        ...quoteFormData, // Spread the original data
        serviceType: service, // Overwrite serviceType with the current service in the loop
      };
      separatedQuotes.push(newQuote); // Add new quote to the array
    });

    return separatedQuotes;
  };

  // Separate quotes based on service type
  const separatedQuotes = separateQuotesByServiceType(quotes);
  console.log('Separated Quotes: ', separatedQuotes)
  console.log('Sent Quotes: ', quotes)
  console.log('Generated Shipments: ', shipments)

  // Function to calculate the weight-based cost
  const calculateWeightCost = (item, shipment) => {
    const weight = Number(item.weight); // Ensure the weight is converted to a number
    const price = Number(shipment.price); // Ensure the price is a number
    const fragileFee = item.fragile === 'Yes' ? Number(shipment.fragileFee) : 0.0; // Ensure fragileFee is a number

    return (weight * price) + fragileFee;
  };

  // Function to calculate the size-based cost
  const calculateSizeCost = (item, shipment) => {
    const length = Number(item.length); // Ensure length is a number
    const width = Number(item.width);   // Ensure width is a number
    const height = Number(item.height); // Ensure height is a number
    const volumetricWeightDivider = Number(shipment.volumetricWeightDivider); // Ensure the volumetric divider is a number
    const fragileFee = item.fragile === 'Yes' ? Number(shipment.fragileFee) : 0.0; // Ensure fragileFee is a number

    return ((length * width * height)/volumetricWeightDivider) + fragileFee;
  };

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
          // Calculate the highest costs for each item
          const highestCosts = separatedQuotes[index].items.map(item => {
            const weightCost = Number(calculateWeightCost(item, shipment));
            const sizeCost = Number(calculateSizeCost(item, shipment));
            
            // Return the higher cost for the item
            return Math.max(weightCost, sizeCost);
          });

          // Calculate the total of all highest costs
          const totalHighestCost = highestCosts.reduce((acc, curr) => acc + curr, 0);

          // Calculate the Door to Door Fee
          const doorFee = (separatedQuotes[index]?.serviceType === 'Door to Door' ? Number(shipment.doorToDoorFee) : 0);

          // Calculate the total cost
          const totalCost = totalHighestCost + doorFee;

          // Log calculated values for debugging
          console.log('Highest Costs for all items:', highestCosts);
          console.log('Total Highest Cost:', totalHighestCost);
          console.log('Door to Door Fee:', doorFee);
          console.log('Total Cost:', totalCost);

        return (
          <React.Fragment key={shipment._id}>
            <tr>
              <td>{`Shipping Agent ${(index + 1)}`}</td>
              <td>{shipment.estimatedArrivalDate ? formatDateToWords(shipment.estimatedArrivalDate) : 'N/A'}</td>
              <td>
                {separatedQuotes[index]?.serviceType || 'N/A'}
              </td>
              <td>£{totalCost.toFixed(2)}</td>
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
                          <span style={{ fontSize: '24px', fontWeight: 'bold' }} className="ms-2">£{totalCost.toFixed(2)}</span>
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

                            {/* Additional Details */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                              <div style={{ flex: '1', marginRight: '10px' }}>
                                <p><strong>Warehouse Postcode:</strong></p>
                                <p style={{ fontSize: '16px', color: '#555' }}>
                                  {shipment.warehousePostcode || '-'}
                                </p>
                              </div>
                              <div style={{ flex: '1', marginRight: '10px' }}>
                                <p><strong>Door-to-Door Fee (per order):</strong></p>
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

                            {/* Box Sizes and Pricing Table */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                              <div style={{ flex: '1', marginRight: '10px' }}>
                                <p><strong>Price (per kg):</strong></p>
                                <p style={{ fontSize: '16px', color: '#555' }}>
                                  £{shipment.price || '-'}
                                </p>
                              </div>
                              <div style={{ flex: '1', marginRight: '10px' }}>
                                <p><strong>Fragile Fee (per item):</strong></p>
                                <p style={{ fontSize: '16px', color: '#555' }}>
                                  £{shipment.fragileFee || '-'}
                                </p>
                              </div>
                              <div style={{ flex: '1', marginRight: '10px' }}>
                                <p><strong>Volumetric Weight Divider:</strong></p>
                                <p style={{ fontSize: '16px', color: '#555' }}>
                                  {shipment.volumetricWeightDivider || '-'}
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
                         <table className="table table-bordered table-sm" style={{ maxWidth: '80%', margin: '0 auto' }}>
                            <tbody>
                              {/* <tr>
                                <th>Quote: Weight</th>
                                {separatedQuotes[index].items.map((item, itemIndex) => (
                                  <td key={`weight-${itemIndex}`}>
                                    £{calculateWeightCost(item, shipment)}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <th></th>
                                {separatedQuotes[index].items.map((item, itemIndex) => (
                                  <th key={`item-${itemIndex}`}>{`Item ${itemIndex + 1}`}</th>
                                ))}
                              </tr>
                              <tr>
                                <th>Quote: Size</th>
                                {separatedQuotes[index].items.map((item, itemIndex) => (
                                  <td key={`size-${itemIndex}`}>
                                    £{calculateSizeCost(item, shipment)}
                                  </td>
                                ))}
                              </tr> */}
                              <tr>
                                <th></th>
                                {separatedQuotes[index].items.map((item, itemIndex) => (
                                  <th key={`item-${itemIndex}`}>{`Item ${itemIndex + 1}`}</th>
                                ))}
                                <th>Total Costs</th>
                              </tr>
                              <tr>
                                <th>{separatedQuotes[index]?.serviceType} Fee: £{doorFee.toFixed(2)}</th>
                                {highestCosts.map((price, idx) => (
                                  <td key={idx}>£{price}</td>
                                ))}
                                <td style={{ backgroundColor: 'green', color: 'white' }}>
                                  £{totalCost.toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>

                      <td colSpan="3">
                        <div className="my-4">
                          <button className="btn btn-outline-secondary w-50" 
                            onClick={() => handleBuyNow(
                              separatedQuotes[index]?.serviceType || 'N/A', // Service Type
                              totalCost,
                              highestCosts,
                              doorFee
                            )}
                            style={{ fontSize: '18px', padding: '12px 24px' }}
                          >                          
                            BUY NOW
                          </button>
                          </div>
                        </td>
                      </tbody>
                      
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
