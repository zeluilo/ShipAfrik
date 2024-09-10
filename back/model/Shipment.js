const mongoose = require('mongoose');

const boxSizeSchema = new mongoose.Schema({
    size: String,
    price: String,
    quantity: Number
});

const shipmentSchema = new mongoose.Schema({
    estimatedVesselDepartureDate: Date,
    destinationPort: String,
    estimatedArrivalDate: Date,
    warehousePostcode: String,
    doorToDoorFee: String,
    pickupRadius: String,
    status: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    availableCollectionDays: [String],
    boxSizes: [boxSizeSchema]
});

module.exports = mongoose.model('Shipment', shipmentSchema);
