import React, { useEffect, useMemo, useState } from 'react';
import { useWeather } from '../WeatherContext';
import './SatelliteBackground.css';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const TILE_ZOOM = 6;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
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
  const { current, forecast, location } = useWeather();
  const [tickMs, setTickMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setTickMs(Date.now()), 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const timezone = current?.timezone ?? 0;
  const nowUnix = Math.floor(tickMs / 1000);
  const hasWeatherTiles = Boolean(API_KEY);

  const realtimeSnapshot = useMemo(() => {
    if (forecast?.list?.length) {
      // Find the two nearest forecast points (before and after current time)
      let before = null;
      let after = null;

      for (const item of forecast.list) {
        if (item.dt <= nowUnix) {
          before = item;
        }
        if (item.dt >= nowUnix && !after) {
          after = item;
        }
      }

      // If we have both before and after points, interpolate between them
      if (before && after && after.dt > before.dt) {
        const timeSpan = after.dt - before.dt;
        const timeSinceStart = nowUnix - before.dt;
        const t = clamp(timeSinceStart / timeSpan, 0, 1);

        // Interpolate cloud coverage and humidity smoothly
        const beforeCloud = before.clouds?.all ?? before.main?.humidity ?? 20;
        const afterCloud = after.clouds?.all ?? after.main?.humidity ?? 20;
        const beforeHumidity = before.main?.humidity ?? current?.main?.humidity ?? 45;
        const afterHumidity = after.main?.humidity ?? current?.main?.humidity ?? 45;

        return {
          weatherMain: t < 0.5 
            ? (before.weather?.[0]?.main || 'Clear')
            : (after.weather?.[0]?.main || 'Clear'),
          cloudCoverage: lerp(beforeCloud, afterCloud, t),
          humidity: lerp(beforeHumidity, afterHumidity, t),
        };
      }

      // Fallback: use the closest single point
      const closest = forecast.list.reduce((best, item) => {
        if (!best) return item;
        const bestDiff = Math.abs(best.dt - nowUnix);
        const currentDiff = Math.abs(item.dt - nowUnix);
        return currentDiff < bestDiff ? item : best;
      }, null);

      if (closest) {
        return {
          weatherMain: closest.weather?.[0]?.main || current?.weather?.[0]?.main || 'Clear',
          cloudCoverage: closest.clouds?.all ?? current?.clouds?.all ?? 20,
          humidity: closest.main?.humidity ?? current?.main?.humidity ?? 45,
        };
      }
    }

    return {
      weatherMain: current?.weather?.[0]?.main || 'Clear',
      cloudCoverage: current?.clouds?.all ?? 20,
      humidity: current?.main?.humidity ?? 45,
    };
  }, [forecast, current, nowUnix]);

  const { weatherMain, cloudCoverage, humidity } = realtimeSnapshot;

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
    const baseByPhase = {
      dawn: { top: '#f7a35c', mid: '#f2c99c', bottom: '#9ec9f7' },
      day: { top: '#2f84df', mid: '#71b6ff', bottom: '#d6ecff' },
      dusk: { top: '#f06b49', mid: '#6f5aa6', bottom: '#2c3c6b' },
      night: { top: '#070d1f', mid: '#162548', bottom: '#2a3963' },
    };

    // Get next 24h forecast points for sky gradient progression
    const forecastPoints = [];
    if (forecast?.list?.length) {
      const h = new Date(tickMs);
      for (let i = 0; i < 8; i++) {
        const target = Math.floor(h.getTime() / 1000 + i * 12600); // ~3.5h intervals
        const closest = forecast.list.reduce((best, item) => {
          if (!best) return item;
          const bestDiff = Math.abs(best.dt - target);
          const currentDiff = Math.abs(item.dt - target);
          return currentDiff < bestDiff ? item : best;
        }, null);
        if (closest) forecastPoints.push(closest);
      }
    }

    // If we have forecast points, blend the sky based on upcoming conditions
    if (forecastPoints.length > 0) {
      const nextWeather = forecastPoints[0]?.weather?.[0]?.main || weatherMain;
      const nextDarkness = forecastPoints[0]?.clouds?.all ?? cloudCoverage;

      // Adjust palette slightly for upcoming conditions
      let adjusted = { ...baseByPhase[dayPhase] };
      if (['Rain', 'Thunderstorm'].includes(nextWeather)) {
        // Darken if rain is coming
        adjusted.top = nextDarkness > 70 ? '#556b82' : '#707080';
        adjusted.mid = nextDarkness > 70 ? '#5a6f8a' : '#717585';
      }
      return adjusted;
    }

    return baseByPhase[dayPhase];
  }, [dayPhase, weatherMain, cloudCoverage, forecast, tickMs]);

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

  const uiSurface = useMemo(() => {
    const byPhase = {
      dawn: {
        panelBg: 'rgba(36, 36, 52, 0.56)',
        panelHover: 'rgba(44, 45, 63, 0.66)',
        panelBorder: 'rgba(255,255,255,0.25)',
      },
      day: {
        panelBg: 'rgba(30, 35, 48, 0.52)',
        panelHover: 'rgba(38, 44, 60, 0.64)',
        panelBorder: 'rgba(255,255,255,0.22)',
      },
      dusk: {
        panelBg: 'rgba(28, 30, 50, 0.56)',
        panelHover: 'rgba(36, 38, 60, 0.66)',
        panelBorder: 'rgba(255,255,255,0.25)',
      },
      night: {
        panelBg: 'rgba(14, 19, 34, 0.68)',
        panelHover: 'rgba(20, 26, 44, 0.76)',
        panelBorder: 'rgba(255,255,255,0.24)',
      },
    };

    const surface = byPhase[dayPhase];
    const rainy = ['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherMain);

    return {
      ...surface,
      controlBg: rainy ? 'rgba(14, 25, 46, 0.88)' : 'rgba(16, 24, 42, 0.84)',
      controlBgStrong: rainy ? 'rgba(14, 25, 46, 0.96)' : 'rgba(16, 24, 42, 0.94)',
      controlBorder: rainy ? 'rgba(165, 190, 255, 0.34)' : 'rgba(255,255,255,0.24)',
    };
  }, [dayPhase, weatherMain]);

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
    '--glass-bg': uiSurface.panelBg,
    '--glass-bg-hover': uiSurface.panelHover,
    '--glass-border': uiSurface.panelBorder,
    '--control-bg': uiSurface.controlBg,
    '--control-bg-strong': uiSurface.controlBgStrong,
    '--control-border': uiSurface.controlBorder,
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
