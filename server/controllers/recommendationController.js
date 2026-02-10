const { spawn } = require('child_process');
const path = require('path');
const Recommendation = require('../models/Recommendation');
const Destination = require('../models/Destination');
const SearchLog = require('../models/SearchLog');

exports.getRecommendations = async (req, res) => {
    try {
        const userPreferences = req.body;

        // Log search for analytics
        try {
            const searchLog = new SearchLog({
                userId: req.user ? req.user.id : null,
                budget: userPreferences.budget,
                interests: userPreferences.interests,
                travelDates: userPreferences.travelDates
            });
            await searchLog.save();
        } catch (logErr) {
            console.error('Failed to log search:', logErr);
        }

        const destinations = await Destination.find();

        // Call Python ML service
        const pythonScriptPath = path.join(__dirname, '../../ml_service/recommendation_engine.py');
        const pythonProcess = spawn('python', [pythonScriptPath]);

        // Send data to Python via stdin
        const inputData = JSON.stringify({
            preferences: userPreferences,
            destinations: destinations
        });
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

        let result = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`ML Service Error: ${data}`);
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'Recommendation engine failed' });
            }

            try {
                const recommendations = JSON.parse(result);

                // Optionally save to DB
                // const rec = new Recommendation({ ... });
                // await rec.save();

                res.json(recommendations);
            } catch (e) {
                console.error('Error parsing ML output', e);
                res.status(500).json({ error: 'Error parsing recommendations' });
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
