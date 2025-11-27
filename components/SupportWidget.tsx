
import React, { useState } from 'react';
import { Heart, X, Copy, Check, Instagram, Coffee } from 'lucide-react';

const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pixKey = "prescreveaisite@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 no-print">
      
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 origin-bottom-right">
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex justify-between items-start">
            <div className="text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 fill-current" /> Gostou do Prescreve.AI?
              </h3>
              <p className="text-indigo-100 text-xs mt-1">Seu apoio é muito importante!</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-indigo-200 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                Este app foi criado por <span className="font-bold text-gray-900 dark:text-white">Francys de Luca</span> para facilitar a vida do médico nos plantões.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span>Sugestões? Me chame no Instagram:</span>
              </div>
              <a 
                href="https://instagram.com/Francys.med" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline mt-1"
              >
                <Instagram className="h-4 w-4" /> @Francys.med
              </a>
            </div>

            {/* Donation Section */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
              <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Coffee className="h-4 w-4" /> Apoie o Projeto
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Ajude a manter o site no ar! Doe qualquer valor via PIX:
              </p>
              
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1 pl-3">
                <span className="flex-1 text-xs font-mono text-gray-600 dark:text-gray-400 truncate select-all">
                  {pixKey}
                </span>
                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-md transition-all duration-200 flex items-center gap-1 text-xs font-bold ${
                    copied 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center justify-center 
          bg-indigo-600 hover:bg-indigo-700 text-white 
          shadow-lg hover:shadow-indigo-500/30 
          transition-all duration-300 
          rounded-full
          h-14 w-14 md:w-auto md:px-6
        `}
        title="Apoie o Projeto"
      >
        <Heart className={`h-6 w-6 ${isOpen ? 'fill-current' : ''} transition-transform group-hover:scale-110`} />
        
        {/* Text visible only on medium screens and up */}
        <span className="hidden md:inline-block ml-2 font-bold text-sm whitespace-nowrap">
          Apoie o Projeto
        </span>
      </button>

    </div>
  );
};

export default SupportWidget;
