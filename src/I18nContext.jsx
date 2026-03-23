import React, { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    // Header
    brandName: 'Aakash',
    brandSub: 'Weather',
    searchPlaceholder: 'Search any city worldwide...',
    // Current Weather
    feelsLike: 'Feels Like',
    humidity: 'Humidity',
    wind: 'Wind',
    visibility: 'Visibility',
    pressure: 'Pressure',
    sunrise: 'Sunrise',
    // Forecast
    hourlyForecast: 'Hourly Forecast',
    fiveDayForecast: '5-Day Forecast',
    today: 'Today',
    now: 'Now',
    // AI Advisor
    aiTitle: '✨ AI Weather Analyst',
    // AI Tips
    tipHeavyWinter: 'Wear heavy winter layers, gloves, and a hat',
    tipWarmJacket: 'A warm jacket and layered clothing recommended',
    tipLightLayers: 'Light layers or a casual outfit will work great',
    tipBreathable: 'Light, breathable clothing — stay cool and hydrated',
    tipUmbrella: 'Carry an umbrella — rain expected. Avoid open areas.',
    tipLowVis: 'Low visibility — drive carefully, use fog lights',
    tipStrongWind: 'Strong winds — cycling and motorcycling not advised',
    tipPerfectCycling: 'Perfect weather for cycling or a walk outside!',
    tipPoorAir: 'Poor air quality — wear a mask outdoors, limit exposure',
    tipModerateAir: 'Moderate air quality — sensitive groups should be cautious',
    tipGreatExercise: 'Great conditions for outdoor exercise!',
    tipSunscreen: 'Low humidity & clear skies — apply sunscreen if outdoors',
    // Time Travel
    ttTitle: 'Time Travel Weather',
    ttSubtitle: 'Estimated weather on this date in',
    ttHumidity: 'humidity',
    ttWarmerInsight: (diff, years) => `🌡️ It's about ${diff}° warmer today than ${years} years ago — a sign of local climate warming.`,
    ttCoolerInsight: (diff, years) => `❄️ It was warmer ${years} years ago by ${diff}° — climate variability at play.`,
    ttStableInsight: (years) => `🌍 Temperatures have stayed relatively stable over the past ${years} years for this region.`,
    // Map
    mapTitle: 'Live Weather Radar',
    // Footer
    footerPowered: 'Powered by OpenWeatherMap & Windy',
    footerUI: 'Liquid Glass UI',
    // Language
    language: 'Language',
  },
  hi: {
    brandName: 'आकाश',
    brandSub: 'मौसम',
    searchPlaceholder: 'दुनिया में कोई भी शहर खोजें...',
    feelsLike: 'महसूस',
    humidity: 'नमी',
    wind: 'हवा',
    visibility: 'दृश्यता',
    pressure: 'दबाव',
    sunrise: 'सूर्योदय',
    hourlyForecast: 'घंटे का पूर्वानुमान',
    fiveDayForecast: '5 दिन का पूर्वानुमान',
    today: 'आज',
    now: 'अभी',
    aiTitle: '✨ AI मौसम विश्लेषक',
    tipHeavyWinter: 'भारी सर्दियों के कपड़े, दस्ताने और टोपी पहनें',
    tipWarmJacket: 'गर्म जैकेट और परतदार कपड़े पहनें',
    tipLightLayers: 'हल्के कपड़े या कैज़ुअल आउटफ़िट ठीक रहेगा',
    tipBreathable: 'हल्के, सांस लेने वाले कपड़े — ठंडा और हाइड्रेटेड रहें',
    tipUmbrella: 'छाता ले जाएं — बारिश की संभावना है',
    tipLowVis: 'कम दृश्यता — सावधानी से गाड़ी चलाएं, फॉग लाइट्स का उपयोग करें',
    tipStrongWind: 'तेज हवाएं — साइकिल और मोटरसाइकिल चलाना उचित नहीं',
    tipPerfectCycling: 'साइकिल चलाने या बाहर टहलने के लिए बढ़िया मौसम!',
    tipPoorAir: 'खराब वायु गुणवत्ता — बाहर मास्क पहनें',
    tipModerateAir: 'सामान्य वायु गुणवत्ता — संवेदनशील लोग सावधान रहें',
    tipGreatExercise: 'बाहरी व्यायाम के लिए बढ़िया स्थिति!',
    tipSunscreen: 'कम नमी और साफ आसमान — बाहर जाएं तो सनस्क्रीन लगाएं',
    ttTitle: 'टाइम ट्रैवल मौसम',
    ttSubtitle: 'इस तारीख का अनुमानित मौसम वर्ष',
    ttHumidity: 'नमी',
    ttWarmerInsight: (diff, years) => `🌡️ आज ${years} साल पहले से लगभग ${diff}° अधिक गर्म है — स्थानीय जलवायु गर्मी का संकेत।`,
    ttCoolerInsight: (diff, years) => `❄️ ${years} साल पहले ${diff}° अधिक गर्म था — जलवायु परिवर्तनशीलता।`,
    ttStableInsight: (years) => `🌍 इस क्षेत्र में पिछले ${years} वर्षों में तापमान अपेक्षाकृत स्थिर रहा है।`,
    mapTitle: 'लाइव मौसम रडार',
    footerPowered: 'OpenWeatherMap और Windy द्वारा संचालित',
    footerUI: 'लिक्विड ग्लास UI',
    language: 'भाषा',
  },
  od: {
    brandName: 'ଆକାଶ',
    brandSub: 'ପାଣିପାଗ',
    searchPlaceholder: 'ଦୁନିଆର ଯେକୌଣସି ସହର ଖୋଜନ୍ତୁ...',
    feelsLike: 'ଅନୁଭବ',
    humidity: 'ଆର୍ଦ୍ରତା',
    wind: 'ବାୟୁ',
    visibility: 'ଦୃଶ୍ୟତା',
    pressure: 'ଚାପ',
    sunrise: 'ସୂର୍ଯ୍ୟୋଦୟ',
    hourlyForecast: 'ଘଣ୍ଟାବାର ପୂର୍ବାନୁମାନ',
    fiveDayForecast: '୫ ଦିନର ପୂର୍ବାନୁମାନ',
    today: 'ଆଜି',
    now: 'ବର୍ତ୍ତମାନ',
    aiTitle: '✨ AI ପାଣିପାଗ ବିଶ୍ଳେଷକ',
    tipHeavyWinter: 'ଭାରି ଶୀତ ପୋଷାକ, ହାତମୋଜା ଏବଂ ଟୋପି ପିନ୍ଧନ୍ତୁ',
    tipWarmJacket: 'ଗରମ ଜ୍ୟାକେଟ୍ ଏବଂ ସ୍ତରବିଶିଷ୍ଟ ପୋଷାକ ପରାମର୍ଶିତ',
    tipLightLayers: 'ହାଲୁକା ପୋଷାକ କିମ୍ବା କ୍ୟାଜୁଆଲ ଆଉଟଫିଟ୍ ଭଲ ରହିବ',
    tipBreathable: 'ହାଲୁକା ପୋଷାକ — ଥଣ୍ଡା ଏବଂ ହାଇଡ୍ରେଟେଡ୍ ରୁହନ୍ତୁ',
    tipUmbrella: 'ଛତା ନିଅନ୍ତୁ — ବର୍ଷା ସମ୍ଭାବନା ଅଛି',
    tipLowVis: 'କମ୍ ଦୃଶ୍ୟତା — ସାବଧାନରେ ଗାଡ଼ି ଚଲାନ୍ତୁ',
    tipStrongWind: 'ପ୍ରବଳ ବାୟୁ — ସାଇକେଲ ଏବଂ ମୋଟରସାଇକେଲ ଚଲାଇବା ଉଚିତ୍ ନୁହେଁ',
    tipPerfectCycling: 'ସାଇକେଲ ଚଲାଇବା ବା ବୁଲିବା ପାଇଁ ଉତ୍ତମ ପାଣିପାଗ!',
    tipPoorAir: 'ଖରାପ ବାୟୁ ଗୁଣବତ୍ତା — ବାହାରେ ମାସ୍କ ପିନ୍ଧନ୍ତୁ',
    tipModerateAir: 'ସାଧାରଣ ବାୟୁ ଗୁଣବତ୍ତା — ସମ୍ବେଦନଶୀଳ ଲୋକମାନେ ସତର୍କ ରୁହନ୍ତୁ',
    tipGreatExercise: 'ବାହ୍ୟ ବ୍ୟାୟାମ ପାଇଁ ଉତ୍ତମ ପରିସ୍ଥିତି!',
    tipSunscreen: 'କମ୍ ଆର୍ଦ୍ରତା ଏବଂ ପରିଷ୍କାର ଆକାଶ — ସନସ୍କ୍ରିନ୍ ଲଗାନ୍ତୁ',
    ttTitle: 'ଟାଇମ୍ ଟ୍ରାଭେଲ୍ ପାଣିପାଗ',
    ttSubtitle: 'ଏହି ତାରିଖର ଅନୁମାନିତ ପାଣିପାଗ ବର୍ଷ',
    ttHumidity: 'ଆର୍ଦ୍ରତା',
    ttWarmerInsight: (diff, years) => `🌡️ ଆଜି ${years} ବର୍ଷ ଆଗରୁ ପ୍ରାୟ ${diff}° ଅଧିକ ଗରମ — ସ୍ଥାନୀୟ ଜଳବାୟୁ ଉତ୍ତାପର ସଙ୍କେତ।`,
    ttCoolerInsight: (diff, years) => `❄️ ${years} ବର୍ଷ ଆଗେ ${diff}° ଅଧିକ ଗରମ ଥିଲା — ଜଳବାୟୁ ପରିବର୍ତ୍ତନଶୀଳତା।`,
    ttStableInsight: (years) => `🌍 ଏହି ଅଞ୍ଚଳରେ ଗତ ${years} ବର୍ଷରେ ତାପମାତ୍ରା ସ୍ଥିର ରହିଛି।`,
    mapTitle: 'ଲାଇଭ ପାଣିପାଗ ରଡାର',
    footerPowered: 'OpenWeatherMap ଏବଂ Windy ଦ୍ୱାରା ସଞ୍ଚାଳିତ',
    footerUI: 'ଲିକ୍ୱିଡ୍ ଗ୍ଲାସ୍ UI',
    language: 'ଭାଷା',
  }
};

const LANG_LABELS = {
  en: 'English',
  hi: 'हिन्दी',
  od: 'ଓଡ଼ିଆ',
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = useCallback((key, ...args) => {
    const val = translations[lang]?.[key] || translations.en[key] || key;
    if (typeof val === 'function') return val(...args);
    return val;
  }, [lang]);

  const changeLang = useCallback((newLang) => {
    if (translations[newLang]) setLang(newLang);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, changeLang, langs: LANG_LABELS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be inside I18nProvider');
  return ctx;
}
