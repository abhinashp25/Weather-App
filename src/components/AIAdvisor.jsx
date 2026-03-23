import React, { useMemo } from 'react';
import { useWeather } from '../WeatherContext';
import { useI18n } from '../I18nContext';
import { Wind, AlertTriangle, Smile, Frown, Meh, Shirt, Umbrella, Car, Bike, Footprints } from 'lucide-react';
import './AIAdvisor.css';

const AQI_LABELS = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
const AQI_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#7c3aed'];

export default function AIAdvisor() {
  const { current, airQuality, unit } = useWeather();
  const { t } = useI18n();

  const insights = useMemo(() => {
    if (!current) return [];

    const temp = current.main.temp;
    const weather = current.weather[0].main;
    const wind = current.wind.speed;
    const humidity = current.main.humidity;
    const visibility = current.visibility;
    const aqi = airQuality?.list?.[0]?.main?.aqi || 1;

    const tips = [];

    // Clothing
    if (unit === 'metric') {
      if (temp < 5) tips.push({ icon: <Shirt size={16} />, text: t('tipHeavyWinter'), cat: 'outfit' });
      else if (temp < 15) tips.push({ icon: <Shirt size={16} />, text: t('tipWarmJacket'), cat: 'outfit' });
      else if (temp < 25) tips.push({ icon: <Shirt size={16} />, text: t('tipLightLayers'), cat: 'outfit' });
      else tips.push({ icon: <Shirt size={16} />, text: t('tipBreathable'), cat: 'outfit' });
    } else {
      if (temp < 40) tips.push({ icon: <Shirt size={16} />, text: t('tipHeavyWinter'), cat: 'outfit' });
      else if (temp < 60) tips.push({ icon: <Shirt size={16} />, text: t('tipWarmJacket'), cat: 'outfit' });
      else if (temp < 77) tips.push({ icon: <Shirt size={16} />, text: t('tipLightLayers'), cat: 'outfit' });
      else tips.push({ icon: <Shirt size={16} />, text: t('tipBreathable'), cat: 'outfit' });
    }

    if (['Rain', 'Drizzle', 'Thunderstorm'].includes(weather)) {
      tips.push({ icon: <Umbrella size={16} />, text: t('tipUmbrella'), cat: 'travel' });
    }

    if (visibility < 2000) {
      tips.push({ icon: <Car size={16} />, text: t('tipLowVis'), cat: 'commute' });
    }
    if (wind > 15) {
      tips.push({ icon: <Wind size={16} />, text: t('tipStrongWind'), cat: 'commute' });
    } else if (weather === 'Clear' && temp > 15 && temp < 30) {
      tips.push({ icon: <Bike size={16} />, text: t('tipPerfectCycling'), cat: 'commute' });
    }

    if (aqi >= 4) {
      tips.push({ icon: <AlertTriangle size={16} />, text: t('tipPoorAir'), cat: 'health' });
    } else if (aqi >= 3) {
      tips.push({ icon: <Meh size={16} />, text: t('tipModerateAir'), cat: 'health' });
    }

    if (weather === 'Clear' && wind < 10 && aqi <= 2) {
      tips.push({ icon: <Footprints size={16} />, text: t('tipGreatExercise'), cat: 'activity' });
    }

    if (weather === 'Clear' && humidity < 40) {
      tips.push({ icon: <Smile size={16} />, text: t('tipSunscreen'), cat: 'health' });
    }

    return tips;
  }, [current, airQuality, unit, t]);

  const aqi = airQuality?.list?.[0]?.main?.aqi || 1;

  if (!current) return null;

  return (
    <div className="ai-advisor glass-panel animate-fade-in-up stagger-5">
      <div className="ai-header">
        <h3 className="ai-title">{t('aiTitle')}</h3>
        <div className="ai-aqi-badge" style={{ background: `${AQI_COLORS[aqi - 1]}22`, color: AQI_COLORS[aqi - 1], borderColor: `${AQI_COLORS[aqi - 1]}44` }}>
          AQI: {AQI_LABELS[aqi - 1]}
        </div>
      </div>

      <div className="ai-insights">
        {insights.map((tip, i) => (
          <div className="ai-tip" key={i} data-category={tip.cat}>
            <div className="ai-tip-icon">{tip.icon}</div>
            <span className="ai-tip-text">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
