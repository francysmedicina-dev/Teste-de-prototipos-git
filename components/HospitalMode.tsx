
import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight, ChevronDown, Copy, Check, Siren, Syringe, Activity, AlertTriangle } from 'lucide-react';
import { MedicalProtocol } from '../types';
import { getProtocols } from '../services/protocolService';

interface HospitalModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const HospitalMode: React.FC<HospitalModeProps> = ({ isOpen, onClose }) => {
  const [protocols, setProtocols] = useState<MedicalProtocol[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHospitalProtocols();
    }
  }, [isOpen]);

  const loadHospitalProtocols = () => {
    // Filter specifically for "Hospitalar" category
    const all = getProtocols();
    const hospitalProtocols = all.filter(p => p.category === 'Hospitalar');
    setProtocols(hospitalProtocols);
  };

  const handleCopy = (protocol: MedicalProtocol, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Format text for EHR/Prontuário
    let text = `[PROTOCOLO: ${protocol.name}]\n`;
    text += `${protocol.subcategory}\n\n`;
    
    text += `MEDICAMENTOS:\n`;
    protocol.medications.forEach(m => {
        text += `- ${m.name} ${m.dosage} (${m.unit})\n`;
        text += `  Via: ${m.frequency} | Diluição/Dose: ${m.instructions}\n`;
    });

    if (protocol.customInstructions) {
        text += `\nORIENTAÇÕES/DILUIÇÃO:\n${protocol.customInstructions}`;
    }

    navigator.clipboard.writeText(text);
    setCopiedId(protocol.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProtocols = protocols.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.medications.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border-2 border-red-500 animate-in zoom-in-95 duration-200 overflow-hidden relative">
        
        {/* Header - Red Theme */}
        <div className="bg-red-600 text-white p-6 flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <Siren className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-wide">Sala Vermelha</h2>
                    <p className="text-red-100 text-sm font-medium">Guia de Prescrição Intra-Hospitalar e Emergência</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            >
                <X className="h-6 w-6" />
            </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-red-50 dark:bg-gray-900 border-b border-red-100 dark:border-gray-700">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400" />
                <input 
                    type="text" 
                    placeholder="Buscar protocolo (ex: Intubação, Sedação, Noradrenalina)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 p-4 rounded-lg border-2 border-red-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none placeholder-red-300 dark:placeholder-gray-500 shadow-sm"
                    autoFocus
                />
            </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50 dark:bg-gray-900/50">
            {filteredProtocols.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <Activity className="h-16 w-16 mb-4 text-red-200 dark:text-gray-700" />
                    <p className="text-lg font-medium">Nenhum protocolo hospitalar encontrado.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredProtocols.map(protocol => {
                        const isExpanded = expandedProtocolId === protocol.id;
                        
                        return (
                            <div key={protocol.id} className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 shadow-sm transition-all ${isExpanded ? 'border-l-red-600 border-y border-r border-gray-200 dark:border-gray-700' : 'border-l-red-300 border border-gray-100 dark:border-gray-700 hover:border-l-red-500'}`}>
                                
                                {/* Accordion Header */}
                                <div 
                                    onClick={() => setExpandedProtocolId(isExpanded ? null : protocol.id)}
                                    className="p-5 flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                                            {protocol.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{protocol.name}</h3>
                                            <p className="text-sm text-red-500 dark:text-red-300 font-medium">{protocol.subcategory}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                         {/* Quick Copy Button (Visible on collapsed) */}
                                         <button
                                            onClick={(e) => handleCopy(protocol, e)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Copiar Texto"
                                        >
                                            {copiedId === protocol.id ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                        </button>
                                        {isExpanded ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-700">
                                        
                                        {/* Instructions Box */}
                                        {protocol.customInstructions && (
                                            <div className="mb-6 bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                                                <h4 className="text-xs font-bold text-red-800 dark:text-red-300 uppercase mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" /> Diluição / Instruções Críticas
                                                </h4>
                                                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed font-medium">
                                                    {protocol.customInstructions}
                                                </p>
                                            </div>
                                        )}

                                        {/* Medications List */}
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                            <Syringe className="h-4 w-4" /> Medicamentos & Doses
                                        </h4>
                                        <div className="space-y-3">
                                            {protocol.medications.map((m, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white text-base">
                                                            {m.name} <span className="text-gray-500 font-normal text-sm">{m.dosage}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Apresentação Ref: {m.unit}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 sm:mt-0 text-right">
                                                        <div className="inline-block px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm font-mono font-bold text-gray-800 dark:text-gray-200">
                                                            {m.frequency} {/* Route/Via in Hospital Mode usually stored here or instruction */}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xs sm:ml-auto">
                                                            {m.instructions}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={(e) => handleCopy(protocol, e)}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm shadow-sm transition-all ${
                                                    copiedId === protocol.id 
                                                    ? 'bg-green-600 text-white' 
                                                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                {copiedId === protocol.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                {copiedId === protocol.id ? 'Copiado para Prontuário!' : 'Copiar Texto para Prontuário'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HospitalMode;