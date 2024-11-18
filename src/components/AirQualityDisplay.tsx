"use client";

import { useEffect, useState } from 'react';
import { fetchAirQualityData } from '../utils/airQuality';
import ForecastChart from './ForecastChart';

interface AirQualityData {
  aqi: number;
  location: string;
  coordinates: [number, number];
  timestamp: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    so2?: number;
    co?: number;
  };
  weather: {
    temperature?: number;
    humidity?: number;
  };
  forecast?: {
    daily: {
      o3: Array<{ day: string; avg: number; max: number; min: number }>;
      pm10: Array<{ day: string; avg: number; max: number; min: number }>;
      pm25: Array<{ day: string; avg: number; max: number; min: number }>;
      uvi: Array<{ day: string; avg: number; max: number; min: number }>;
    };
  };
}

interface AQIDataPoint {
  timestamp: string;
  aqi: number;
}

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 shadow-green-100';
  if (aqi <= 100) return 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 shadow-yellow-100';
  if (aqi <= 150) return 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800 shadow-orange-100';
  if (aqi <= 200) return 'bg-gradient-to-br from-red-50 to-red-100 text-red-800 shadow-red-100';
  return 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 shadow-purple-100';
};

const getAQIDescription = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  return 'Very Unhealthy';
};

const formatLocalTime = (utcTimestamp: string): string => {
  const date = new Date(utcTimestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });
};

export default function AirQualityDisplay() {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<AQIDataPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchAirQualityData();
        setData(result);
        setHistoricalData(prevData => [
          ...prevData,
          { timestamp: result.timestamp, aqi: result.aqi }
        ].slice(-24));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch air quality data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="p-6 bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="text-red-500 text-xl font-semibold mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
      <div className="text-gray-500 text-lg">No data available</div>
    </div>
  );

  const renderForecastCharts = () => {
    if (!data?.forecast?.daily) return null;

    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.forecast.daily.o3 && (
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <ForecastChart
                data={data.forecast.daily.o3}
                title="Ozone (O₃) Forecast"
                color="rgb(75, 192, 192)"
              />
            </div>
          )}
          {data.forecast.daily.pm10 && (
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <ForecastChart
                data={data.forecast.daily.pm10}
                title="PM10 Forecast"
                color="rgb(153, 102, 255)"
              />
            </div>
          )}
          {data.forecast.daily.pm25 && (
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <ForecastChart
                data={data.forecast.daily.pm25}
                title="PM2.5 Forecast"
                color="rgb(255, 99, 132)"
              />
            </div>
          )}
          {data.forecast.daily.uvi && (
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <ForecastChart
                data={data.forecast.daily.uvi}
                title="UV Index Forecast"
                color="rgb(255, 159, 64)"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              {data.location}
            </h2>
            <span className="text-sm text-gray-500 font-medium">
              {formatLocalTime(data.timestamp)}
            </span>
          </div>

          <div className={`rounded-xl p-8 mb-8 shadow-lg transition-all duration-300 ${getAQIColor(data.aqi)}`}>
            <div className="text-5xl font-bold mb-3">{data.aqi}</div>
            <div className="text-xl font-medium">{getAQIDescription(data.aqi)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/50 backdrop-blur rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Weather</h3>
              <div className="space-y-3">
                <p className="text-gray-700">Temperature: <span className="font-medium">{data.weather.temperature}°C</span></p>
                <p className="text-gray-700">Humidity: <span className="font-medium">{data.weather.humidity}%</span></p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Location</h3>
              <div className="space-y-3">
                <p className="text-gray-700">Latitude: <span className="font-medium">{data.coordinates[0].toFixed(4)}</span></p>
                <p className="text-gray-700">Longitude: <span className="font-medium">{data.coordinates[1].toFixed(4)}</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">Pollutants</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Object.entries(data.pollutants).map(([key, value]) => (
                value && (
                  <div key={key} className="bg-white/50 backdrop-blur rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-sm font-medium text-gray-500 mb-2">{key.toUpperCase()}</div>
                    <div className="text-2xl font-bold text-gray-800">{value.toFixed(1)}</div>
                  </div>
                )
              ))}
            </div>
          </div>

          {renderForecastCharts()}
        </div>
      </div>
    </div>
  );
}