
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Monitor, Info } from 'lucide-react';

const STORAGE_KEY = 'prescriber_disclaimer_dismissed_ts';
const EXPIRATION_HOURS = 24;

export const DisclaimerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timestamp = localStorage.getItem(STORAGE_KEY);
    if (!timestamp) {
      setIsVisible(true);
    } else {
      // Check if 24 hours have passed since dismissal
      const diffInHours = (Date.now() - parseInt(timestamp, 10)) / (1000 * 60 * 60);
      if (diffInHours > EXPIRATION_HOURS) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-600 p-4 mb-6 rounded-r-lg shadow-sm animate-in slide-in-from-top-2 duration-500 no-print">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-amber-100 dark:bg-amber-800/40 rounded-full shrink-0">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        
        <div className="flex-1 space-y-3">
          {/* Legal Disclaimer */}
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
              Aviso Legal Importante
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1 leading-relaxed">
              Este site oferece apenas sugestões de protocolos baseados em literatura médica. 
              <span className="font-semibold"> O julgamento clínico e a responsabilidade final pela assinatura da receita são, e sempre serão, intransferíveis do médico.</span>
            </p>
          </div>

          {/* Usability Hint */}
          <div className="flex items-start gap-2 pt-2 border-t border-amber-200 dark:border-amber-800/50">
            <Monitor className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 italic">
              <span className="font-semibold not-italic">Dica de Visualização:</span> Para uma melhor experiência e visualização das receitas, recomendamos o uso em PC ou Tablet. Estamos trabalhando na melhoria da versão para celular.
            </p>
          </div>
        </div>

        <button 
          onClick={handleDismiss}
          className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-200 transition-colors p-1"
          title="Fechar aviso"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
