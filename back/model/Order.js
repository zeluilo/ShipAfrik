const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    dropoffAddress: { type: String, required: true },
    quote: { type: Array, default: [] },
    shipmentId: { type: String, required: true },
    preferredCollectionDate: { type: Date, required: true },
    grandTotal: { type: Number, required: true },
    orderReference: { type: String, required: true },
    status: {
        type: String,
        enum: [
            'Shipment Booked',
            'In Progress',
            'Shipment Has Left the Dock',
            'Shipment Has Landed in Ghana',
            'Shipment Delivered',
            'Shipped'
        ],
        default: 'In Progress'
    },
    gocardless_payment_id: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
