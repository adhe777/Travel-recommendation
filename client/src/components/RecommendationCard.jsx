import React from 'react';

import RatingReview from './RatingReview';

const RecommendationCard = ({ destination, onFavorite, onPlanTrip }) => {
    const [showReviews, setShowReviews] = React.useState(false);
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-48 bg-gray-300 w-full object-cover flex items-center justify-center text-gray-500">
                {destination.imageUrl ? (
                    <img
                        src={destination.imageUrl.startsWith('http') ? destination.imageUrl : `http://localhost:5000${destination.imageUrl}`}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>No Image</span>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{destination.name}</h3>
                    <div className="flex flex-col items-end">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                            {Math.round(destination.score * 100)}% Match
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">AI Relevance Score</span>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{destination.country}</p>

                {/* Explainability Section */}
                {destination.explanation && (
                    <div className="bg-blue-50 p-2 rounded-md mb-3 text-[11px] border border-blue-100">
                        <div className="flex justify-between mb-1">
                            <span className="text-blue-700 font-semibold italic">Why this match?</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Interests Match:</span>
                                <span className="font-bold text-blue-600">{destination.explanation.interestMatch}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Budget Compatibility:</span>
                                <span className="font-bold text-green-600">{destination.explanation.budgetFit}%</span>
                            </div>
                            <div className="text-gray-700 mt-1 leading-tight">
                                <span className="font-medium">📅 Season:</span> {destination.explanation.seasonSuitability}
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-gray-700 text-sm mb-3">
                    Est. Cost: <span className="font-semibold text-gray-900">₹{destination.cost || destination.estimatedCost}</span>
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                    {destination.activities && destination.activities.slice(0, 3).map((act, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded border border-gray-200">{act}</span>
                    ))}
                </div>

                <div className="flex gap-2 border-t pt-3">
                    <button
                        onClick={() => onFavorite && onFavorite(destination)}
                        className="flex-1 text-pink-600 border border-pink-200 hover:bg-pink-50 text-xs font-bold py-1.5 rounded transition"
                    >
                        ❤️ Wishlist
                    </button>
                    <button
                        onClick={() => onPlanTrip && onPlanTrip(destination)}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold py-1.5 rounded transition shadow-sm"
                    >
                        ✈️ Plan Trip
                    </button>
                </div>
                <div className="mt-4 flex flex-col items-center">
                    <button
                        onClick={() => setShowReviews(!showReviews)}
                        className="text-[10px] text-gray-500 hover:text-blue-600 font-bold uppercase transition"
                    >
                        {showReviews ? '▲ Hide Reviews' : '▼ Show Community Reviews'}
                    </button>
                    {showReviews && <div className="w-full text-left"><RatingReview destinationId={destination._id || destination.id} /></div>}
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
