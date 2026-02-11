import React, { useState } from 'react';
import InputForm from './InputForm';
import RecommendationCard from './RecommendationCard';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('score');
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleSearch = (prefs) => {
        setLoading(true);
        setError(null);
        axios.post('http://localhost:5000/api/recommend', prefs, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => {
                setRecommendations(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError("Failed to fetch recommendations. Please try again.");
                setLoading(false);
            });
    };

    const handleFavorite = async (dest) => {
        try {
            await axios.post('http://localhost:5000/api/favorites',
                { destinationId: dest._id || dest.id },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setMessage(`Added ${dest.name} to wishlist!`);
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to add to wishlist");
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handlePlanTrip = (dest) => {
        navigate('/planner', { state: { destination: dest } });
    };

    const getProcessedRecommendations = () => {
        let filtered = recommendations.filter(rec =>
            rec.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.sort((a, b) => {
            if (sortBy === 'cost') return a.cost - b.cost;
            if (sortBy === 'score') return b.score - a.score;
            return 0;
        });
    };

    const processedRecs = getProcessedRecommendations();

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Discover Your Perfect Destination</h1>
                <p className="text-gray-600">Discover personalized recommendations for your perfect trip.</p>
                {message && (
                    <div className="fixed top-20 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
                        {message}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <InputForm onSubmit={handleSearch} />
                </div>

                <div className="lg:col-span-2">
                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {!loading && !error && recommendations.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="w-full md:w-1/2">
                                    <input
                                        type="text"
                                        placeholder="Search spots..."
                                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
                                    <select
                                        className="border p-2 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="score">Best Match</option>
                                        <option value="cost">Lowest Cost</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {processedRecs.map((dest, index) => (
                                    <RecommendationCard
                                        key={index}
                                        destination={dest}
                                        onFavorite={handleFavorite}
                                        onPlanTrip={handlePlanTrip}
                                    />
                                ))}
                            </div>
                            {processedRecs.length === 0 && (
                                <p className="text-center text-gray-500 mt-10">No spots match your search criteria.</p>
                            )}
                        </div>
                    )}

                    {!loading && !error && recommendations.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">Enter your preferences to see personalized suggestions!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
