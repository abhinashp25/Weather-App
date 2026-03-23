import React, { useMemo, useState } from 'react';
import { useWeather } from '../WeatherContext';
import { useI18n } from '../I18nContext';
import { MapPin, Navigation, Minus, Plus, ExternalLink } from 'lucide-react';
import './WeatherMap.css';

export default function WeatherMap() {
  const { location, unit } = useWeather();
  const { t } = useI18n();
  const [overlay, setOverlay] = useState('radar');
  const [zoom, setZoom] = useState(7);

  const overlays = [
    { key: 'radar', label: t('mapLayerRadar') },
    { key: 'satellite', label: t('mapLayerSatellite') },
    { key: 'wind', label: t('mapLayerWind') },
    { key: 'temp', label: t('mapLayerTemp') },
    { key: 'clouds', label: t('mapLayerClouds') },
  ];

  const product = overlay === 'satellite' ? 'satellite' : 'ecmwf';
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';
  const tempUnit = unit === 'metric' ? '°C' : '°F';

  const windyUrl = useMemo(() => {
    return `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=${encodeURIComponent(tempUnit)}&metricWind=${encodeURIComponent(windUnit)}&zoom=${zoom}&overlay=${overlay}&product=${product}&level=surface&lat=${location.lat}&lon=${location.lon}&detailLat=${location.lat}&detailLon=${location.lon}&marker=true&message=false`;
  }, [location.lat, location.lon, overlay, product, zoom, tempUnit, windUnit]);

  const windyExternalUrl = `https://www.windy.com/?${overlay},${location.lat},${location.lon},${zoom}`;

  return (
    <div className="weather-map glass-panel animate-fade-in-up stagger-7">
      <div className="wm-header">
        <h3 className="wm-title"><Navigation size={16} /> {t('mapTitle')}</h3>
        <div className="wm-right-controls">
          <div className="wm-location-badge">
            <MapPin size={12} />
            <span>{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</span>
          </div>
          <div className="wm-zoom-controls">
            <button className="wm-icon-btn" onClick={() => setZoom(z => Math.max(4, z - 1))} aria-label={t('mapZoomOut')}>
              <Minus size={14} />
            </button>
            <span className="wm-zoom-value">{zoom}</span>
            <button className="wm-icon-btn" onClick={() => setZoom(z => Math.min(11, z + 1))} aria-label={t('mapZoomIn')}>
              <Plus size={14} />
            </button>
            <a className="wm-icon-btn" href={windyExternalUrl} target="_blank" rel="noreferrer" aria-label={t('mapOpenFull')}>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="wm-layer-tabs" role="tablist" aria-label={t('mapLayerLabel')}>
        {overlays.map(layer => (
          <button
            key={layer.key}
            type="button"
            className={`wm-layer-tab ${overlay === layer.key ? 'active' : ''}`}
            onClick={() => setOverlay(layer.key)}
          >
            {layer.label}
          </button>
        ))}
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
