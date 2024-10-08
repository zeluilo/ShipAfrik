const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Define the path for the uploads directory
const uploadsDir = path.join(__dirname, 'uploads');

// Create the uploads directory if it does not exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Specify the directory for storing uploaded files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('File name:', file);
    cb(null, filename);
  }
});

const upload = multer({ storage: storage })

router.use('/uploads', express.static(uploadsDir));

// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'princezel1234567890';

// Middleware to verify JWT tokens
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader);
  if (!authHeader) {
    console.log('No token provided');
    return res.status(403).json({ message: 'No token provided' });
  }

  // Use regular expression to extract the token
  const tokenRegex = /Bearer\s(.+)/;
  const match = authHeader.match(tokenRegex);
  console.log('Match:', match);
  if (!match || match.length < 2) {
    console.log('No token provided after extraction');
    return res.status(403).json({ message: 'No token provided' });
  }
  const token = match[1];
  console.log('Extracted Token:', token);

  const secret = process.env.JWT_SECRET || 'princezel1234567890';

  jwt.verify(token, secret, (err) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        // Token has expired
        console.log('Token expired:', err.expiredAt);
      } else {
        // Other JWT verification errors
        console.log('Error:', err);
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }
    next();
  });
};

// Route to register a new user
router.post('/register', upload.single('image'), async (req, res) => {

  console.log('Received registration data:', req.body); // Log received data

  try {

    const { firstName, lastName, email, phoneNumber, userType, password } = req.body;

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
      image: req.file ? req.file.path : undefined
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
      return res.status(400).json({ message: 'Invalid email or password' });
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
      user: user._id,
      // userType: user.user
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
    const id = req.body.user;
    console.log('Received refresh token request for user: ', id);
    const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated token:', token);
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

// Route to update user details
router.put('/update-user/:id', upload.single('profileImage'), async (req, res) => {
  const userId = req.params.id;
  console.log('Received PUT request to update user with ID:', userId);
  const updateData = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the new email already exists
    if (updateData.email) {
      const existingUser = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user fields with provided data
    const { firstName, lastName, email, phoneNumber } = updateData;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Handle password update if provided
    if (updateData.password) {
      if (updateData.password !== updateData.passwordConfirmation) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
      if (!validatePassword(updateData.password)) {
        return res.status(400).json({ message: 'Password must be more than 8 characters and include at least one number' });
      }
      user.password = await bcrypt.hash(updateData.password, 10);
    }

    // Handle profile image update if provided
    if (req.file) {
      // Optionally, delete the old image if it exists
      if (user.image && fs.existsSync(user.image)) {
        fs.unlinkSync(user.image);
      }

      user.image = req.file.path; // Store the absolute path in the database
      console.log('Updating profile image with data:', req.file);
    }

    // Save the updated user data
    await user.save();
    console.log('User updated successfully:', user);

    const imageUrl = user.image ? `${req.protocol}://${req.get('host')}/uploads/${path.basename(user.image)}` : null;
    console.log('Image: ', imageUrl)
    res.status(200).json({ message: 'User updated successfully', user: { ...user._doc, imageUrl } });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});



module.exports = router;
