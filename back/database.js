const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Get the MongoDB connection URI from environment variables
const mongoURI = process.env.DATABASE_URL || 'mongodb+srv://zeluilo:zeluilo104@shipafrik.kbsdn.mongodb.net/shipafrik';

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Export the mongoose instance to use it in other parts of your application
module.exports = mongoose;
