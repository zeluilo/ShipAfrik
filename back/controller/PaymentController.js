const express = require('express');
const router = express.Router();
const { db } = require('../database');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const crypto = require('crypto');
const axios = require('axios'); // Importing axios
const Order = require('../model/Order');
const Shipment = require('../model/Shipment');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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

// Route to send payment confirmation email to shipper
router.post('/send-payment-confirmation', async (req, res) => {
  const { userEmail, shipperEmail, shipmentDetails, userFullName, shipperFullName } = req.body;

  // Get current date in UTC
  const currentDate = new Date();

  // Construct the email content for the user
  const userMailOptions = {
    from: 'princezel18@gmail.com',
    to: userEmail,
    subject: `Shipment Payment Confirmation`,
    text: `Dear ${userFullName},

We hope this message finds you well.

This email is to confirm that we have successfully received the payment for your shipment. 

We greatly appreciate your continued support and trust in our services.

Shipment Details:
1. Shipment ID: ${shipmentDetails.id}
2. Description: ${shipmentDetails.description}
3. Total Amount Paid: £${shipmentDetails.amount}
4. Order Reference: ${shipmentDetails.orderReference}

If you have any questions regarding your shipment or if there's anything else we can assist you with, please do not hesitate to reach out to our customer support team.

Thank you once again for choosing ShipAfrik. We look forward to serving you and ensuring that you have a seamless experience with us.

Best regards,

HR Team
ShipAfrik`
  };

  // Construct the email content for the shipper
  const shipperMailOptions = {
    from: 'princezel18@gmail.com',
    to: shipperEmail,
    subject: `Shipment Purchased Notification`,
    text: `Dear ${shipperFullName},

We are pleased to inform you that your shipment has been purchased. Below are the details of the shipment.

Order Details:
1. Shipment ID: ${shipmentDetails.id}
2. Description: ${shipmentDetails.description}
3. Total Amount Paid: £${shipmentDetails.amount}
4. Order Reference: ${shipmentDetails.orderReference}

We are processing this shipment and will keep you updated as things progress.

If you have any questions or need further assistance, please feel free to contact our support team.

Best regards,

HR Team
ShipAfrik`
  };

  try {
    // Send the email to the user
    await transporter.sendMail(userMailOptions);
    console.log('Payment confirmation email sent to user');

    // Send the email to the shipper
    await transporter.sendMail(shipperMailOptions);
    console.log('Shipment purchase email sent to shipper');

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

// POST API to create a new order with Stripe
router.post('/payment-orders', async (req, res) => {
  try {
    const {
      customerName,
      pickupAddress,
      contactPhone,
      contactEmail,
      dropoffAddress,
      quote,
      shipmentId,
      preferredDate,
      grandTotal,
      status,
    } = req.body;

    console.log('Received order data:', req.body); // Log the incoming order data

    const orderReference = generateOrderReference();
    console.log('Generated order reference:', orderReference); // Log the order reference

    const newOrder = new Order({
      customerName,
      pickupAddress,
      contactPhone,
      contactEmail,
      dropoffAddress,
      quote,
      shipmentId,
      preferredCollectionDate: preferredDate,
      grandTotal,
      orderReference,
      status,
    });

    await newOrder.save();
    console.log('New order saved to the database:', newOrder); // Log the saved order details

    const paymentIntent = await stripe.paymentIntents.create({
      amount: grandTotal * 100, // Stripe accepts amounts in cents
      currency: 'gbp',
      description: 'Shipment Payment',
      payment_method_types: ['card'],
      metadata: { 
        integration_check: 'accept_a_payment',
        // order_id: newOrder._id.toString() 
      },
      setup_future_usage: 'off_session',
    });
    console.log('Payment Intent created:', paymentIntent); // Log Payment Intent

    newOrder.stripe_payment_id = paymentIntent.id;
    await newOrder.save();
    console.log('Updated order with payment ID:', newOrder); // Log updated order details

    // Return client_secret to the frontend
    res.status(201).json({ 
      message: 'Order created successfully', 
      clientSecret: paymentIntent.client_secret,
      
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error); // Log error details
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const customers = await gocardless.customers.list();
    return res.status(201).json(customers);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).send('Error fetching customers');
  }
});

// GET API to verify payment status
router.get('/orders/payment-status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const order = await Order.findOne({ gocardless_payment_id: paymentId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ status: order.status });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET API to verify payment status
router.get('/orders/payment-status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const order = await Order.findOne({ stripe_payment_id: paymentId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ status: order.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT API to update an order's status
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate the status value
    const validStatuses = ['In Progress', 'Items Collected', 'Shipped', 'Shipment Has Left the Dock', 'Shipment Has Landed in Ghana', 'Shipment Delivered'];
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
