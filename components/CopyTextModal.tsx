import React, { useState, useEffect } from 'react';
import { X, Copy, FileText, Check, Clipboard } from 'lucide-react';
import { Medication } from '../types';

interface CopyTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Partial<Medication>[];
  customInstructions?: string;
}

const CopyTextModal: React.FC<CopyTextModalProps> = ({ isOpen, onClose, medications, customInstructions }) => {
  const [text, setText] = useState('');
  const [copiedState, setCopiedState] = useState<'none' | 'all' | 'meds'>('none');

  // Formatting Logic - Updated to new requested format
  const generateMedicationText = (meds: Partial<Medication>[]) => {
    // Default header for oral route as per example request
    const header = "(VIA ORAL)";
    
    const medsList = meds.map(m => {
      // Line 1: Name Dosage---------- Quantity Unit
      const nameAndDose = `${m.name || 'Medicamento'} ${m.dosage || ''}`.trim();
      const qtyUnit = `${m.quantity || '1'} ${m.unit || 'Unidade(s)'}`;
      const line1 = `${nameAndDose}---------- ${qtyUnit}`;
      
      // Line 2: Posologia: Frequency, Duration
      // Clean up punctuation to ensure nice comma separation
      const freq = m.frequency || 'Conforme orientação';
      const dur = m.duration || 'Uso contínuo';
      const line2 = `Posologia: ${freq}, ${dur}`;
      
      // Line 3: Instructions (Optional)
      const line3 = m.instructions ? `Instruções especiais: ${m.instructions}` : null;

      return [line1, line2, line3].filter(Boolean).join('\n');
    }).join('\n\n');

    return `${header}\n\n${medsList}`;
  };

  useEffect(() => {
    if (isOpen) {
      const medsText = generateMedicationText(medications);
      let fullText = medsText;
      
      if (customInstructions && customInstructions.trim()) {
        fullText += `\n\nOrientações Gerais:\n${customInstructions}`;
      }
      
      setText(fullText);
      setCopiedState('none');
    }
  }, [isOpen, medications, customInstructions]);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState('all');
      setTimeout(() => setCopiedState('none'), 3000);
    } catch (err) {
      alert('Erro ao copiar para a área de transferência.');
    }
  };

  const handleCopyMedsOnly = async () => {
    try {
      const medsText = generateMedicationText(medications);
      await navigator.clipboard.writeText(medsText);
      setCopiedState('meds');
      setTimeout(() => setCopiedState('none'), 3000);
    } catch (err) {
      alert('Erro ao copiar para a área de transferência.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <Clipboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Copiar como Texto</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            O texto abaixo está formatado para sistemas hospitalares. Você pode editá-lo antes de copiar.
          </p>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none custom-scrollbar resize-none leading-relaxed"
            placeholder="Texto da prescrição..."
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCopyAll}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
            >
              {copiedState === 'all' ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copiedState === 'all' ? 'Copiado!' : 'Copiar Texto Completo'}
            </button>
            
            <button
              onClick={handleCopyMedsOnly}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors shadow-sm"
            >
              {copiedState === 'meds' ? <Check className="h-5 w-5 text-green-600" /> : <FileText className="h-5 w-5" />}
              {copiedState === 'meds' ? 'Meds Copiados!' : 'Copiar somente medicamentos'}
            </button>
          </div>
          
          {(copiedState === 'all' || copiedState === 'meds') && (
             <p className="text-center text-xs text-green-600 dark:text-green-400 font-medium animate-in fade-in">
                Texto copiado para a área de transferência.
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopyTextModal;