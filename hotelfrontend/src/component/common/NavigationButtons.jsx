import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NavigationButtons = () => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCanGoBack(window.history.state && window.history.length > 1);
    if (!window._forwardStack) window._forwardStack = [];
    const handlePopState = () => {
      setCanGoBack(window.history.state && window.history.length > 1);
      setCanGoForward(window._forwardStack.length > 0);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      window._forwardStack = window._forwardStack || [];
      window._forwardStack.push(window.location.pathname + window.location.search);
      window.history.back();
      setTimeout(() => setCanGoForward(window._forwardStack.length > 0), 100);
    }
  };

  const handleForward = () => {
    if (canGoForward && window._forwardStack && window._forwardStack.length > 0) {
      const next = window._forwardStack.pop();
      if (next) {
        navigate(next);
        setTimeout(() => setCanGoForward(window._forwardStack.length > 0), 100);
      }
    }
  };

  return (
    <div
      className="nav-buttons-global"
      style={{
        position: 'fixed',
        left: '16px',
        top: '80px', // Posicionando abaixo do logo
        zIndex: 1200,
        display: 'flex',
        gap: 8,
        padding: '8px',
        alignItems: 'center',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={handleBack}
        disabled={!canGoBack}
        style={{
          background: 'none',
          border: 'none', // removendo borda
          borderRadius: '50%',
          cursor: canGoBack ? 'pointer' : 'not-allowed',
          opacity: canGoBack ? 1 : 0.3,
          fontSize: 24,
          padding: 4,
          transition: 'opacity 0.2s',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Voltar"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#007F86" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button
        onClick={handleForward}
        disabled={!canGoForward}
        style={{
          background: 'none',
          border: 'none', // removendo borda
          borderRadius: '50%',
          cursor: canGoForward ? 'pointer' : 'not-allowed',
          opacity: canGoForward ? 1 : 0.3,
          fontSize: 24,
          padding: 4,
          transition: 'opacity 0.2s',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Avançar"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#007F86" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
    </div>
  );
};

export default NavigationButtons;
