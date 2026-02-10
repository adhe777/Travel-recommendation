import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RatingReview = ({ destinationId }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/${destinationId}`);
            setReviews(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [destinationId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/reviews',
                { destinationId, rating, comment },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setComment('');
            fetchReviews();
            alert("Review submitted!");
        } catch (err) {
            alert("Failed to submit review");
        }
    };

    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-bold text-gray-800 mb-3 text-sm">Community Reviews</h4>

            <form onSubmit={handleSubmit} className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-600">Rate:</span>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-lg ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full text-xs p-2 border rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                    rows="2"
                    required
                />
                <button type="submit" className="mt-2 w-full bg-blue-600 text-white text-[10px] font-bold py-1.5 rounded uppercase tracking-wider">
                    Post Review
                </button>
            </form>

            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {reviews.map(rev => (
                    <div key={rev._id} className="text-[11px] bg-white p-2 rounded border border-gray-50 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-700">{rev.userId?.username}</span>
                            <span className="text-yellow-500 font-bold">★ {rev.rating}</span>
                        </div>
                        <p className="text-gray-600 italic">"{rev.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingReview;
