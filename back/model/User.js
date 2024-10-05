const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  gocardless_customer_id: { type: String },
  gocardless_mandate_id: { type: String },
});

// Virtual for image URL
userSchema.virtual('imageUrl').get(function () {
  if (this.image) {
    return `${process.env.SERVER_URL}/uploads/${path.basename(this.image)}`;
  }
  return null;
});

// Create a User model
const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
