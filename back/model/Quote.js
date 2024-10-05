const mongoose = require('mongoose');

const boxSizeSchema = new mongoose.Schema({
    size: { type: String, required: true },
    quantity: { type: Number, required: true }
});

const quoteSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    boxSizes: [boxSizeSchema],
    dateCreated: { type: Date, default: Date.now },
    serviceType: [{ type: String, required: true }], // Changed to an array of strings
    pickupPostcode: { type: String, required: true }, // Added pickupPostcode field
    destinationCity: { type: String, required: true }, // Added destinationCity field
    collectBy: { type: Date, required: true }, // Added collectBy field
    arriveBy: { type: Date, required: true } // Added arriveBy field
});

module.exports = mongoose.model('Quote', quoteSchema);
