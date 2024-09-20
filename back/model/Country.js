const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cities: [
    {
      name: {
        type: String,
        required: true,
      },
    }
  ],
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
