import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecommendationCard from '../components/RecommendationCard';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchFavorites = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/favorites', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFavorites(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRemove = async (favId) => {
        try {
            await axios.delete(`http://localhost:5000/api/favorites/${favId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFavorites(prev => prev.filter(f => f._id !== favId));
        } catch (err) {
            alert("Failed to remove from wishlist");
        }
    };

    const handlePlanTrip = (dest) => {
        navigate('/planner', { state: { destination: dest } });
    };

    if (loading) return <div className="text-center py-20">Loading your wishlist...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-blue-800 mb-8 mt-4"> My Wishlist</h1>
            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">Your wishlist is empty. Start exploring destinations!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favorites.map(fav => (
                        <div key={fav._id} className="relative group">
                            <RecommendationCard
                                destination={fav.destinationId}
                                onPlanTrip={() => handlePlanTrip(fav.destinationId)}
                            />
                            <button
                                onClick={() => handleRemove(fav._id)}
                                className="absolute top-2 right-2 bg-white/90 text-red-600 p-2 rounded-full shadow-md hover:bg-red-600 hover:text-white transition z-10 text-sm font-bold"
                                title="Remove from wishlist"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;
