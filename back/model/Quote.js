const mongoose = require('mongoose');

// Updated boxSizeSchema to remove quantity and include weight, height, length, width, and fragile
const itemSchema = new mongoose.Schema({
    weight: { type: Number, required: true },           
    height: { type: Number, required: true }, 
    length: { type: Number, required: true }, 
    width: { type: Number, required: true },
    fragile: { type: Boolean, required: true } 
});

const quoteSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [itemSchema],
    dateCreated: { type: Date, default: Date.now },
    serviceType: [{ type: String, required: true }], // Changed to an array of strings
    pickupPostcode: { type: String, required: true }, // Added pickupPostcode field
    destinationCity: { type: String, required: true }, // Added destinationCity field
    collectBy: { type: Date, required: true }, // Added collectBy field
    arriveBy: { type: Date, required: true } // Added arriveBy field
});

module.exports = mongoose.model('Quote', quoteSchema);
