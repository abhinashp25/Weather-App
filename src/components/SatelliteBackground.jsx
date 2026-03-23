import React, { useMemo } from 'react';
import { useWeather } from '../WeatherContext';
import './SatelliteBackground.css';

export default function SatelliteBackground() {
  const { location, current } = useWeather();

  // Determine visual tint based on weather + time of day
  const isNight = useMemo(() => {
    if (!current) return false;
    const now = Date.now() / 1000;
    return now < current.sys.sunrise || now > current.sys.sunset;
  }, [current]);

  const weatherMain = current?.weather?.[0]?.main || 'Clear';

  // Build dynamic gradient based on weather condition
  const gradientOverlay = useMemo(() => {
    if (isNight) {
      return 'radial-gradient(ellipse at 30% 20%, rgba(15,20,50,0.6) 0%, rgba(5,5,20,0.85) 100%)';
    }
    switch (weatherMain) {
      case 'Clear':
        return 'radial-gradient(ellipse at 60% 30%, rgba(30,80,180,0.3) 0%, rgba(10,14,26,0.8) 100%)';
      case 'Clouds':
        return 'radial-gradient(ellipse at 50% 40%, rgba(60,65,80,0.5) 0%, rgba(10,14,26,0.85) 100%)';
      case 'Rain':
      case 'Drizzle':
        return 'radial-gradient(ellipse at 40% 50%, rgba(20,40,80,0.6) 0%, rgba(10,14,26,0.9) 100%)';
      case 'Thunderstorm':
        return 'radial-gradient(ellipse at 50% 50%, rgba(40,20,60,0.5) 0%, rgba(10,14,26,0.92) 100%)';
      case 'Snow':
        return 'radial-gradient(ellipse at 50% 30%, rgba(80,90,120,0.4) 0%, rgba(10,14,26,0.85) 100%)';
      default:
        return 'radial-gradient(ellipse at 50% 50%, rgba(40,40,50,0.5) 0%, rgba(10,14,26,0.88) 100%)';
    }
  }, [weatherMain, isNight]);

  // Use real satellite/radar tiles from RainViewer free API
  const radarTileUrl = `https://tilecache.rainviewer.com/v2/satellite/nowcast_tiles/${Math.round(location.lat)}/${Math.round(location.lon)}/3/0_0.png`;

  // Use a fallback: OpenStreetMap / CartoDB dark tiles for the map base
  const tileZ = 6;
  const tileX = Math.floor((location.lon + 180) / 360 * Math.pow(2, tileZ));
  const tileY = Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, tileZ));
  const mapTileUrl = `https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/${tileZ}/${tileX}/${tileY}.png`;

  return (
    <div className="satellite-bg">
      {/* Map tile layer */}
      <div
        className="satellite-tile"
        style={{ backgroundImage: `url(${mapTileUrl})` }}
      />

      {/* Animated mesh gradient */}
      <div className="satellite-mesh" />

      {/* Weather-aware gradient overlay */}
      <div
        className="satellite-overlay"
        style={{ background: gradientOverlay }}
      />

      {/* Subtle vignette */}
      <div className="satellite-vignette" />
    </div>
  );
}
