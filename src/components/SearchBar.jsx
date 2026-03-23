import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, MapPin, X } from 'lucide-react';
import { useWeather } from '../WeatherContext';
import { useI18n } from '../I18nContext';
import './SearchBar.css';

export default function SearchBar() {
  const { searchLocation, changeLocation } = useWeather();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const barRef = useRef(null);
  const debounceRef = useRef(null);

  // Update dropdown position whenever the search bar changes
  const updatePosition = () => {
    if (barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 10,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const data = await searchLocation(query);
      setResults(data);
      setIsOpen(true);
      updatePosition();
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, searchLocation]);

  useEffect(() => {
    if (focused) updatePosition();
  }, [focused]);

  const handleSelect = (loc) => {
    changeLocation(loc);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // Portal-rendered dropdown — renders at document.body level so it's ALWAYS on top
  const dropdown = isOpen && results.length > 0
    ? ReactDOM.createPortal(
        <ul
          className="search-results animate-fade-in"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lon}-${i}`} onMouseDown={() => handleSelect(r)} className="search-result-item">
              <MapPin size={16} />
              <span className="result-name">{r.name}</span>
              {r.state && <span className="result-state">, {r.state}</span>}
              <span className="result-country">{r.country}</span>
            </li>
          ))}
        </ul>,
        document.body
      )
    : null;

  // Portal-rendered backdrop
  const backdrop = focused
    ? ReactDOM.createPortal(
        <div
          className="search-backdrop"
          onClick={() => { setFocused(false); setIsOpen(false); inputRef.current?.blur(); }}
        />,
        document.body
      )
    : null;

  return (
    <>
      {backdrop}
      <div className={`search-bar-container ${focused ? 'focused' : ''}`} ref={barRef}>
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => { setFocused(false); setIsOpen(false); }, 250)}
            className="search-input"
            id="global-search-input"
          />
          {query && (
            <button className="search-clear" onClick={handleClear} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      {dropdown}
    </>
  );
}
