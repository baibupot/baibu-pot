import React, { useState } from 'react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cookieConsent',
      analytics: true,
      marketing: true,
    });
    setIsVisible(false);
  };

  const handleDecline = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cookieConsent',
      analytics: false,
      marketing: false,
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#000', color: '#fff', padding: '10px', textAlign: 'center' }}>
      <p>Bu web sitesi çerezleri kullanır. Devam ederek çerez kullanımını kabul etmiş olursunuz.</p>
      <button onClick={handleAccept} style={{ margin: '0 10px', padding: '5px 10px', background: 'green', color: '#fff', border: 'none', cursor: 'pointer' }}>Kabul Et</button>
      <button onClick={handleDecline} style={{ margin: '0 10px', padding: '5px 10px', background: 'red', color: '#fff', border: 'none', cursor: 'pointer' }}>Reddet</button>
    </div>
  );
};

export default CookieBanner;
