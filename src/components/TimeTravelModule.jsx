import React, { useState, useMemo } from 'react';
import { useWeather } from '../WeatherContext';
import { useI18n } from '../I18nContext';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './TimeTravelModule.css';

function generateHistoricalData(current, yearsAgo) {
  if (!current) return null;
  const rng = (seed) => {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  };
  const rand = rng(yearsAgo * 31 + (current.main.temp * 100 | 0));
  const warming = yearsAgo * 0.02;
  const variation = (rand() - 0.5) * 6;
  const historicalTemp = current.main.temp - warming + variation;
  const historicalHumidity = Math.max(10, Math.min(100, current.main.humidity + (rand() - 0.5) * 20));

  return {
    temp: historicalTemp,
    humidity: historicalHumidity,
    tempDiff: current.main.temp - historicalTemp,
  };
}

export default function TimeTravelModule() {
  const { current, unit } = useWeather();
  const { t } = useI18n();
  const [selectedPeriod, setSelectedPeriod] = useState(10);

  const periods = [
    { years: 10, label: '10Y' },
    { years: 25, label: '25Y' },
    { years: 50, label: '50Y' },
  ];

  const historical = useMemo(() => generateHistoricalData(current, selectedPeriod), [current, selectedPeriod]);
  const unitSym = unit === 'metric' ? '°C' : '°F';

  if (!current || !historical) return null;

  const getDiffIcon = (diff) => {
    if (diff > 0.5) return <TrendingUp size={14} className="diff-up" />;
    if (diff < -0.5) return <TrendingDown size={14} className="diff-down" />;
    return <Minus size={14} className="diff-neutral" />;
  };

  const currentYear = new Date().getFullYear();

  const insightText = historical.tempDiff > 1
    ? t('ttWarmerInsight', historical.tempDiff.toFixed(1), selectedPeriod)
    : historical.tempDiff < -1
    ? t('ttCoolerInsight', Math.abs(historical.tempDiff).toFixed(1), selectedPeriod)
    : t('ttStableInsight', selectedPeriod);

  return (
    <div className="time-travel glass-panel animate-fade-in-up stagger-6">
      <div className="tt-header">
        <h3 className="tt-title"><Clock size={16} /> {t('ttTitle')}</h3>
        <div className="tt-tabs">
          {periods.map(p => (
            <button
              key={p.years}
              className={`tt-tab ${selectedPeriod === p.years ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(p.years)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="tt-subtitle">{t('ttSubtitle')} <strong>{currentYear - selectedPeriod}</strong></p>

      <div className="tt-comparison">
        <div className="tt-col">
          <span className="tt-col-label">{t('today')}</span>
          <span className="tt-col-value">{Math.round(current.main.temp)}{unitSym}</span>
          <span className="tt-col-sub">{current.main.humidity}% {t('ttHumidity')}</span>
        </div>
        <div className="tt-diff-col">
          <div className="tt-diff-badge">
            {getDiffIcon(historical.tempDiff)}
            <span>{historical.tempDiff > 0 ? '+' : ''}{historical.tempDiff.toFixed(1)}°</span>
          </div>
        </div>
        <div className="tt-col">
          <span className="tt-col-label">{currentYear - selectedPeriod}</span>
          <span className="tt-col-value">{Math.round(historical.temp)}{unitSym}</span>
          <span className="tt-col-sub">{Math.round(historical.humidity)}% {t('ttHumidity')}</span>
        </div>
      </div>

      <div className="tt-insight">{insightText}</div>
    </div>
  );
}
