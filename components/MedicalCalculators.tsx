
import React, { useState } from 'react';
import { CalculatorType, CalculatorResult } from '../types';
import { calculateScore } from '../services/calculatorService';
import { generateCalculatorAdvice } from '../services/geminiService';
import { X, Calculator, ArrowRight, Loader2, Copy, Check, FilePlus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface MedicalCalculatorsProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertResult: (text: string) => void;
  patientContext?: string; // e.g. "Paciente 65 anos, masculino"
}

// Configuration for Calculators UI
const CALCULATORS_CONFIG = [
  { id: 'BMI', name: 'IMC (Índice de Massa Corporal)', category: 'Geral' },
  { id: 'CockcroftGault', name: 'Clearance de Creatinina (Cockcroft-Gault)', category: 'Nefrologia' },
  { id: 'Chadsvasc', name: 'CHA₂DS₂-VASc (Risco AVC FA)', category: 'Cardiologia' },
  { id: 'HasBled', name: 'HAS-BLED (Risco Sangramento)', category: 'Cardiologia' },
  { id: 'ChildPugh', name: 'Child-Pugh (Cirrose)', category: 'Hepatologia' },
  { id: 'MELD', name: 'MELD Score', category: 'Hepatologia' },
  { id: 'WellsDVT', name: 'Escore de Wells (TVP)', category: 'Vascular/Urgência' },
  { id: 'CURB65', name: 'CURB-65 (Pneumonia)', category: 'Pneumologia' },
];

const CATEGORIES = ['Todos', 'Geral', 'Cardiologia', 'Pneumologia', 'Hepatologia', 'Nefrologia', 'Vascular/Urgência'];

const MedicalCalculators: React.FC<MedicalCalculatorsProps> = ({ isOpen, onClose, onInsertResult, patientContext }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType | null>(null);
  
  // Dynamic Inputs State
  const [inputs, setInputs] = useState<any>({});
  
  // Results State
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectCalculator = (id: string) => {
    setSelectedCalculator(id as CalculatorType);
    setInputs({});
    setResult(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setInputs((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    if (!selectedCalculator) return;

    // 1. Calculate Score (Math)
    const { score, interpretation } = calculateScore(selectedCalculator, inputs);

    // 2. Generate AI Advice
    setLoadingAi(true);
    const { recommendation } = await generateCalculatorAdvice(
      selectedCalculator, 
      score, 
      inputs, 
      patientContext
    );
    setLoadingAi(false);

    setResult({
      id: uuidv4(),
      type: selectedCalculator,
      score,
      interpretation,
      recommendation,
      timestamp: Date.now(),
      inputs
    });
  };

  const handleInsert = () => {
    if (!result || !selectedCalculator) return;
    const calcName = CALCULATORS_CONFIG.find(c => c.id === selectedCalculator)?.name;
    const text = `\n[CALCULADORA CLÍNICA: ${calcName}]\nResultado: ${result.score}\nInterpretação: ${result.interpretation}\nConduta Sugerida: ${result.recommendation}\n`;
    onInsertResult(text);
    onClose();
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Resultado: ${result.score}\n${result.interpretation}\n${result.recommendation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Render Dynamic Forms ---
  const renderForm = () => {
    switch (selectedCalculator) {
      case 'BMI':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Peso (kg)</label>
              <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.weight || ''} onChange={e => handleInputChange('weight', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Altura (cm ou m)</label>
              <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.height || ''} onChange={e => handleInputChange('height', parseFloat(e.target.value))} />
            </div>
          </div>
        );
      case 'CockcroftGault':
        return (
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Idade</label>
                  <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.age || ''} onChange={e => handleInputChange('age', parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Peso (kg)</label>
                  <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.weight || ''} onChange={e => handleInputChange('weight', parseFloat(e.target.value))} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Creatinina (mg/dL)</label>
                   <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.creatinine || ''} onChange={e => handleInputChange('creatinine', parseFloat(e.target.value))} />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Sexo</label>
                   <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.gender || ''} onChange={e => handleInputChange('gender', e.target.value)}>
                      <option value="">Selecione</option>
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                   </select>
                </div>
            </div>
          </div>
        );
      case 'Chadsvasc':
        return (
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                 <input type="checkbox" checked={inputs.heartFailure || false} onChange={e => handleInputChange('heartFailure', e.target.checked)} className="w-4 h-4 text-blue-600" />
                 <label className="text-sm dark:text-gray-300">Insuficiência Cardíaca Congestiva</label>
             </div>
             <div className="flex items-center gap-2">
                 <input type="checkbox" checked={inputs.hypertension || false} onChange={e => handleInputChange('hypertension', e.target.checked)} className="w-4 h-4 text-blue-600" />
                 <label className="text-sm dark:text-gray-300">Hipertensão</label>
             </div>
             <div className="flex items-center gap-2">
                 <label className="text-sm w-20 dark:text-gray-300">Idade:</label>
                 <input type="number" className="w-20 p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.age || ''} onChange={e => handleInputChange('age', parseFloat(e.target.value))} placeholder="Anos" />
             </div>
             <div className="flex items-center gap-2">
                 <input type="checkbox" checked={inputs.diabetes || false} onChange={e => handleInputChange('diabetes', e.target.checked)} className="w-4 h-4 text-blue-600" />
                 <label className="text-sm dark:text-gray-300">Diabetes</label>
             </div>
             <div className="flex items-center gap-2">
                 <input type="checkbox" checked={inputs.stroke || false} onChange={e => handleInputChange('stroke', e.target.checked)} className="w-4 h-4 text-blue-600" />
                 <label className="text-sm dark:text-gray-300">AVC / AIT Prévio (2 pts)</label>
             </div>
             <div className="flex items-center gap-2">
                 <input type="checkbox" checked={inputs.vascularDisease || false} onChange={e => handleInputChange('vascularDisease', e.target.checked)} className="w-4 h-4 text-blue-600" />
                 <label className="text-sm dark:text-gray-300">Doença Vascular (IAM, DAOP)</label>
             </div>
             <div className="flex items-center gap-2">
                 <label className="text-sm w-20 dark:text-gray-300">Sexo:</label>
                 <select className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.gender || ''} onChange={e => handleInputChange('gender', e.target.value)}>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                 </select>
             </div>
          </div>
        );
      case 'CURB65':
        return (
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                 <input type="checkbox" checked={inputs.confusion || false} onChange={e => handleInputChange('confusion', e.target.checked)} className="w-4 h-4 text-blue-600" />
                 <label className="text-sm dark:text-gray-300">Confusão Mental</label>
             </div>
             <div className="flex items-center gap-2">
                 <label className="text-sm w-32 dark:text-gray-300">Ureia (mg/dL):</label>
                 <input type="number" className="w-20 p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.urea || ''} onChange={e => handleInputChange('urea', parseFloat(e.target.value))} />
             </div>
             <div className="flex items-center gap-2">
                 <label className="text-sm w-32 dark:text-gray-300">Freq. Resp:</label>
                 <input type="number" className="w-20 p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.respRate || ''} onChange={e => handleInputChange('respRate', parseFloat(e.target.value))} placeholder="irpm" />
             </div>
             <div className="flex items-center gap-2">
                 <input type="checkbox" checked={inputs.lowBP || false} onChange={e => handleInputChange('lowBP', e.target.checked)} className="w-4 h-4 text-blue-600" />
                 <label className="text-sm dark:text-gray-300">PAS {'<'} 90 ou PAD {'<='} 60 mmHg</label>
             </div>
             <div className="flex items-center gap-2">
                 <label className="text-sm w-32 dark:text-gray-300">Idade:</label>
                 <input type="number" className="w-20 p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={inputs.age || ''} onChange={e => handleInputChange('age', parseFloat(e.target.value))} placeholder="Anos" />
             </div>
          </div>
        );
      default:
        return <p className="text-gray-500">Selecione uma calculadora para ver os campos.</p>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
           <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <Calculator className="h-5 w-5 text-blue-600" />
                 Calculadoras
              </h2>
           </div>
           
           {/* Categories */}
           <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex gap-2 overflow-x-auto md:flex-wrap">
              {CATEGORIES.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                 >
                   {cat}
                 </button>
              ))}
           </div>

           {/* List */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {CALCULATORS_CONFIG.filter(c => selectedCategory === 'Todos' || c.category === selectedCategory).map(calc => (
                 <button
                   key={calc.id}
                   onClick={() => handleSelectCalculator(calc.id)}
                   className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${selectedCalculator === calc.id ? 'bg-white dark:bg-gray-800 shadow-sm border-l-4 border-blue-600 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                 >
                    <span className="truncate">{calc.name}</span>
                    <ArrowRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 ${selectedCalculator === calc.id ? 'opacity-100 text-blue-600' : ''}`} />
                 </button>
              ))}
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-y-auto custom-scrollbar">
           {selectedCalculator ? (
             <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                         {CALCULATORS_CONFIG.find(c => c.id === selectedCalculator)?.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Preencha os dados abaixo para calcular.</p>
                   </div>
                   <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                      <X className="h-5 w-5 text-gray-500" />
                   </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                   {/* Inputs */}
                   <div className="flex-1 space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                         {renderForm()}
                      </div>
                      
                      <button
                        onClick={handleCalculate}
                        disabled={loadingAi}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                      >
                         {loadingAi ? <Loader2 className="h-5 w-5 animate-spin" /> : "Calcular e Analisar"}
                      </button>
                   </div>

                   {/* Results */}
                   <div className="flex-1">
                      {result ? (
                         <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800 h-full animate-in slide-in-from-right-4 duration-300">
                             <h4 className="text-sm uppercase tracking-wide font-bold text-indigo-800 dark:text-indigo-300 mb-2">Resultado</h4>
                             <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                                {result.score}
                             </div>
                             <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 border-b border-indigo-200 dark:border-indigo-700 pb-4">
                                {result.interpretation}
                             </p>

                             <h4 className="text-sm uppercase tracking-wide font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                                Sugestão de Conduta (IA)
                             </h4>
                             <textarea 
                                value={result.recommendation} 
                                onChange={(e) => setResult({...result, recommendation: e.target.value})}
                                className="w-full h-32 p-3 text-sm bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                             />

                             <div className="flex gap-3 mt-4">
                                <button
                                   onClick={handleInsert}
                                   className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                                >
                                   <FilePlus className="h-4 w-4" /> Inserir na Receita
                                </button>
                                <button
                                   onClick={handleCopy}
                                   className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center gap-2"
                                >
                                   {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                             </div>
                         </div>
                      ) : (
                         <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                            <Calculator className="h-12 w-12 mb-3 opacity-20" />
                            <p>Preencha os dados e clique em calcular.</p>
                         </div>
                      )}
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>Selecione uma calculadora no menu lateral.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MedicalCalculators;
