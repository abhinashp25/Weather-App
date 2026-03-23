import React, { useEffect, useMemo, useState } from 'react';
import { useWeather } from '../WeatherContext';
import './SatelliteBackground.css';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const TILE_ZOOM = 6;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createTileGrid(lat, lon, z) {
  const n = Math.pow(2, z);
  const centerX = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const centerY = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

  const tiles = [];
  for (let row = -1; row <= 1; row += 1) {
    for (let col = -1; col <= 1; col += 1) {
      const x = (centerX + col + n) % n;
      const y = clamp(centerY + row, 0, n - 1);
      tiles.push({ x, y, z, key: `${x}-${y}-${z}` });
    }
  }
  return tiles;
}

export default function SatelliteBackground() {
  const { current, location } = useWeather();
  const [tickMs, setTickMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setTickMs(Date.now()), 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const weatherMain = current?.weather?.[0]?.main || 'Clear';
  const cloudCoverage = current?.clouds?.all ?? 20;
  const humidity = current?.main?.humidity ?? 45;
  const timezone = current?.timezone ?? 0;
  const nowUnix = Math.floor(tickMs / 1000);
  const hasWeatherTiles = Boolean(API_KEY);

  const localTime = useMemo(() => new Date(tickMs + timezone * 1000), [tickMs, timezone]);

  const localHour = localTime.getUTCHours();
  const localMinute = localTime.getUTCMinutes();
  const dayProgress = (localHour + localMinute / 60) / 24;

  const sunrise = current?.sys?.sunrise;
  const sunset = current?.sys?.sunset;

  const dayPhase = useMemo(() => {
    if (sunrise && sunset) {
      if (nowUnix >= sunrise - 3600 && nowUnix <= sunrise + 3600) return 'dawn';
      if (nowUnix > sunrise + 3600 && nowUnix < sunset - 3600) return 'day';
      if (nowUnix >= sunset - 3600 && nowUnix <= sunset + 3600) return 'dusk';
      return 'night';
    }
    if (localHour >= 5 && localHour < 7) return 'dawn';
    if (localHour >= 7 && localHour < 17) return 'day';
    if (localHour >= 17 && localHour < 20) return 'dusk';
    return 'night';
  }, [localHour, nowUnix, sunrise, sunset]);

  const skyPalette = useMemo(() => {
    const byPhase = {
      dawn: { top: '#f7a35c', mid: '#f2c99c', bottom: '#9ec9f7' },
      day: { top: '#2f84df', mid: '#71b6ff', bottom: '#d6ecff' },
      dusk: { top: '#f06b49', mid: '#6f5aa6', bottom: '#2c3c6b' },
      night: { top: '#070d1f', mid: '#162548', bottom: '#2a3963' },
    };
    return byPhase[dayPhase];
  }, [dayPhase]);

  const weatherTint = useMemo(() => {
    switch (weatherMain) {
      case 'Rain':
      case 'Drizzle':
        return 'rgba(28, 60, 110, 0.34)';
      case 'Thunderstorm':
        return 'rgba(35, 24, 70, 0.42)';
      case 'Snow':
        return 'rgba(202, 222, 255, 0.22)';
      case 'Clouds':
        return 'rgba(94, 108, 128, 0.28)';
      case 'Mist':
      case 'Haze':
      case 'Fog':
        return 'rgba(130, 140, 150, 0.26)';
      default:
        return 'rgba(20, 26, 40, 0.12)';
    }
  }, [weatherMain]);

  const sunPath = useMemo(() => {
    if (sunrise && sunset) {
      const daylightSpan = Math.max(1, sunset - sunrise);
      const t = clamp((nowUnix - sunrise) / daylightSpan, 0, 1);
      return {
        x: 10 + t * 80,
        y: 80 - Math.sin(t * Math.PI) * 62,
      };
    }

    return {
      x: 8 + dayProgress * 84,
      y: 80 - Math.max(0, Math.sin(dayProgress * Math.PI * 2)) * 62,
    };
  }, [dayProgress, nowUnix, sunrise, sunset]);

  const cloudOpacity = Math.min(0.75, Math.max(0.08, cloudCoverage / 140));
  const hazeOpacity = clamp((humidity - 35) / 120, 0.06, 0.5);

  const precipOpacity = useMemo(() => {
    switch (weatherMain) {
      case 'Thunderstorm':
        return 0.52;
      case 'Rain':
        return 0.42;
      case 'Drizzle':
        return 0.24;
      case 'Snow':
        return 0.2;
      default:
        return 0.04;
    }
  }, [weatherMain]);

  const tileGrid = useMemo(() => createTileGrid(location.lat, location.lon, TILE_ZOOM), [location.lat, location.lon]);

  const satelliteTiles = useMemo(() => {
    return tileGrid.map((tile) => ({
      ...tile,
      src: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${tile.z}/${tile.y}/${tile.x}`,
    }));
  }, [tileGrid]);

  const cloudTiles = useMemo(() => {
    if (!hasWeatherTiles) return [];
    return tileGrid.map((tile) => ({
      ...tile,
      src: `https://tile.openweathermap.org/map/clouds_new/${tile.z}/${tile.x}/${tile.y}.png?appid=${API_KEY}`,
    }));
  }, [hasWeatherTiles, tileGrid]);

  const precipitationTiles = useMemo(() => {
    if (!hasWeatherTiles) return [];
    return tileGrid.map((tile) => ({
      ...tile,
      src: `https://tile.openweathermap.org/map/precipitation_new/${tile.z}/${tile.x}/${tile.y}.png?appid=${API_KEY}`,
    }));
  }, [hasWeatherTiles, tileGrid]);

  const rootStyle = {
    '--sky-top': skyPalette.top,
    '--sky-mid': skyPalette.mid,
    '--sky-bottom': skyPalette.bottom,
    '--weather-tint': weatherTint,
    '--sun-x': `${sunPath.x}%`,
    '--sun-y': `${sunPath.y}%`,
    '--cloud-opacity': cloudOpacity,
    '--haze-opacity': hazeOpacity,
    '--precip-opacity': precipOpacity,
  };

  return (
    <div className={`satellite-bg phase-${dayPhase} weather-${weatherMain.toLowerCase()}`} style={rootStyle}>
      <div className="satellite-sky" />
      <div className="satellite-earth-layer">
        <div className="satellite-tile-grid">
          {satelliteTiles.map((tile) => (
            <img key={`sat-${tile.key}`} src={tile.src} alt="" className="satellite-tile" draggable={false} />
          ))}
        </div>
      </div>
      {hasWeatherTiles && (
        <div className="satellite-cloud-layer">
          <div className="satellite-tile-grid">
            {cloudTiles.map((tile) => (
              <img key={`cloud-${tile.key}`} src={tile.src} alt="" className="satellite-tile" draggable={false} />
            ))}
          </div>
        </div>
      )}
      {hasWeatherTiles && (
        <div className="satellite-precip-layer">
          <div className="satellite-tile-grid">
            {precipitationTiles.map((tile) => (
              <img key={`rain-${tile.key}`} src={tile.src} alt="" className="satellite-tile" draggable={false} />
            ))}
          </div>
        </div>
      )}
      <div className="satellite-sunmoon" />
      <div className="satellite-clouds" />
      <div className="satellite-mesh" />
      <div className="satellite-haze" />
      <div className="satellite-weather-tint" />
      <div className="satellite-rain" />
      <div className="satellite-snow" />
      <div className="satellite-stars" />
      <div className="satellite-lightning" />
      <div className="satellite-vignette" />
    </div>
  );
}
