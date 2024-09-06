const express = require('express');
const router = express.Router();
const { admin, db } = require('../database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const cron = require('node-cron');

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

router.get('/account-plan', async (req, res) => {
  try {
    const planQuery = await db.collection('AccountPlanMD').get();
    console.log('Plan Query :', planQuery);

    const planData = planQuery.docs.map(doc => doc.data());
    console.log('Plan:', planData);

    res.json({ AccountPlan: planData });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).send('Error fetching plan');
  }
});

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, planId } = req.body;
    console.log('Plan ID:', planId);

    // Fetch product details from Firestore based on ProductId
    const planQuerySnapshot = await db.collection('AccountPlanMD').where('PlanID', '==', planId).get();

    if (planQuerySnapshot.empty) {
      throw new Error('Plan not found');
    }

    const planDoc = planQuerySnapshot.docs[0].data();
    console.log('Plan Doc:', planDoc);

    const Price = planDoc.Price;
    const ProductId = planDoc.ProductId;
    const PlanID = planDoc.PlanID;
    const PlanName = planDoc.PlanName;
    const PlanNumber = planDoc.PlanNumber

    console.log('Price:', Price);
    console.log('ProductId:', ProductId);
    console.log('PlanID:', PlanID);
    console.log('PlanName:', PlanName);
    console.log('PlanNumber:', PlanNumber);

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Format price for Stripe (in cents)
      currency: currency,
      payment_method_types: ['card'],
      metadata: {
        integration_check: 'accept_a_payment',
        planId: PlanID,
        planName: PlanName
      },
      description: `Payment for ${PlanName}`,
      setup_future_usage: 'off_session',
    });

    res.json({ clientSecret: paymentIntent.client_secret, planName: PlanName, message: 'Subscription paid successfully!', productId: ProductId });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    res.status(500).json({ error: 'Failed to create PaymentIntent' });
  }
});

router.post('/create-account-plan', async (req, res) => {
  try {
    const { planName, planNumber, price } = req.body;

    // Create Product in Stripe
    const product = await stripe.products.create({
      name: planName,
      description: `Account Plan ${planNumber}`,
      metadata: {
        planNumber: planNumber
      },
    });

    // Create Price for the Product
    const formattedPrice = formatPriceForStripe(price); // Helper function to format price
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: formattedPrice,
      currency: 'GBP',
      recurring: { interval: 'month' }, // Adjust as needed for subscription intervals
    });

    // Create Document in Firestore
    const newAccountPlan = {
      productId: product.id,
      planName: planName,
      planNumber: planNumber,
      price: price,
      stripePriceId: stripePrice.id
    };

    const docRef = await db.collection('AccountMd').add(newAccountPlan);

    res.json({ product, stripePrice, firestoreDocId: docRef.id });
  } catch (error) {
    console.error('Error creating account plan:', error);
    res.status(500).json({ error: 'Failed to create account plan' });
  }
});

function formatPriceForStripe(price) {
  return price * 100; // Convert price to cents (Stripe requires amount in smallest currency unit)
}

module.exports = router;
