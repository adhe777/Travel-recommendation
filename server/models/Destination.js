const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    description: String,
    costRange: {
        min: Number,
        max: Number
    },
    activities: [{ type: String }],
    climate: String, // e.g., Tropical, Arid
    season: String, // e.g., Summer, Winter
    imageUrl: String
});

module.exports = mongoose.model('Destination', destinationSchema);
