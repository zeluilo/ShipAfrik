const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database');

// const authenticateToken = require("./auth/authenticateToken");

// Load environment variables from .env file
dotenv.config();

// Create an Express.js app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
  }));
app.use(express.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Import Controllers
const ProfileController = require("./controller/ProfileController");
const ShipmentController = require("./controller/ShipmentController");

// Connect to Port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Use routes from controllers
app.use("/shipafrik", ProfileController);
app.use("/shipafrik", ShipmentController);

// Other controllers
// app.use("/universe", authenticateToken, ProfileController);

