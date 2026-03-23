import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WeatherContext = createContext(null);

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';
const GEO = 'https://api.openweathermap.org/geo/1.0';

export function WeatherProvider({ children }) {
  const [location, setLocation] = useState({ name: 'New Delhi', lat: 28.6139, lon: 77.2090, country: 'IN' });
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric'); // metric | imperial

  const fetchWeather = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const [currentRes, forecastRes, aqRes] = await Promise.all([
        fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`),
        fetch(`${BASE}/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`),
        fetch(`${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
      ]);

      if (!currentRes.ok) throw new Error('Failed to fetch weather data');

      const [currentData, forecastData, aqData] = await Promise.all([
        currentRes.json(),
        forecastRes.json(),
        aqRes.json()
      ]);

      setCurrent(currentData);
      setForecast(forecastData);
      setAirQuality(aqData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [unit]);

  const searchLocation = useCallback(async (query) => {
    try {
      const res = await fetch(`${GEO}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`);
      const data = await res.json();
      return data.map(item => ({
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state
      }));
    } catch {
      return [];
    }
  }, []);

  const changeLocation = useCallback((loc) => {
    setLocation(loc);
    fetchWeather(loc.lat, loc.lon);
  }, [fetchWeather]);

  const toggleUnit = useCallback(() => {
    setUnit(prev => prev === 'metric' ? 'imperial' : 'metric');
  }, []);

  useEffect(() => {
    fetchWeather(location.lat, location.lon);
  }, [unit]);

  useEffect(() => {
    // Try geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`${GEO}/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`);
            const data = await res.json();
            if (data.length > 0) {
              const loc = { name: data[0].name, lat: latitude, lon: longitude, country: data[0].country };
              setLocation(loc);
              fetchWeather(latitude, longitude);
            }
          } catch {
            fetchWeather(location.lat, location.lon);
          }
        },
        () => {
          fetchWeather(location.lat, location.lon);
        }
      );
    } else {
      fetchWeather(location.lat, location.lon);
    }
  }, []);

  return (
    <WeatherContext.Provider value={{
      location, current, forecast, airQuality,
      loading, error, unit,
      searchLocation, changeLocation, toggleUnit
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be inside WeatherProvider');
  return ctx;
}
