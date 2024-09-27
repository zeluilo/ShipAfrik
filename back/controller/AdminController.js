const express = require('express');
const router = express.Router();
const Country = require('../model/Country'); // Adjust the path as needed
const ServiceType = require('../model/ServiceType'); // Import the model

// Route to create a new country and add cities
router.post('/add-country', async (req, res) => {
    const { name, cities } = req.body;

    console.log('Received request to create a new country with the following data:');
    console.log('Country Name:', name);
    console.log('Cities:', cities);

    try {
        console.log('Checking if country already exists...');
        const existingCountry = await Country.findOne({ name });
        if (existingCountry) {
            console.log('Country already exists:', existingCountry);
            return res.status(400).json({ message: 'Country already exists' });
        }
        console.log('Country does not exist, creating a new one.');
        const country = new Country({ name });

        console.log('Country object before adding cities:', country);

        if (cities && cities.length > 0) {
            country.cities = cities.map(city => ({ name: city.trim() }));
        }

        console.log('Country object with cities before saving:', country);

        const savedCountry = await country.save();
        console.log('Country successfully saved:', savedCountry);

        res.status(201).json({ message: 'Country and cities created successfully', country: savedCountry });
    } catch (error) {
        console.error('Error creating country:', error.message);
        res.status(500).json({ message: 'Error creating country', error: error.message });
    }
});

// Route to update cities in a country
router.put('/add-city/:countryId', async (req, res) => {
    const { countryId } = req.params;
    const { cities } = req.body;  // Expecting an array of city names

    console.log('Received request to update cities for country ID:', countryId);
    console.log('Received cities:', cities);

    try {
        const country = await Country.findById(countryId);
        if (!country) {
            console.log('Country not found with ID:', countryId);
            return res.status(404).json({ message: 'Country not found' });
        }

        console.log('Current cities in country:', country.cities.map(city => city.name));

        const existingCities = new Set(country.cities.map((city) => city.name));
        const newCities = cities.filter(city => !existingCities.has(city.trim())).map(name => ({ name: name.trim() }));

        if (newCities.length > 0) {
            console.log('Adding new cities:', newCities);
            country.cities.push(...newCities);
        } else {
            console.log('No new cities to add.');
        }

        await country.save();
        console.log('Updated country with new cities:', country);

        res.status(200).json({ message: 'Cities updated successfully', country });
    } catch (error) {
        console.error('Error while updating cities:', error);
        res.status(500).json({ message: 'Error updating cities', error: error.message });
    }
});

// Route to get a list of all countries and their cities
router.get('/get-countries', async (req, res) => {
    try {
        const countries = await Country.find();
        res.status(200).json(countries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching countries', error: error.message });
    }
});

// Route to delete a country by ID
router.delete('/delete-country/:countryId', async (req, res) => {
    const { countryId } = req.params;

    try {
        // Find and delete the country by ID
        const deletedCountry = await Country.findByIdAndDelete(countryId);
        if (!deletedCountry) {
            return res.status(404).json({ message: 'Country not found' });
        }

        res.status(200).json({ message: 'Country deleted successfully', deletedCountry });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting country', error: error.message });
    }
});

// Route to delete a city from a country
router.delete('/delete-city/:countryId/city/:cityId', async (req, res) => {
    const { countryId, cityId } = req.params;

    try {
        // Find the country by ID
        const country = await Country.findById(countryId);
        if (!country) {
            return res.status(404).json({ message: 'Country not found' });
        }

        // Find the index of the city in the country's cities array
        const cityIndex = country.cities.findIndex((city) => city._id.toString() === cityId);
        if (cityIndex === -1) {
            return res.status(404).json({ message: 'City not found in this country' });
        }

        // Remove the city from the array
        country.cities.splice(cityIndex, 1);
        await country.save();

        res.status(200).json({ message: 'City deleted successfully', country });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting city', error: error.message });
    }
});

// Route to create a new service type
router.post('/add-service-type', async (req, res) => {
    const { name } = req.body;

    try {
        // Check if service type already exists
        const existingServiceType = await ServiceType.findOne({ name });
        if (existingServiceType) {
            return res.status(400).json({ message: 'Service type already exists' });
        }

        // Create new service type
        const serviceType = new ServiceType({ name });
        const savedServiceType = await serviceType.save();

        res.status(201).json({ message: 'Service type created successfully', serviceType: savedServiceType });
    } catch (error) {
        res.status(500).json({ message: 'Error creating service type', error: error.message });
    }
});

// Route to get all service types
router.get('/get-service-types', async (req, res) => {
    try {
        const serviceTypes = await ServiceType.find();
        res.status(200).json(serviceTypes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service types', error: error.message });
    }
});

// Route to get a single service type by ID
router.get('/get-service-type/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const serviceType = await ServiceType.findById(id);
        if (!serviceType) {
            return res.status(404).json({ message: 'Service type not found' });
        }
        res.status(200).json(serviceType);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service type', error: error.message });
    }
});

// Route to update a service type by ID
router.put('/update-service-type/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const serviceType = await ServiceType.findById(id);
        if (!serviceType) {
            return res.status(404).json({ message: 'Service type not found' });
        }

        serviceType.name = name || serviceType.name;

        const updatedServiceType = await serviceType.save();
        res.status(200).json({ message: 'Service type updated successfully', serviceType: updatedServiceType });
    } catch (error) {
        res.status(500).json({ message: 'Error updating service type', error: error.message });
    }
});

// Route to delete a service type by ID
router.delete('/delete-service-type/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const serviceType = await ServiceType.findById(id);
        if (!serviceType) {
            return res.status(404).json({ message: 'Service type not found' });
        }

        await serviceType.remove();
        res.status(200).json({ message: 'Service type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service type', error: error.message });
    }
});

module.exports = router;
