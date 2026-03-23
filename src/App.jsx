import React from 'react';
import { WeatherProvider, useWeather } from './WeatherContext';
import { I18nProvider, useI18n } from './I18nContext';
import SatelliteBackground from './components/SatelliteBackground';
import WebGLWeatherEffects from './components/WebGLWeatherEffects';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import ForecastPanel from './components/ForecastPanel';
import AIAdvisor from './components/AIAdvisor';
import TimeTravelModule from './components/TimeTravelModule';
import WeatherMap from './components/WeatherMap';
import LanguageSwitcher from './components/LanguageSwitcher';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function AppContent() {
  const { t } = useI18n();
  const { loading } = useWeather();

  return (
    <>
      {/* Loading Animation */}
      {loading && <LoadingScreen />}

      {/* Background layers */}
      <SatelliteBackground />
      <WebGLWeatherEffects />

      {/* Foreground UI */}
      <div className="app-shell">
        {/* Top Bar */}
        <header className="app-header animate-fade-in">
          <div className="app-brand">
            <div className="brand-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="13" stroke="url(#brand-grad)" strokeWidth="2" fill="none" opacity="0.8"/>
                <circle cx="14" cy="14" r="6" fill="url(#brand-grad)" opacity="0.6"/>
                <defs>
                  <linearGradient id="brand-grad" x1="0" y1="0" x2="28" y2="28">
                    <stop stopColor="#6366f1"/>
                    <stop offset="1" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="brand-text">{t('brandName')}</span>
            <span className="brand-sub">{t('brandSub')}</span>
          </div>
          <SearchBar />
          <div className="app-header-right">
            <LanguageSwitcher />
            <span className="header-time">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="app-dashboard">
          <div className="dash-col dash-col-main">
            <CurrentWeather />
            <ForecastPanel />
          </div>
          <div className="dash-col dash-col-side">
            <AIAdvisor />
            <TimeTravelModule />
            <WeatherMap />
          </div>
        </main>

        {/* Footer */}
        <footer className="app-footer animate-fade-in">
          <span>© {new Date().getFullYear()} {t('brandName')} {t('brandSub')}</span>
          <span className="footer-dot">•</span>
          <span>All rights reserved</span>
        </footer>
      </div>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <WeatherProvider>
        <AppContent />
      </WeatherProvider>
    </I18nProvider>
  );
}
