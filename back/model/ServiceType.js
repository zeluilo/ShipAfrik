const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

const ServiceType = mongoose.model('ServiceType', serviceTypeSchema);

module.exports = ServiceType;
