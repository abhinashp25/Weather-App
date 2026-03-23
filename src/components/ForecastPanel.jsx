import React from 'react';
import { useWeather } from '../WeatherContext';
import { useI18n } from '../I18nContext';
import { CloudRain, Snowflake, Sun, Cloud, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';
import './ForecastPanel.css';

const ICONS = {
  Clear: Sun, Clouds: Cloud, Rain: CloudRain, Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning, Snow: Snowflake, Mist: CloudFog, Haze: CloudFog, Fog: CloudFog, Smoke: CloudFog,
};

function getDayName(dt) {
  return new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
}

function getHour(dt) {
  return new Date(dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
}

export default function ForecastPanel() {
  const { forecast, unit, loading } = useWeather();
  const { t } = useI18n();

  if (loading || !forecast) {
    return (
      <div className="forecast-panel glass-panel animate-fade-in-up stagger-3">
        <h3 className="fp-title">{t('fiveDayForecast')}</h3>
        <div className="fp-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  const unitSym = unit === 'metric' ? '°' : '°F';

  const dailyMap = {};
  forecast.list.forEach(item => {
    const day = new Date(item.dt * 1000).toDateString();
    if (!dailyMap[day]) dailyMap[day] = [];
    dailyMap[day].push(item);
  });

  const dailyForecasts = Object.values(dailyMap).slice(0, 5).map(dayItems => {
    const noon = dayItems.find(d => new Date(d.dt * 1000).getHours() >= 12) || dayItems[Math.floor(dayItems.length / 2)];
    const temps = dayItems.map(d => d.main.temp);
    return {
      dt: noon.dt,
      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
      weather: noon.weather[0],
    };
  });

  const hourly = forecast.list.slice(0, 12);

  return (
    <div className="forecast-panel glass-panel animate-fade-in-up stagger-3">
      <h3 className="fp-title">{t('hourlyForecast')}</h3>
      <div className="fp-hourly-scroll">
        {hourly.map((h, i) => {
          const Icon = ICONS[h.weather[0].main] || Cloud;
          return (
            <div className="fp-hour-card" key={h.dt}>
              <span className="fp-hour-time">{i === 0 ? t('now') : getHour(h.dt)}</span>
              <Icon size={20} className="fp-hour-icon" />
              <span className="fp-hour-temp">{Math.round(h.main.temp)}{unitSym}</span>
            </div>
          );
        })}
      </div>

      <h3 className="fp-title" style={{ marginTop: 'var(--space-lg)' }}>{t('fiveDayForecast')}</h3>
      <div className="fp-daily-list">
        {dailyForecasts.map((d, i) => {
          const Icon = ICONS[d.weather.main] || Cloud;
          return (
            <div className="fp-daily-row" key={d.dt}>
              <span className="fp-daily-day">{i === 0 ? t('today') : getDayName(d.dt)}</span>
              <div className="fp-daily-icon-desc">
                <Icon size={18} />
                <span className="fp-daily-desc">{d.weather.description}</span>
              </div>
              <div className="fp-daily-bar">
                <span className="fp-daily-lo">{d.low}°</span>
                <div className="fp-temp-bar">
                  <div className="fp-temp-bar-fill" style={{ left: `${Math.max(0,(d.low + 10) * 2)}%`, right: `${Math.max(0, 100 - (d.high + 10) * 2)}%` }} />
                </div>
                <span className="fp-daily-hi">{d.high}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
