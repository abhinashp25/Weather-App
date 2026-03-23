# Aakash Weather

A weather application built with React and Three.js, featuring a glassmorphic UI and context-aware weather intelligence. Designed with professional-grade components and a focus on detailed weather information and actionable insights.

## Features

**Time Travel Weather Comparison**
- View estimated weather conditions from 10, 25, or 50 years ago using seeded algorithmic generation
- See local climate trends with temperature variance analysis
- Understand how conditions have shifted over decades without relying on historical APIs

**AI-Powered Weather Advisor**
- Clothing recommendations based on temperature ranges and conditions (heavy winter layers, light jackets, breathable fabrics)
- Activity suggestions tied to wind, humidity, and air quality
- Smart commute tips considering visibility, wind speed, and weather phenomena
- Real-time air quality index (AQI) display with health advisories
- Recommendations adapt to metric/imperial units

**WebGL 3D Weather Effects**
- Dynamic Three.js particle systems with weather-specific configurations
- Rain rendered as falling lines (800 particles, 0.08 speed)
- Snow with larger, slower particles (500 particles, 0.015 speed)
- Thunderstorms with increased particle density and faster motion
- Clear skies with subtle floating particles
- Responsive rendering at native device pixel ratio (capped at 2x)

**Glassmorphic UI Design**
- Built entirely with vanilla CSS using custom properties
- Backdrop filter effects with layered transparency
- Responsive grid layout (2-column on desktop, staggered animations)
- Smooth fade-in animations with staggered timing
- Clean typography with gradient text effects

**Multi-Language Support**
- Full translations: English, Hindi (हिन्दी), and Odia (ଓଡ଼ିଆ)
- Dynamic language switching without page reload
- Context-aware translations for all weather conditions and recommendations

**Complete Weather Coverage**
- Current conditions (temperature, feels-like, humidity, wind, visibility, pressure)
- Hourly forecast
- 5-day forecast
- Live precipitation radar
- Air quality monitoring
- Sunrise/sunset times
- Geolocation support with reverse geocoding

## Getting Started

### Requirements

- Node.js 18 or higher
- OpenWeatherMap API key (free tier available)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/aakash-weather.git
   cd aakash-weather
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your OpenWeatherMap API key:
     ```
     VITE_OPENWEATHER_API_KEY=your_api_key
     ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

---

## 🛠️ Tech Stack
## Architecture

**State Management**
- WeatherContext handles all weather data, location state, and unit toggling
- Geolocation on mount with fallback to default location
- Promise.all() for parallel API calls (current, forecast, air quality)

**Component Structure**
- Modular, single-responsibility components
- SearchBar with city autocomplete and rate limiting
- Separate panels for current, forecast, advice, radar, and time travel
- Satellite background and WebGL effects as base layers

**API Integration**
- OpenWeatherMap for all data (weather, forecast, geolocation, air quality)
- Single API key for all endpoints
- Proper error handling and user feedback

## Tech Stack

- React 19 with Hooks (useState, useContext, useMemo, useCallback, useEffect)
- Vite for fast development and optimized builds
- Three.js for WebGL particle systems
- Lucide-React for consistent iconography
- Vanilla CSS with CSS Grid and Flexbox
- OpenWeatherMap API (free tier compatible)

## Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build

## License

MIT