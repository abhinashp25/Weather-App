import React from 'react';
import { useWeather } from '../WeatherContext';
import { useI18n } from '../I18nContext';
import {
  Thermometer, Droplets, Wind, Eye, Gauge, Sunrise, Sunset,
  ArrowUp, ArrowDown, CloudRain, Snowflake, Sun, Cloud, CloudLightning, CloudDrizzle, CloudFog
} from 'lucide-react';
import './CurrentWeather.css';

const WEATHER_ICONS = {
  Clear: Sun, Clouds: Cloud, Rain: CloudRain, Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning, Snow: Snowflake, Mist: CloudFog,
  Haze: CloudFog, Fog: CloudFog, Smoke: CloudFog,
};

function formatTime(ts, tz) {
  const date = new Date((ts + tz) * 1000);
  return date.toISOString().slice(11, 16);
}

export default function CurrentWeather() {
  const { current, location, unit, setUnitMode, loading } = useWeather();
  const { t } = useI18n();

  if (loading || !current) {
    return (
      <div className="current-weather glass-panel animate-fade-in-up">
        <div className="cw-loading">
          <div className="skeleton" style={{ width: '60%', height: 32, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '40%', height: 72, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: '80%', height: 18 }} />
        </div>
      </div>
    );
  }

  const temp = Math.round(current.main.temp);
  const feelsLike = Math.round(current.main.feels_like);
  const high = Math.round(current.main.temp_max);
  const low = Math.round(current.main.temp_min);
  const desc = current.weather[0].description;
  const mainWeather = current.weather[0].main;
  const IconComponent = WEATHER_ICONS[mainWeather] || Cloud;
  const unitSymbol = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';
  const windValue = unit === 'metric'
    ? `${current.wind.speed.toFixed(1)} ${windUnit}`
    : `${Math.round(current.wind.speed)} ${windUnit}`;
  const visibilityValue = unit === 'metric'
    ? `${(current.visibility / 1000).toFixed(1)} km`
    : `${(current.visibility / 1609.34).toFixed(1)} mi`;

  return (
    <div className="current-weather glass-panel animate-fade-in-up">
      <div className="cw-header">
        <div className="cw-location">
          <h2>{location.name}</h2>
          <span className="cw-country">{location.country}</span>
        </div>
        <div className="cw-unit-toggle glass-panel-static" id="unit-toggle-btn" role="group" aria-label="Temperature unit toggle">
          <button
            type="button"
            className={`cw-unit-btn ${unit === 'metric' ? 'active' : ''}`}
            onClick={() => setUnitMode('metric')}
            aria-pressed={unit === 'metric'}
          >
            °C
          </button>
          <button
            type="button"
            className={`cw-unit-btn ${unit === 'imperial' ? 'active' : ''}`}
            onClick={() => setUnitMode('imperial')}
            aria-pressed={unit === 'imperial'}
          >
            °F
          </button>
        </div>
      </div>

      <div className="cw-main">
        <div className="cw-icon-wrapper">
          <IconComponent size={64} strokeWidth={1.2} className="cw-icon" />
        </div>
        <div className="cw-temp-block">
          <span className="cw-temp">{temp}<sup>{unitSymbol}</sup></span>
          <span className="cw-desc">{desc}</span>
          <div className="cw-hi-lo">
            <span><ArrowUp size={14} /> {high}°</span>
            <span><ArrowDown size={14} /> {low}°</span>
          </div>
        </div>
      </div>

      <div className="cw-details">
        <DetailCard icon={<Thermometer size={18} />} label={t('feelsLike')} value={`${feelsLike}${unitSymbol}`} />
        <DetailCard icon={<Droplets size={18} />} label={t('humidity')} value={`${current.main.humidity}%`} />
        <DetailCard icon={<Wind size={18} />} label={t('wind')} value={windValue} />
        <DetailCard icon={<Eye size={18} />} label={t('visibility')} value={visibilityValue} />
        <DetailCard icon={<Gauge size={18} />} label={t('pressure')} value={`${current.main.pressure} hPa`} />
        <DetailCard icon={<Sunrise size={18} />} label={t('sunrise')} value={formatTime(current.sys.sunrise, current.timezone)} />
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value }) {
  return (
    <div className="detail-card">
      <div className="detail-icon">{icon}</div>
      <div className="detail-info">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value}</span>
      </div>
    </div>
  );
}
