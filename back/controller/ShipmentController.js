const express = require('express');
const router = express.Router();
const Shipment = require('../model/Shipment'); // Adjust the path if necessary
const Quote = require('../model/Quote');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'princezel18@gmail.com',
      pass: 'alio oear rwrg rxei'
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });

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
            volumetricWeightDivider,
            price,
            fragileFee,    
            serviceType,      
            warehouseToDoorFee,         
            userId,
            availableCollectionDays,
            latestDropOffDate,
            withdraw
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
            volumetricWeightDivider,
            price,
            fragileFee, 
            serviceType,      
            warehouseToDoorFee,            
            userId,
            availableCollectionDays,
            latestDropOffDate,
            withdraw
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
            volumetricWeightDivider,
            price,
            fragileFee,      
            warehouseToDoorFee,
            serviceType,      
            datePosted,
            availableCollectionDays,
            latestDropOffDate,
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
                volumetricWeightDivider,
                price,
                fragileFee,
                serviceType,      
                warehouseToDoorFee,                
                datePosted,
                availableCollectionDays,
                latestDropOffDate
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

// GET all shipments
router.get('/shipments', async (req, res) => {
    try {
        // Fetch all shipments
        const shipments = await Shipment.find();

        // If no shipments are found
        if (shipments.length === 0) {
            return res.status(404).json({ message: 'No shipments found.' });
        }

        // Return shipments
        res.json(shipments);
    } catch (error) {
        console.error('Error fetching shipments:', error.message); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching shipments', error: error.message });
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
        const shipments = await Shipment.find({ userId });

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

// GET shipment by ID
router.get('/get-shipment/:id', async (req, res) => {
    console.log('Fetching shipment for ID'); // Log the request
    
    try {
        const { id } = req.params; // Get the shipment ID from the request parameters
        console.log('Fetching shipment for ID:', id); // Log the shipment ID
        
        // Validate shipment ID format (example: check if it's a valid ObjectId)
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ message: 'Invalid shipment ID format.' });
        }

        // Fetch the shipment where _id matches the provided ID
        const shipment = await Shipment.findById(id);

        // If no shipment is found
        if (!shipment) {
            return res.status(404).json({ message: 'No shipment found for the given ID.' });
        }

        // Return the shipment
        res.json(shipment);
    } catch (error) {
        console.error('Error fetching shipment:', error.message); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching shipment', error: error.message });
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

// Route to create a quote request
router.post('/create-quote', async (req, res) => {
    console.log('Received request to create a new quote');
    try {
        const {
            serviceType,
            pickupPostcode,
            destinationCity,
            collectBy,
            arriveBy,
            boxSizes,
            userId,
        } = req.body;

        // Log the incoming request
        console.log('Create quote request received:', req.body);

        // Create a new quote
        const newQuote = new Quote({
            serviceType,
            pickupPostcode,
            destinationCity,
            collectBy,
            arriveBy,
            boxSizes,
            userId,
        });

        // Save the quote to the database
        await newQuote.save();

        // Log successful quote creation
        console.log('Quote created successfully:', newQuote._id);

        res.status(201).json({
            message: 'Quote created successfully',
            quote: newQuote
        });
    } catch (error) {
        console.error('Error creating quote:', error.message);
        res.status(400).json({ message: 'Error creating quote', error: error.message });
    }
});

// GET shipments by userId
router.get('/quotes/:userId', async (req, res) => {
    console.log('Fetching quotes for user ID'); // Log the user 
    try {
        const { userId } = req.params;
        console.log('Fetching quotes for user ID:', userId); // Log the user 
        // Validate userId format (example: check if it's a valid ObjectId)
        if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        // Fetch quotes where userId matches the provided userId
        const quotes = await Quote.find({ userId });

        // If no quotes are found
        if (quotes.length === 0) {
            return res.status(404).json({ message: 'No quotes found for the given user ID.' });
        }

        // Return quotes
        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes:', error.message); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching quotes', error: error.message });
    }
});

// Update shipment withdrawal status
router.put('/update-shipment-withdraw/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Updating id: ', id)

        const shipment = await Shipment.findByIdAndUpdate(
            id,
            { withdraw: req.body.withdraw }, // Update only the withdraw field
            { new: true }
        );
        
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        res.json({ message: 'Withdraw status updated successfully', shipment });
    } catch (error) {
        res.status(500).json({ message: 'Error updating shipment withdraw status', error });
    }
});

router.post('/send-collection-notification', async (req, res) => {
    const { userEmail, shipperName, shipmentDetails, userFullName } = req.body;
    console.log('Receieved : ', req.body)
    // Construct the email content
    const mailOptions = {
      from: 'princezel18@gmail.com',
      to: userEmail,
      subject: `Your Shipment Has Been Collected!`,
      text: `Dear ${userFullName},
  
Congratulations! Your shipment has been collected by ${shipperName} and is now in transit. 

If you have any problems with this shipment, please don't hesitate to reach out to us.

We would love to hear from you! Rate your pickup experience here!

Shipment Details:
1. Order Reference: ${shipmentDetails.orderReference}
2. Description: ${shipmentDetails.description}

Thank you for choosing ShipAfrik!

Best regards,
HR Team
ShipAfrik`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Collection email sent successfully');
      res.status(200).json({ message: 'Collection notification email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send collection notification email' });
    }
  });
  

// Route to delete a quote
router.delete('/delete-quote/:id', async (req, res) => {
    console.log('Received request to delete a quote');
    try {
        const quoteId = req.params.id;

        // Find and delete the quote by ID
        const deletedQuote = await Quote.findByIdAndDelete(quoteId);

        if (!deletedQuote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        // Log successful deletion
        console.log('Quote deleted successfully:', quoteId);

        res.status(200).json({
            message: 'Quote deleted successfully',
            deletedQuote
        });
    } catch (error) {
        console.error('Error deleting quote:', error.message);
        res.status(400).json({ message: 'Error deleting quote', error: error.message });
    }
});

module.exports = router;
