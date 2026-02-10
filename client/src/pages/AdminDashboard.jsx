import React, { useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        description: '',
        costRange: { min: '', max: '' },
        activities: '',
        climate: '',
        season: '',
        imageUrl: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [message, setMessage] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const [analytics, setAnalytics] = useState(null);
    const [activeTab, setActiveTab] = useState('manage');

    const fetchAnalytics = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('http://localhost:5000/api/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(res.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        }
    };

    const fetchDestinations = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/destinations');
            setDestinations(res.data);
        } catch (err) {
            console.error('Error fetching destinations:', err);
        }
    };

    React.useEffect(() => {
        fetchDestinations();
        fetchAnalytics();
    }, []);

    const getProcessedDestinations = () => {
        let filtered = destinations.filter(dest =>
            dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dest.country.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'cost') return (a.costRange?.min || 0) - (b.costRange?.min || 0);
            return 0;
        });
    };

    const processedDestinations = getProcessedDestinations();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this destination?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/destinations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Destination deleted successfully!');
            fetchDestinations();
            fetchAnalytics(); // Refresh analytics too
        } catch (err) {
            setMessage('Error deleting destination: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        setMessage('Saving...');

        let finalImageUrl = formData.imageUrl;

        if (imageFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('image', imageFile);
            try {
                const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadRes.data.imageUrl;
            } catch (err) {
                setMessage('Error uploading image: ' + (err.response?.data?.error || err.message));
                return;
            }
        }

        const payload = {
            ...formData,
            imageUrl: finalImageUrl,
            activities: formData.activities.split(',').map(a => a.trim())
        };

        try {
            await axios.post('http://localhost:5000/api/destinations', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Destination added successfully!');
            setFormData({
                name: '', country: '', description: '',
                costRange: { min: '', max: '' },
                activities: '', climate: '', season: '', imageUrl: ''
            });
            setImageFile(null);
            setPreviewUrl('');
            fetchDestinations();
            fetchAnalytics();
        } catch (err) {
            setMessage('Error adding destination: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Console</h1>
                <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'manage' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🛠 Manage
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'analytics' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📊 Analytics
                    </button>
                </div>
            </div>

            {activeTab === 'manage' ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-fit">
                        <h2 className="text-xl font-bold mb-6 text-blue-700 flex items-center gap-2">
                            Add New Spot
                        </h2>
                        {message && <div className={`p-3 rounded-lg mb-4 text-xs font-bold ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700 transition duration-500'}`}>{message}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                            <div className="space-y-1">
                                <label className="block font-semibold text-gray-700">Destination Name</label>
                                <input name="name" placeholder="Manali, HP" value={formData.name} onChange={handleChange} className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                            </div>
                            <div className="space-y-1">
                                <label className="block font-semibold text-gray-700">Country</label>
                                <input name="country" placeholder="India" value={formData.country} onChange={handleChange} className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block font-semibold text-gray-700 text-[11px]">Min Cost (₹)</label>
                                    <input type="number" name="costRange.min" value={formData.costRange.min} onChange={handleChange} className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-gray-700 text-[11px]">Max Cost (₹)</label>
                                    <input type="number" name="costRange.max" value={formData.costRange.max} onChange={handleChange} className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block font-semibold text-gray-700">Climate</label>
                                    <input name="climate" placeholder="Cold" value={formData.climate} onChange={handleChange} className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-gray-700">Season</label>
                                    <input name="season" placeholder="Winter" value={formData.season} onChange={handleChange} className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block font-semibold text-gray-700">Image Upload</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
                                {previewUrl && <img src={previewUrl} className="mt-2 h-24 rounded shadow-sm border" alt="Preview" />}
                            </div>

                            <div className="space-y-1">
                                <label className="block font-semibold text-gray-700">Activities</label>
                                <input name="activities" placeholder="Trekking, Skiing (comma separated)" value={formData.activities} onChange={handleChange} className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 shadow-md transition font-extrabold uppercase tracking-wide mt-4">Save Destination</button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                            Database Inventory
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Filter inventory..."
                                className="flex-grow border p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="border p-2.5 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto font-medium"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="name">Name A-Z</option>
                                <option value="cost">Cheapest</option>
                            </select>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                                    <tr>
                                        <th className="p-4">Destination</th>
                                        <th className="p-4">Region</th>
                                        <th className="p-4">Pricing</th>
                                        <th className="p-4 text-center">Manage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {processedDestinations.map(dest => (
                                        <tr key={dest._id} className="hover:bg-blue-50/30 transition group">
                                            <td className="p-4 font-bold text-gray-900">{dest.name}</td>
                                            <td className="p-4 text-gray-500 font-medium">{dest.country}</td>
                                            <td className="p-4 text-gray-600 font-bold">
                                                ₹{dest.costRange?.min?.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(dest._id)}
                                                    className="text-red-400 hover:bg-red-600 hover:text-white p-2 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                >
                                                    🗑
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Inventory Size</p>
                            <p className="text-3xl font-black text-gray-900">{analytics?.totalDestinations || 0}</p>
                            <p className="text-[10px] text-blue-600 font-medium pt-2">Total Locations</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-pink-500">
                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Fan Base</p>
                            <p className="text-3xl font-black text-gray-900">{analytics?.totalFavorites || 0}</p>
                            <p className="text-[10px] text-pink-600 font-medium pt-2">Items on Wishlists</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-black text-gray-800 mb-4 border-b pb-2">🔥 Trending Destinations</h3>
                            <div className="space-y-4">
                                {analytics?.popularDestinations.map(item => (
                                    <div key={item._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.dest.name}</p>
                                            <p className="text-xs text-gray-500">{item.dest.country}</p>
                                        </div>
                                        <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-black">
                                            {item.count} Wishlists
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-black text-gray-800 mb-4 border-b pb-2">⭐ Top Rated (Community)</h3>
                            <div className="space-y-4">
                                {analytics?.highestRated.map(item => (
                                    <div key={item._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.dest.name}</p>
                                            <p className="text-xs text-gray-500">{item.count} Reviews</p>
                                        </div>
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black">
                                            ★ {item.avgRating.toFixed(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-black text-gray-800 mb-4 border-b pb-2">🕰 Recent Search Activity</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-medium text-gray-600">
                                <thead>
                                    <tr className="bg-gray-50 uppercase text-[10px] text-gray-400">
                                        <th className="p-3">Interests</th>
                                        <th className="p-3">Budget Cap</th>
                                        <th className="p-3">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {analytics?.recentSearches.map(log => (
                                        <tr key={log._id}>
                                            <td className="p-3">{log.interests?.join(', ') || 'General'}</td>
                                            <td className="p-3 font-bold text-gray-900">₹{log.budget?.toLocaleString()}</td>
                                            <td className="p-3 text-gray-400 font-mono italic">{new Date(log.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
