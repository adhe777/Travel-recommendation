require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Destination = require('./models/Destination');
const User = require('./models/User');

const destinations = [
    {
        name: "Manali, Himachal Pradesh",
        country: "India",
        description: "A high-altitude Himalayan resort town known for its cool climate and snow-capped mountains.",
        costRange: { min: 15000, max: 50000 },
        activities: ["Trekking", "Skiing", "Adventure", "Nature"],
        climate: "Cold",
        season: "Summer/Winter",
        imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23",
        score: 0.95
    },
    {
        name: "Goa",
        country: "India",
        description: "Famous for its beaches, nightlife, and Portuguese architectural heritage.",
        costRange: { min: 10000, max: 40000 },
        activities: ["Beach", "Nightlife", "Water Sports", "Relaxation"],
        climate: "Tropical",
        season: "Winter",
        imageUrl: "https://images.unsplash.com/photo-1512783558244-78c399cfe4ee",
        score: 0.92
    },
    {
        name: "Munnar, Kerala",
        country: "India",
        description: "A town and hill station in the Western Ghats known for its rolling hills and tea plantations.",
        costRange: { min: 12000, max: 35000 },
        activities: ["Nature", "Trekking", "Relaxation", "Photography"],
        climate: "Temperate",
        season: "Summer/Autumn",
        imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2",
        score: 0.90
    },
    {
        name: "Varanasi, Uttar Pradesh",
        country: "India",
        description: "A city on the banks of the Ganges in northern India that has a central place in pilgrimage, death, and mourning in the Hindu world.",
        costRange: { min: 5000, max: 20000 },
        activities: ["Culture", "Spirituality", "History", "Photography"],
        climate: "Subtropical",
        season: "Winter",
        imageUrl: "https://images.unsplash.com/photo-1549117650-98317f259cf3",
        score: 0.88
    },
    {
        name: "Udaipur, Rajasthan",
        country: "India",
        description: "The 'City of Lakes' is known for its lavish royal residences and artificial lakes.",
        costRange: { min: 15000, max: 60000 },
        activities: ["Culture", "History", "Sightseeing", "Luxury"],
        climate: "Arid",
        season: "Winter",
        imageUrl: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3",
        score: 0.87
    }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-travel-db')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Seed Admin User
        await User.deleteMany({ role: 'admin' });
        const salt = await bcrypt.genSalt(10);
        const hashedAdminPassword = await bcrypt.hash('admin123', salt);

        const adminUser = new User({
            username: 'admin',
            email: 'admin@travel.com',
            password: hashedAdminPassword,
            role: 'admin'
        });
        await adminUser.save();
        console.log('Admin user created: admin@travel.com / admin123');

        // Seed Destinations
        await Destination.deleteMany({});
        await Destination.insertMany(destinations);
        console.log('Destinations planted');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
