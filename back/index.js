const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database');
const path = require('path');
// const authenticateToken = require("./auth/authenticateToken");

// Load environment variables from .env file
dotenv.config();

// Create an Express.js app
const app = express();

// Middleware
app.use(cors({
    // origin: process.env.CORS_ORIGIN || 'http://localhost:3000' || 'https://shipafrik.netlify.app/',
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'gocardless-version'], // include custom headers
  }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Import Controllers
const ProfileController = require("./controller/ProfileController");
const ShipmentController = require("./controller/ShipmentController");
const AdminController = require("./controller/AdminController");
const PaymentController = require("./controller/PaymentController");

// Connect to Port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Use routes from controllers
app.use("/shipafrik", ProfileController);
app.use("/shipafrik", ShipmentController);
app.use("/shipafrik", AdminController);
app.use("/shipafrik", PaymentController);

// Other controllers
// app.use("/universe", authenticateToken, ProfileController);

