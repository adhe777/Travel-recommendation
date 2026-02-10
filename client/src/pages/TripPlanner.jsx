import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TripPlanner = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const destination = location.state?.destination;

    const [days, setDays] = useState(3);
    const [itinerary, setItinerary] = useState(null);
    const [saving, setSaving] = useState(false);

    if (!destination) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Please select a destination from the dashboard first.</p>
                <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Go to Dashboard</button>
            </div>
        );
    }

    const generateItinerary = () => {
        const activities = destination.activities || ["Sightseeing", "Local Food", "Relaxation"];
        const newItinerary = [];

        for (let i = 1; i <= days; i++) {
            // Simple logic to distribute activities
            const dayActivities = [
                activities[(i - 1) % activities.length],
                activities[i % activities.length] || "Explore Local Area"
            ];
            newItinerary.push({
                day: i,
                activities: dayActivities
            });
        }
        setItinerary(newItinerary);
    };

    const handleSaveTrip = async () => {
        setSaving(true);
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + (days - 1));

            await axios.post('http://localhost:5000/api/trips', {
                destinationId: destination._id || destination.id,
                startDate,
                endDate,
                itinerary
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert("Trip saved successfully to your profile!");
            navigate('/');
        } catch (err) {
            alert("Failed to save trip");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Trip Planner: {destination.name}</h1>
                <p className="text-gray-600 mb-8">{destination.country}</p>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold mb-4">Plan Your Stay</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <label className="font-medium text-gray-700">Duration (Days):</label>
                        <input
                            type="number"
                            min="1" max="10"
                            value={days}
                            onChange={(e) => setDays(parseInt(e.target.value))}
                            className="border p-2 rounded w-20 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={generateItinerary}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                        >
                            Generate Itinerary
                        </button>
                    </div>

                    {itinerary && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold border-b pb-2 text-blue-700">Day-Wise Itinerary</h3>
                            {itinerary.map((day) => (
                                <div key={day.day} className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 italic transition hover:shadow-sm">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                        D{day.day}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 mb-1">Activities:</p>
                                        <ul className="list-disc list-inside text-gray-600">
                                            {day.activities.map((act, idx) => (
                                                <li key={idx} className="capitalize">{act}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 flex justify-between">
                                <button onClick={() => setItinerary(null)} className="text-gray-500 hover:text-gray-700 font-medium">Reset</button>
                                <button
                                    onClick={handleSaveTrip}
                                    disabled={saving}
                                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-md disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : '💾 Save Trip to Profile'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripPlanner;
