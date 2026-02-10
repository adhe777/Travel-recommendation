import React, { useState } from 'react';

const InputForm = ({ onSubmit }) => {
    const [preferences, setPreferences] = useState({
        budget: '',
        interests: '', // comma separated or multi-select
        travelDates: { start: '', end: '' }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setPreferences(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setPreferences(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(preferences);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Travel Preferences</h2>

            <div>
                <label className="block text-gray-700 font-medium mb-1">Budget (₹)</label>
                <input
                    type="number"
                    name="budget"
                    value={preferences.budget}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 25000"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 font-medium mb-1">Interests</label>
                <input
                    type="text"
                    name="interests"
                    value={preferences.interests}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Adventure, Culture, Relaxation..."
                />
            </div>

            <div className="flex space-x-4">
                <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-1">Start Date</label>
                    <input
                        type="date"
                        name="travelDates.start"
                        value={preferences.travelDates.start}
                        onChange={handleChange}
                        className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-1">End Date</label>
                    <input
                        type="date"
                        name="travelDates.end"
                        value={preferences.travelDates.end}
                        onChange={handleChange}
                        className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
                Get Recommendations
            </button>
        </form>
    );
};

export default InputForm;
