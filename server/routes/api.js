const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const Destination = require('../models/Destination');

const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const Favorite = require('../models/Favorite');
const Review = require('../models/Review');
const Trip = require('../models/Trip');
const SearchLog = require('../models/SearchLog');

// Recommendations
router.post('/recommend', recommendationController.getRecommendations);

// Upload endpoint
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Favorites (Wishlist)
router.get('/favorites', verifyToken, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user.id }).populate('destinationId');
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/favorites', verifyToken, async (req, res) => {
    try {
        const { destinationId } = req.body;
        const existing = await Favorite.findOne({ userId: req.user.id, destinationId });
        if (existing) return res.status(400).json({ error: 'Already in favorites' });

        const favorite = new Favorite({ userId: req.user.id, destinationId });
        await favorite.save();
        res.status(201).json(favorite);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/favorites/:id', verifyToken, async (req, res) => {
    try {
        await Favorite.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Removed from favorites' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reviews
router.post('/reviews', verifyToken, async (req, res) => {
    try {
        const { destinationId, rating, comment } = req.body;
        const review = new Review({ userId: req.user.id, destinationId, rating, comment });
        await review.save();
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/reviews/:destinationId', async (req, res) => {
    try {
        const reviews = await Review.find({ destinationId: req.params.destinationId }).populate('userId', 'username');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Trips
router.post('/trips', verifyToken, async (req, res) => {
    try {
        const { destinationId, startDate, endDate, itinerary } = req.body;
        const trip = new Trip({ userId: req.user.id, destinationId, startDate, endDate, itinerary });
        await trip.save();
        res.status(201).json(trip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Analytics
router.get('/analytics', verifyToken, isAdmin, async (req, res) => {
    try {
        const totalDestinations = await Destination.countDocuments();
        const totalFavorites = await Favorite.countDocuments();
        const recentSearches = await SearchLog.find().sort({ timestamp: -1 }).limit(10);

        // Basic popularity aggregation
        const popularDestinations = await Favorite.aggregate([
            { $group: { _id: "$destinationId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: "destinations", localField: "_id", foreignField: "_id", as: "dest" } },
            { $unwind: "$dest" }
        ]);

        const highestRated = await Review.aggregate([
            { $group: { _id: "$destinationId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
            { $sort: { avgRating: -1, count: -1 } },
            { $limit: 5 },
            { $lookup: { from: "destinations", localField: "_id", foreignField: "_id", as: "dest" } },
            { $unwind: "$dest" }
        ]);

        res.json({
            totalDestinations,
            totalFavorites,
            popularDestinations,
            highestRated,
            recentSearches
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Destinations
router.get('/destinations', async (req, res) => {
    try {
        const destinations = await Destination.find();
        res.json(destinations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Protect: Only Admin can add destinations
router.post('/destinations', verifyToken, isAdmin, async (req, res) => {
    try {
        const newDest = new Destination(req.body);
        await newDest.save();
        res.status(201).json(newDest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Protect: Only Admin can delete destinations
router.delete('/destinations/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await Destination.findByIdAndDelete(req.params.id);
        res.json({ message: 'Destination deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Weather stub
router.get('/weather', (req, res) => {
    res.json({ message: "Weather endpoint stub" });
});

module.exports = router;
