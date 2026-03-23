import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useI18n } from '../I18nContext';
import { Globe, ChevronDown } from 'lucide-react';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { lang, changeLang, langs } = useI18n();
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);

  const updatePosition = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleOutsideClick = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    // Small delay so the opening click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  const handleSelectLang = (code) => {
    changeLang(code);
    setOpen(false);
  };

  // Portal-rendered dropdown — always on top
  const dropdown = open
    ? ReactDOM.createPortal(
        <div
          className="lang-dropdown animate-fade-in"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            right: dropdownPos.right,
          }}
        >
          {Object.entries(langs).map(([code, label]) => (
            <button
              key={code}
              type="button"
              className={`lang-option ${lang === code ? 'active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelectLang(code); }}
            >
              <span>{label}</span>
              {lang === code && <span className="lang-check">✓</span>}
            </button>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <div className="lang-switcher">
      <button
        ref={btnRef}
        className="lang-btn"
        onClick={() => setOpen(prev => !prev)}
        id="lang-switcher-btn"
        type="button"
      >
        <Globe size={15} />
        <span>{langs[lang]}</span>
        <ChevronDown size={13} className={`lang-chevron ${open ? 'open' : ''}`} />
      </button>
      {dropdown}
    </div>
  );
}
