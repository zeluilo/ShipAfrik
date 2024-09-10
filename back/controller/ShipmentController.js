const express = require('express');
const router = express.Router();
const Shipment = require('../model/Shipment'); // Adjust the path if necessary

// Route to create a new shipment
router.post('/create-shipment', async (req, res) => {
    console.log('Received request to create a new shipment');
  try {
    const {
      estimatedVesselDepartureDate,
      destinationPort,
      estimatedArrivalDate,
      warehousePostcode,
      doorToDoorFee,
      pickupRadius,
      boxSizes,
      status,
      userId,
      availableCollectionDays
    } = req.body;

    // Log the incoming request
    console.log('Create shipment request received:', req.body);

    // Create a new shipment
    const newShipment = new Shipment({
      estimatedVesselDepartureDate,
      destinationPort,
      estimatedArrivalDate,
      warehousePostcode,
      doorToDoorFee,
      pickupRadius,
      boxSizes,
      status,
      userId,
      availableCollectionDays
    });

    // Save the shipment to the database
    await newShipment.save();

    // Log successful shipment creation
    console.log('Shipment created successfully:', newShipment._id);

    res.status(201).json({
      message: 'Shipment created successfully',
      shipment: newShipment
    });
  } catch (error) {
    console.error('Error creating shipment:', error.message);
    res.status(400).json({ message: 'Error creating shipment', error: error.message });
  }
});

// GET shipments by userId
router.get('/shipments/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching shipments for user ID:', userId); // Log the user 
        // Validate userId format (example: check if it's a valid ObjectId)
        if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        // Fetch shipments where userId matches the provided userId
        const shipments = await Shipment.find({userId});

        // If no shipments are found
        if (shipments.length === 0) {
            return res.status(404).json({ message: 'No shipments found for the given user ID.' });
        }

        // Return shipments
        res.json(shipments);
    } catch (error) {
        console.error('Error fetching shipments:', error.message); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching shipments', error: error.message });
    }
});

module.exports = router;
