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

// Route to update an existing shipment
router.put('/update-shipment/:id', async (req, res) => {
  console.log('Received request to update a shipment');
  try {
      const { id } = req.params;
      const {
          estimatedVesselDepartureDate,
          destinationPort,
          estimatedArrivalDate,
          warehousePostcode,
          doorToDoorFee,
          pickupRadius,
          boxSizes,
          datePosted,
          availableCollectionDays
      } = req.body;

      // Log the incoming request
      console.log('Update shipment request received:', req.body);

      // Find the shipment by ID and update it
      const updatedShipment = await Shipment.findByIdAndUpdate(
          id,
          {
              estimatedVesselDepartureDate,
              destinationPort,
              estimatedArrivalDate,
              warehousePostcode,
              doorToDoorFee,
              pickupRadius,
              boxSizes,
              datePosted,
              availableCollectionDays
          },
          { new: true } // Return the updated document
      );

      if (!updatedShipment) {
          return res.status(404).json({ message: 'Shipment not found' });
      }

      // Log successful shipment update
      console.log('Shipment updated successfully:', updatedShipment);

      res.status(200).json({
          message: 'Shipment updated successfully',
          shipment: updatedShipment
      });
  } catch (error) {
      console.error('Error updating shipment:', error.message);
      res.status(400).json({ message: 'Error updating shipment', error: error.message });
  }
});

// GET shipments by userId
router.get('/shipments/:userId', async (req, res) => {
    console.log('Fetching shipments for user ID'); // Log the user 
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

// GET shipments by id for a particular user
router.get('/shipment/:userId/:id', async (req, res) => {
  console.log('Fetching shipment details'); // Log the request
  try {
      const { userId, id } = req.params;
      console.log('Fetching shipment for user ID:', userId, 'and shipment ID:', id); // Log the user ID and shipment ID
      
      // Validate userId format (example: check if it's a valid ObjectId)
      if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
          return res.status(400).json({ message: 'Invalid user ID format.' });
      }

      // Validate id format (example: check if it's a valid ObjectId)
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
          return res.status(400).json({ message: 'Invalid shipment ID format.' });
      }

      // Fetch shipment where userId and id match the provided values
      const shipment = await Shipment.findOne({ _id: id, userId });

      // If no shipment is found
      if (!shipment) {
          return res.status(404).json({ message: 'Shipment not found for the given user ID and shipment ID.' });
      }

      // Return shipment
      res.json(shipment);
  } catch (error) {
      console.error('Error fetching shipment:', error.message); // Log the error for debugging
      res.status(500).json({ message: 'Error fetching shipment', error: error.message });
  }
});

// DELETE shipments by id
router.delete('/delete-shipment/:id', async (req, res) => {
  try {
      const { id } = req.params;
      console.log('Received request to delete shipment with ID:', id);
      const deletedShipment = await Shipment.findByIdAndDelete(id); // Assuming Shipment is your Mongoose model
      if (!deletedShipment) {
          return res.status(404).json({ message: 'Shipment not found' });
      }
      res.status(200).json({ message: 'Shipment deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting shipment', error });
  }
});

module.exports = router;
