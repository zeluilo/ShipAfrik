// gocardlessService.js
const GoCardless = require('gocardless-nodejs');
require('dotenv').config(); // Ensure dotenv is installed and configured

const gocardless = new GoCardless({
    access_token: process.env.GOCARDLESS_ACCESS_TOKEN, // Correct key
    environment: process.env.GOCARDLESS_ENVIRONMENT,       
    version: '2015-07-06'
});

// Debugging: Access the access token correctly
console.log('GoCardless Client Access Token:', gocardless._api._token.access_token);
console.log('GoCardless Client Environment:', gocardless._api._token.environment);

module.exports = gocardless;