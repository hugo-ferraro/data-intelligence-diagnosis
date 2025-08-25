import React from 'react';
import falqonLogo from '@/assets/falqon-logo.png';

const Header = () => {
  return (
    <header className="w-full bg-gradient-to-r from-brand-1 to-brand-2 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={falqonLogo.src}
            alt="Falqon Logo"
            className="h-10 w-10 rounded-full bg-white p-1"
          />
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Diagnóstico de Maturidade em Dados
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;