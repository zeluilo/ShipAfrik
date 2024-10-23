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
  warehouseToDoorFee: String,
  pickupRadius: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  availableCollectionDays: {
    type: [String], // This will be an array of strings
    default: [], // Initialize with an empty array
  },
  latestdropoffDays: [String],
  volumetricWeightDivider: String,
  price: String,
  fragileFee: String,  
  doorToDoorFee: {
    type: String,
    default: '',
  },
  warehouseToDoorFee: {
    type: String,
    default: '',
  },
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
  },
  serviceType: {
    type: [String], // This will be an array of strings
    default: [], // Initialize with an empty array
  }
});

module.exports = mongoose.model('Shipment', shipmentSchema);
