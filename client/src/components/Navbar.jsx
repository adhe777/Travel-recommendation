import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">Smart Travel</Link>

                <div className="flex items-center space-x-6">
                    {token ? (
                        <>
                            <Link to="/" className="hover:text-blue-200 font-medium">Explore</Link>
                            <Link to="/wishlist" className="hover:text-blue-200 font-medium">❤️ Wishlist</Link>
                            <Link to="/planner" className="hover:text-blue-200 font-medium">✈️ Planner</Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded font-medium transition">Admin Panel</Link>
                            )}
                            <div className="border-l border-white/20 h-6 mx-2 hidden sm:block"></div>
                            <span className="font-semibold hidden sm:inline text-sm">Hi, {user.username}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-200 font-medium">Login</Link>
                            <Link to="/register" className="bg-white text-blue-600 px-4 py-1.5 rounded-full font-bold text-xs hover:bg-blue-50 transition shadow-sm">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
