import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { ip } from '../../../constants';

const QuotesTable = ({
  shipments,
  // selectedShipment,
  // showDetails,
  // handleViewShipmentDetails,
  // handleBuyNow,
  quotes,
  formatDateToWords
}) => {
  const navigate = useNavigate();
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [separateShipment, setSeparateShipment] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleBuyNow = (shipment, totalCost, highestCosts, doorFee) => {
    const newQuote = {
      shipment,
      totalCost,
      highestCosts,
      doorFee
    };
    // console.log('New quote:', newQuote);

    window.scrollTo(0, 0);
    navigate('/order-summary', { state: { selectedShipment: shipment._id, newQuote } });
  };

  const handleViewShipmentDetails = async (shipment) => {
    setSelectedShipment(null);

    try {
      const response = await axios.get(`${ip}/shipafrik/get-shipment/${shipment._id}`);
      const shipmentDetails = response.data;
      // console.log('Shipment Details:', shipmentDetails);
      console.log('Shipment Received:', shipment);
      console.log('Selected Shipment123:', selectedShipment);
      // Toggle details visibility based on current state
      if (selectedShipment === shipment.id) {
        setSelectedShipment(null);
        setShowDetails(false);
      } else {
        setSelectedShipment(null);
        setSelectedShipment(shipment.id);
        setShowDetails(true);
      }
      // console.log('Selected Shipment:', shipmentDetails);
    } catch (error) {
      // console.error('Error fetching shipment details:', error);
      // Handle the error (e.g., show an error message)
    }
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

  const separateShipmentsByServiceType = (shipments) => {
    const separatedShipments = [];

    shipments.forEach((shipment) => {
      // Loop over each serviceType in the shipment's serviceType array
      shipment.serviceType.forEach((service) => {
        const newShipment = {
          ...shipment, // Spread the original shipment data
          serviceType: service,  // Assign individual service type
          id: `${shipment._id}-${service}` // Create a unique identifier combining shipment ID and service type
        };

        // Add new shipment to the separated shipments array
        separatedShipments.push(newShipment);
      });
    });

    console.log('Separated Shipments: ', separatedShipments);

    return separatedShipments;
  };
  
  // Separate quotes based on service type
  // const separatedQuotes = separateQuotesByServiceType(quotes);
  const separatedShipments = separateShipmentsByServiceType(shipments);
  console.log('Sent Quotes: ', quotes)
  // console.log('Separated Quotes: ', separatedQuotes)
  console.log('Generated Shipments: ', shipments)
  console.log('Selected Shipment: ', selectedShipment)
  console.log('Show Details: ', showDetails)
  console.log('Separated Shipments: ', separatedShipments)

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

    return ((length * width * height) / volumetricWeightDivider) + fragileFee;
  };

  const validShipments = separatedShipments.filter(shipment => shipment.datePosted && shipment.withdraw === false);
  console.log('Valid Shipments: ', validShipments)


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
        {validShipments.length === 0 ? (
          <tr>
            <td colSpan="5">
              <h5 className="align-self-center" style={{ color: 'red' }}>No shipments found</h5>
            </td>
          </tr>
        ) : (
          validShipments.map((shipment, index) => {
            const highestCosts = quotes.items.map(item => {
              const weightCost = Number(calculateWeightCost(item, shipment));
              console.log('Weight Cost:', weightCost);
              const sizeCost = Number(calculateSizeCost(item, shipment));
              console.log('Size Cost:', sizeCost);
              return Math.max(weightCost, sizeCost);
            });
  
            const totalHighestCost = highestCosts.reduce((acc, curr) => acc + curr, 0);
            console.log('Total Highest Cost:', totalHighestCost);

            // Determine the doorFee based on the serviceType
            let doorFee = 0;
            if (quotes.serviceType.includes('Door to Door') && shipment.serviceType === 'Door to Door') {
              doorFee = Number(shipment.doorToDoorFee);
            } else if (quotes.serviceType.includes('Warehouse to Door') && shipment.serviceType === 'Warehouse to Door') {
              doorFee = Number(shipment.warehouseToDoorFee);
            } else {
              doorFee = 0;
            }

            const totalCost = totalHighestCost + doorFee;
  
            return (
              <React.Fragment key={`${shipment._id}-${index}`}>
                <tr>
                  <td>{`Shipping Agent ${index + 1}`}</td>
                  <td>{shipment.estimatedArrivalDate ? formatDateToWords(shipment.estimatedArrivalDate) : 'N/A'}</td>
                  <td>{shipment.serviceType || 'N/A'}</td>
                  <td>£{totalCost.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => handleViewShipmentDetails(shipment)}
                    >
                      {selectedShipment === shipment.id ? 'Hide details' : 'Show details'}
                    </button>
                  </td>
                </tr>
  
                {showDetails && selectedShipment === shipment.id && (
                  <tr>
                    <td colSpan="5">
                      <table className="table table-borderless table-sm" style={{ border: '2px solid black', width: '100%' }}>
                        <tbody>
                          <tr>
                            <td className="text-start p-2">
                              <i className="bi bi-check-circle-fill" style={{ color: 'green', fontSize: '36px' }}></i>
                              <span style={{ fontSize: '24px', fontWeight: 'bold' }} className="ms-2">Shipment Overview</span>
                            </td>
                            <td className="text-end p-2">
                              <span style={{ fontSize: '24px', fontWeight: 'bold' }} className="ms-2">£{totalCost.toFixed(2)}</span>
                            </td>
                          </tr>
  
                          <tr>
                            <td colSpan="3">
                              <div className="shipment-details">
                                <h5 style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Shipment Details</h5>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ flex: '1', marginRight: '10px' }}>
                                    <p><strong>Estimated Vessel Departure:</strong></p>
                                    <p style={{ color: '#555' }}>
                                      {shipment.estimatedVesselDepartureDate ? new Date(shipment.estimatedVesselDepartureDate).toLocaleDateString() : '-'}
                                    </p>
                                  </div>
                                  <div style={{ flex: '1', marginRight: '10px' }}>
                                    <p><strong>Estimated Arrival Date:</strong></p>
                                    <p style={{ color: '#555' }}>
                                      {shipment.estimatedArrivalDate ? new Date(shipment.estimatedArrivalDate).toLocaleDateString() : '-'}
                                    </p>
                                  </div>
                                  <div style={{ flex: '1', marginRight: '10px' }}>
                                    <p><strong>Destination Port:</strong></p>
                                    <p style={{ color: '#555' }}>{shipment.destinationPort || '-'}</p>
                                  </div>
                                </div>
  
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ flex: '1', marginRight: '10px' }}>
                                    <p><strong>Warehouse Postcode:</strong></p>
                                    <p style={{ color: '#555' }}>{shipment.warehousePostcode || '-'}</p>
                                    {/* <p><strong>Warehouse price:</strong></p>
                                    <p style={{ color: '#555' }}>{shipment.price || '-'}</p>
                                    <p><strong>Warehouse fragileFee:</strong></p>
                                    <p style={{ color: '#555' }}>{shipment.fragileFee || '-'}</p>
                                    <p><strong>Warehouse volumetricWeightDivider:</strong></p>
                                    <p style={{ color: '#555' }}>{shipment.volumetricWeightDivider || '-'}</p> */}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
  
                          {/* Box Sizes and Pricing */}
                          {/* <tr>
                            <td colSpan="3">
                              <h5 style={{ textAlign: 'center', fontWeight: 'bold' }}>Package Sizes & Pricing</h5>
                              <table className="table table-bordered table-sm" style={{ maxWidth: '80%', margin: '0 auto' }}>
                                <tbody>
                                  <tr>
                                    <th>Quote: Weight</th>
                                    {quotes.items.map((item, itemIndex) => (
                                      <td key={`weight-${itemIndex}`}>
                                        £{calculateWeightCost(item, shipment)}
                                      </td>
                                    ))}
                                  </tr>
                                  <tr>
                                    <th>Quote: Size</th>
                                    {quotes.items.map((item, itemIndex) => (
                                      <td key={`size-${itemIndex}`}>
                                        £{calculateSizeCost(item, shipment)}
                                      </td>
                                    ))}
                                  </tr>
                                  <tr>
                                    <th>{shipment.serviceType} Fee: £{doorFee.toFixed(2)}</th>
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
                          </tr> */}
  
                          <tr>
                            <td colSpan="3" className="text-center">
                              <button
                                className="btn btn-outline-secondary w-25 my-4"
                                style={{ fontSize: '18px', padding: '12px 20px' }}
                                onClick={() => handleBuyNow(
                                  shipment,
                                  totalCost,
                                  highestCosts,
                                  doorFee
                                )}
                              >
                                BUY NOW
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })
        )}
      </tbody>
    </table>
  );
  
};

export default QuotesTable;
