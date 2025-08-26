'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookiesAccepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-700 leading-relaxed">
            Usamos cookies no nosso site para ver como você interage com ele. Ao aceitar, você concorda com o uso de cookies.{' '}
            <a 
              href="https://www.falqon.com.br/politica-de-privacidade" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Política de Privacidade
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2">
                     <Button
             size="sm"
             onClick={handleAccept}
             className="bg-orange-500 hover:bg-orange-600 text-white"
           >
             Aceitar
           </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDecline}
            className="p-1 h-8 w-8"
            style={{ opacity: 0.2 }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
