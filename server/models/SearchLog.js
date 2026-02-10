const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for non-logged-in users
    budget: Number,
    interests: [String],
    travelDates: {
        start: Date,
        end: Date
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SearchLog', searchLogSchema);
