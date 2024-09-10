const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../model/User');

// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'princezel1234567890';

// Middleware to verify JWT tokens
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded; // Attach decoded token to request object
    next();
  });
};

// Route to register a new user
router.post('/register', async (req, res) => {
  console.log('10'); // Log received data

  console.log('Received registration data:', req.body); // Log received data
  console.log('20'); // Log received data

  try {
    console.log('1'); // Log received data

    const { firstName, lastName, email, phoneNumber, userType, password } = req.body;
    console.log('2'); // Log received data

    // Check if userType is missing
    if (!userType) {
      return res.status(400).json({ message: 'UserType is required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('User already exists:', { email });
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword, // Save the hashed password
      userType,
      dateCreated: new Date(),
    });

    // Save the user to the database
    await newUser.save();
    console.log('User saved successfully:', newUser);

    // Generate a JWT token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
    console.log('JWT token generated:', token);

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(400).json({ message: 'Error', error: error.message });
  }
});

// Route to login a user and generate a JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Log the incoming request
    console.log('Login request received:', { email, password });

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.statufs(400).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Log successful login details
    console.log('Login successful for user:', user.email, 'with ID:', user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: user._id, // Send the user ID in the response
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(400).json({ message: 'Error logging in', error: error.message });
  }
});



// Protected route to get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Route for refreshing the token
router.post('/refresh-token', verifyToken, (req, res) => {
  try {
    const { id, email } = req.user;
    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error refreshing token', error: error.message });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Log the incoming request and the user ID
    console.log(`Incoming GET request to /user/${userId}`);
    
    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid User ID');
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    // Log that we are querying the database
    console.log(`Searching for user with ID: ${userId}`);

    // Find the user by ObjectId
    const user = await User.findById(userId);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Log that we found the user
    console.log(`User found: ${JSON.stringify(user)}`);

    // Return the user data
    res.status(200).json(user);
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
