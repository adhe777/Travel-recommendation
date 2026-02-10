import React from 'react';

const WeatherInfo = ({ weather }) => {
    if (!weather) return null;

    return (
        <div className="mt-2 p-2 bg-blue-50 rounded-md flex items-center space-x-3">
            {/* Placeholder Icon */}
            <div className="text-2xl">🌤️</div>
            <div>
                <p className="text-sm font-bold text-gray-800">{weather.temp}°C</p>
                <p className="text-xs text-gray-600 capitalize">{weather.condition}</p>
            </div>
        </div>
    );
};

export default WeatherInfo;
