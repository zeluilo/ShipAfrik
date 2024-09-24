const express = require('express');
const router = express.Router();
const { admin, db } = require('../database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const crypto = require('crypto');
const Order = require('../model/Order');
const Shipment = require('../model/Shipment');

function generateOrderReference() {
  // Get current timestamp, convert to base-36 and slice last 6 characters
  const timestampPart = Date.now().toString(36).slice(-6).toUpperCase();

  // Generate random alphanumeric string of 6 characters
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Combine both parts for a unique order reference
  return `${timestampPart}${randomPart}`;
}


function formatDate(date) {
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'UTC'
  };
  return date.toLocaleDateString('en-US', options);
}

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

const scheduleEmail = (userEmail, endDate, formattedContractEnd, planName, userFullName) => {
  const reminderDate = new Date(endDate);
  reminderDate.setDate(reminderDate.getDate() - 7);

  cron.schedule(`0 0 * * *`, async () => {
    const currentDate = new Date();
    if (currentDate.toDateString() === reminderDate.toDateString()) {
      const mailOptions = {
        from: 'princezel18@gmail.com',
        to: userEmail,
        subject: `${planName} Contract End Reminder`,
        text: `Dear ${userFullName},

This is a reminder that your contract will end on ${formattedContractEnd}.

Thank you for using our service.

Best regards,

HR Team
Universe`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Reminder email sent successfully');
      } catch (error) {
        console.error('Error sending reminder email:', error);
      }
    }
  });
};

router.post('/send-confirmation-email', async (req, res) => {
  const { userEmail, planName, planPrice, userFullName, userUiD, userId } = req.body;

    // Get current date in UTC
    const currentDate = new Date();

    // Calculate ContractStart and ContractEnd dates
    const contractStart = new Date(currentDate);
    const contractEnd = new Date(currentDate);
    contractEnd.setDate(contractEnd.getDate() + 30);

    // Format ContractStart and ContractEnd to specific format
    const formattedContractStart = formatDate(contractStart);
    const formattedContractEnd = formatDate(contractEnd);

  const mailOptions = {
    from: 'princezel18@gmail.com',
    to: userEmail,
    subject: `Universe: ${planName} Subscription Payment Confirmation`,
    text: `Dear ${userFullName},

We hope this message finds you well.

This email is to confirm that we have successfully received your recent subscription payment for our services at Universe. 

We greatly appreciate your continued support and trust in our offerings.

Contact Details:

1. Contract Name: ${planName} Subscription
2. Contract Terminates: ${formattedContractEnd}

If you have any questions regarding your subscription or if there's anything else we can assist you with, please do not hesitate to reach out to our customer support team at sayituniverse@gmail.com.

Thank you once again for choosing Universe. We look forward to serving you and ensuring that you have a seamless experience with us.

Best regards,

HR Team
Universe`
  };

  try {
    await transporter.sendMail(mailOptions);

    // Add details to Firestore PaymentMd collection
    const paymentDetails = {
      ContractEnd: formattedContractEnd,
      ContractStart: formattedContractStart,
      DateCreate: currentDate.toISOString(),
      PaymentPlan: planName,
      PaymentPrice: planPrice,
      UserId: userId,
      UserEmail: userEmail
    };

    // Add document to PaymentMd collection
    const docRef = await db.collection('PaymentMD').add(paymentDetails);
    
    // Add docID to paymentDetails object
    paymentDetails.docID = docRef.id;

    // Update the document with docID in Firestore
    await db.collection('PaymentMD').doc(docRef.id).set(paymentDetails, { merge: true });

    console.log('Document added with ID: ', docRef.id);

    console.log('Email Sent Successfully');

    if (planName === 'LandLord Plan') {
      await db.collection('UserMD').doc(userId).update({
        UserAccountType: 4
      });
      console.log(`UserAccountType updated to 4 for user ${userFullName} with UiD: ${userUiD}, Plan: ${planName}`);
    }

    // Check if planName contains "Verification" and update Verified field in UserMd collection
    if (planName.includes('Verification')) {
      await db.collection('UserMD').doc(userId).update({
        Verified: true
      });
      console.log(`User ${userFullName} with UiD: ${userUiD} verified successfully.`);
    }

    // scheduleEmail(userEmail, contractEnd, formattedContractEnd, planName, userFullName);

    res.status(200).json({ message: 'Email confirmation sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email confirmation' });
  }
});

// POST API to create a new order
router.post('/payment-orders', async (req, res) => {
  try {
      const {
          customerName,
          pickupAddress,
          contactPhone,
          contactEmail,
          dropoffAddress,
          quotes,
          shipmentId,
          preferredDate,
          grandTotal,
          status,
      } = req.body;

      // Generate a unique order reference number
      const orderReference = generateOrderReference();

      // Log the generated order reference
      console.log('Generated Order Reference:', orderReference);

      // Prepare the new order
      const newOrder = new Order({
          customerName,
          pickupAddress,
          contactPhone,
          contactEmail,
          dropoffAddress,
          quotes,
          shipmentId,
          preferredCollectionDate: preferredDate,
          grandTotal,
          orderReference,
          status
      });

      // Save the order to the database
      await newOrder.save();

      // Return a success response
      console.log('Order created successfully');
      return res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ message: 'Server error' });
  }
});

// PUT API to update an order's status
router.put('/orders/:orderId/status', async (req, res) => {
  try {
      const { orderId } = req.params;
      const { status } = req.body;

      // Validate the status value
      const validStatuses = ['In Progress', 'Shipped', 'Shipment Has Left the Dock', 'Shipment Has Landed in Ghana', 'Shipment Delivered'];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: 'Invalid status value' });
      }

      // Find the order by ID and update its status
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

      if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
      }

      // Return a success response with the updated order
      return res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ message: 'Server error' });
  }
});


// GET API to fetch orders based on shipment details for the current user
router.get('/orders/:currentUser', async (req, res) => {
  const { currentUser } = req.params; // Assuming currentUser is passed as a route parameter

  console.log('Fetching orders for user:', currentUser); // Debugging current user

  try {
      if (!currentUser) {
          console.log('User ID is missing'); // Debugging missing user ID
          return res.status(400).json({ message: 'User ID is required' });
      }

      // Fetch all orders
      console.log('Fetching all orders from the database...');
      const orders = await Order.find({});
      console.log('Orders fetched:', orders.length); // Debugging number of orders found

      if (!orders.length) {
          console.log('No orders found in the database'); // Debugging when no orders exist
          return res.status(404).json({ message: 'No orders found' });
      }

      const matchingOrders = [];

      // Loop through each order to find shipment details
      for (const order of orders) {
          console.log('Processing order:', order._id); // Debugging each order ID

          const shipmentId = order.shipmentId; // Assuming your orders have a shipmentId field
          console.log('Fetching shipment details for shipment ID:', shipmentId); // Debugging shipment ID

          // Fetch the shipment details using the shipmentId
          const shipmentDetails = await Shipment.findById(shipmentId);
          console.log('Shipment details:', shipmentDetails); // Debugging shipment details

          if (shipmentDetails && shipmentDetails.userId.toString() === currentUser) {
              console.log('Order matches current user:', currentUser); // Debugging matching order
              matchingOrders.push(order);
          } else {
              console.log('Order does not match current user:', currentUser); // Debugging non-matching order
          }
      }

      if (matchingOrders.length === 0) {
          console.log('No matching orders found for user:', currentUser); // Debugging no matching orders
          return res.status(404).json({ message: 'No orders found for the current user' });
      }

      // Return the matched orders
      console.log('Matched orders:', matchingOrders); // Debugging final matched orders
      return res.status(200).json({ orders: matchingOrders });
  } catch (error) {
      console.error('Error fetching orders:', error); // Debugging server error
      return res.status(500).json({ message: 'Server error' });
  }
});

// GET API to fetch order by order reference and email
router.get('/orders', async (req, res) => {
  const { orderReference, email } = req.query;
  console.log('Fetching order by order reference and email:', orderReference, email);

  // Check if both orderReference and email are provided
  if (!orderReference || !email) {
    return res.status(400).json({ message: 'Order reference and email are required' });
  }

  try {
    // Find the order in the database by orderReference and contactEmail
    const order = await Order.findOne({ orderReference, contactEmail: email });
    console.log('Order found:', order);

    if (!order) {
      // Return a 404 status if the order is not found
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return the order details
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


function formatPriceForStripe(price) {
  return price * 100; // Convert price to cents (Stripe requires amount in smallest currency unit)
}

module.exports = router;
