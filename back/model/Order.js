const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    dropoffAddress: { type: String, required: true },
    quotes: { type: Array, default: [] },
    shipmentId: { type: String, required: true },
    preferredCollectionDate: { type: Date, required: true },
    grandTotal: { type: Number, required: true },
    orderReference: { type: String, required: true },
    status: { type: String, default: 'In Progress' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
