import React, { useState, useEffect } from 'react';
import { Cookie, Check, X, Shield, Settings } from 'lucide-react';

declare global {
  interface Window {
    dataLayer: any[];
    clarity: any;
  }
}

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    const consentData = {
      essential: true,
      analytics: type === 'all',
      marketing: type === 'all',
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    
    // Google Tag Manager consent
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cookieConsent',
      analytics: consentData.analytics,
      marketing: consentData.marketing,
    });

    // Microsoft Clarity consent and loading
    if (consentData.analytics) {
      // Load Microsoft Clarity if not already loaded
      if (!window.clarity) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.clarity.ms/tag/sp5g0oh86d';
        document.head.appendChild(script);
      } else {
        window.clarity('consent');
      }
    }
    
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon & Content */}
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-full flex-shrink-0">
                <Cookie className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-600" />
                  Çerez Tercihleri
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bu web sitesi, deneyiminizi geliştirmek ve hizmetlerimizi optimize etmek için çerezler kullanmaktadır. 
                  {!showDetails && (
                    <button 
                      onClick={() => setShowDetails(true)}
                      className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 underline ml-1 font-medium"
                    >
                      Detayları görüntüle
                    </button>
                  )}
                </p>
                
                {showDetails && (
                  <div className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span><strong>Gerekli Çerezler:</strong> Site işlevselliği için zorunludur</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-3 w-3 text-blue-500" />
                      <span><strong>Analitik Çerezler:</strong> Google Analytics ve Microsoft Clarity ile site kullanımını anlamamızı sağlar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-3 w-3 text-purple-500" />
                      <span><strong>Microsoft Clarity:</strong> Kullanıcı davranışlarını analiz etmek için kullanılır</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleAccept('essential')}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-200 dark:border-slate-700"
              >
                Sadece Gerekli
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-all duration-200 border border-cyan-200 dark:border-cyan-800"
              >
                {showDetails ? 'Detayları Gizle' : 'Detayları Görüntüle'}
              </button>
              <button
                onClick={() => handleAccept('all')}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
