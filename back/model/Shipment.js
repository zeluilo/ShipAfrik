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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  availableCollectionDays: [String],
  latestdropoffDays: [String],
  boxSizes: [boxSizeSchema],
  datePosted: {
    type: Date,
  },
  latestDropOffDate: {
    type: Date,
  },
  doorToChecked: {
    type: Boolean,
    default: false
  },
  withdraw: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Shipment', shipmentSchema);
