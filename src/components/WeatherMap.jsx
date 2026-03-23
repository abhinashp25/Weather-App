import React from 'react';
import { useWeather } from '../WeatherContext';
import { useI18n } from '../I18nContext';
import { MapPin, Navigation } from 'lucide-react';
import './WeatherMap.css';

export default function WeatherMap() {
  const { location } = useWeather();
  const { t } = useI18n();

  // Use OpenStreetMap + Windy for real-time weather radar — realistic satellite view
  const windyUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=m/s&zoom=8&overlay=satellite&product=satellite&level=surface&lat=${location.lat}&lon=${location.lon}&detailLat=${location.lat}&detailLon=${location.lon}&marker=true&message=true`;

  return (
    <div className="weather-map glass-panel animate-fade-in-up stagger-7">
      <div className="wm-header">
        <h3 className="wm-title"><Navigation size={16} /> {t('mapTitle')}</h3>
        <div className="wm-location-badge">
          <MapPin size={12} />
          <span>{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</span>
        </div>
      </div>
      <div className="wm-frame-container">
        <iframe
          src={windyUrl}
          title="Live Weather Radar"
          className="wm-iframe"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
