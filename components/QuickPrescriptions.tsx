import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight, ChevronDown, Plus, Star, Trash2, Book, Activity, Stethoscope, Heart, Pill, Brain, Bone, Thermometer, Edit2, Save, ArrowLeft, Eye, Ear, Baby, Users, Droplets, Zap, Bug, Copy, BookOpen } from 'lucide-react';
import { MedicalProtocol, ProtocolCategory, Medication } from '../types';
import { getProtocols, toggleProtocolFavorite, deleteCustomProtocol, updateCustomProtocol, saveCustomProtocol } from '../services/protocolService';
import CopyTextModal from './CopyTextModal';

interface QuickPrescriptionsProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (medications: Omit<Medication, 'id'>[], instructions?: string) => void;
  initialDataForCreation?: Partial<MedicalProtocol> | null; // If passed, opens in Create Mode with this data
  isStudentMode?: boolean;
}

const CATEGORIES: { id: ProtocolCategory | 'Favoritos' | 'Todos'; icon: React.ReactNode; label: string }[] = [
  { id: 'Favoritos', icon: <Star className="h-4 w-4" />, label: 'Favoritos' },
  { id: 'Todos', icon: <Book className="h-4 w-4" />, label: 'Todos' },
  { id: 'Clínica Geral e MFC', icon: <Stethoscope className="h-4 w-4" />, label: 'Clínica Geral e MFC' },
  { id: 'Infectologia', icon: <Bug className="h-4 w-4" />, label: 'Infectologia' },
  { id: 'Cardiologia', icon: <Heart className="h-4 w-4" />, label: 'Cardiologia' },
  { id: 'Pneumologia', icon: <Activity className="h-4 w-4" />, label: 'Pneumologia' },
  { id: 'Gastroenterologia', icon: <Pill className="h-4 w-4" />, label: 'Gastroenterologia' },
  { id: 'Endocrinologia', icon: <Zap className="h-4 w-4" />, label: 'Endocrinologia' },
  { id: 'Neurologia', icon: <Brain className="h-4 w-4" />, label: 'Neurologia' },
  { id: 'Psiquiatria e Saúde Mental', icon: <Users className="h-4 w-4" />, label: 'Psiquiatria' },
  { id: 'Ortopedia e Reumatologia', icon: <Bone className="h-4 w-4" />, label: 'Ortopedia' },
  { id: 'Dermatologia', icon: <Thermometer className="h-4 w-4" />, label: 'Dermatologia' },
  { id: 'Urologia e Nefro', icon: <Droplets className="h-4 w-4" />, label: 'Urologia e Nefro' },
  { id: 'Ginecologia', icon: <Users className="h-4 w-4" />, label: 'Ginecologia' },
  { id: 'Obstetrícia', icon: <Baby className="h-4 w-4" />, label: 'Obstetrícia' },
  { id: 'Pediatria', icon: <Baby className="h-4 w-4" />, label: 'Pediatria' },
  { id: 'Otorrinolaringologia', icon: <Ear className="h-4 w-4" />, label: 'Otorrinolaringologia' },
  { id: 'Oftalmologia', icon: <Eye className="h-4 w-4" />, label: 'Oftalmologia' },
];

// Helper Component for Editing a Protocol
const ProtocolEditor: React.FC<{
  protocol: Partial<MedicalProtocol>;
  onSave: (p: MedicalProtocol) => void;
  onCancel: () => void;
  isNew?: boolean;
}> = ({ protocol, onSave, onCancel, isNew }) => {
  const [formData, setFormData] = useState<Partial<MedicalProtocol>>({
    name: '',
    subcategory: '',
    customInstructions: '',
    category: 'Clínica Geral e MFC',
    medications: [],
    ...protocol
  });

  const handleInputChange = (field: keyof MedicalProtocol, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMedication = (index: number, field: keyof Omit<Medication, 'id'>, value: string) => {
    const newMeds = [...(formData.medications || [])];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setFormData(prev => ({ ...prev, medications: newMeds }));
  };

  const removeMedication = (index: number) => {
    const newMeds = (formData.medications || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, medications: newMeds }));
  };

  const addMedication = () => {
    const newMeds = [...(formData.medications || []), { name: '', dosage: '', quantity: '1', unit: 'Caixa(s)', frequency: '', duration: '', instructions: '' }];
    setFormData(prev => ({ ...prev, medications: newMeds }));
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("O protocolo precisa de um nome.");
      return;
    }
    // @ts-ignore - we know it's mostly full
    onSave(formData as MedicalProtocol);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200 bg-white dark:bg-gray-800 h-full overflow-y-auto rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {isNew ? "Novo Protocolo" : "Editar Protocolo"}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Protocolo</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Ex: IVAS Adulto"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subcategoria / Condição</label>
          <input 
            type="text" 
            value={formData.subcategory}
            onChange={(e) => handleInputChange('subcategory', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Ex: Sinusite"
          />
        </div>
        <div>
           <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sistema / Categoria</label>
           <select 
             value={formData.category}
             onChange={(e) => handleInputChange('category', e.target.value)}
             className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
           >
             {CATEGORIES.filter(c => c.id !== 'Todos' && c.id !== 'Favoritos').map(c => (
               <option key={c.id} value={c.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">{c.label}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medicamentos</label>
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
          {(formData.medications || []).map((med, i) => (
            <div key={i} className="flex gap-2 items-start p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
               <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input 
                    placeholder="Nome" 
                    value={med.name} 
                    onChange={e => updateMedication(i, 'name', e.target.value)}
                    className="sm:col-span-4 p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400"
                  />
                  <input 
                    placeholder="Dose" 
                    value={med.dosage} 
                    onChange={e => updateMedication(i, 'dosage', e.target.value)}
                    className="sm:col-span-2 p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400"
                  />
                  <input 
                    placeholder="Freq" 
                    value={med.frequency} 
                    onChange={e => updateMedication(i, 'frequency', e.target.value)}
                    className="sm:col-span-3 p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400"
                  />
                  <input 
                    placeholder="Dur" 
                    value={med.duration} 
                    onChange={e => updateMedication(i, 'duration', e.target.value)}
                    className="sm:col-span-3 p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400"
                  />
               </div>
               <button onClick={() => removeMedication(i)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1.5 rounded transition-colors">
                 <Trash2 size={14} />
               </button>
            </div>
          ))}
        </div>
        <button onClick={addMedication} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline font-medium mt-2">
          <Plus size={12} /> Adicionar Medicamento
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Orientações</label>
        <textarea 
          value={formData.customInstructions}
          onChange={(e) => handleInputChange('customInstructions', e.target.value)}
          className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Orientações ao paciente..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors">
          Cancelar
        </button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors">
          <Save size={14} /> Salvar
        </button>
      </div>
    </div>
  );
};


const QuickPrescriptions: React.FC<QuickPrescriptionsProps> = ({ isOpen, onClose, onInsert, initialDataForCreation, isStudentMode }) => {
  const [protocols, setProtocols] = useState<MedicalProtocol[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Favoritos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>(null);
  
  // Edit Mode State
  const [editingProtocol, setEditingProtocol] = useState<MedicalProtocol | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Copy Modal State
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [protocolToCopy, setProtocolToCopy] = useState<MedicalProtocol | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProtocols();
      // Check if opened in "Save as Protocol" mode (creation with pre-filled data)
      if (initialDataForCreation && !isStudentMode) {
         setIsCreatingNew(true);
         setEditingProtocol(initialDataForCreation as MedicalProtocol);
      } else {
         setEditingProtocol(null);
         setIsCreatingNew(false);
      }
    }
  }, [isOpen, initialDataForCreation, isStudentMode]);

  const loadProtocols = () => {
    setProtocols(getProtocols());
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleProtocolFavorite(id);
    loadProtocols(); // Reload to update UI
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Excluir este protocolo personalizado?")) {
      deleteCustomProtocol(id);
      loadProtocols();
    }
  };

  const handleInsert = (p: MedicalProtocol) => {
    onInsert(p.medications || [], p.customInstructions);
    onClose();
  };

  const startEdit = (p: MedicalProtocol, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProtocol(p);
    setIsCreatingNew(false);
  };

  const startCreate = () => {
    setIsCreatingNew(true);
    setEditingProtocol({
      id: '',
      name: '',
      subcategory: '',
      category: 'Clínica Geral e MFC',
      isCustom: true,
      isFavorite: false,
      customInstructions: '',
      medications: []
    } as MedicalProtocol);
  };

  const handleSaveProtocol = (p: MedicalProtocol) => {
    if (isCreatingNew) {
      saveCustomProtocol(p);
    } else {
      updateCustomProtocol(p);
    }
    loadProtocols();
    setEditingProtocol(null);
    setIsCreatingNew(false);
  };

  const handleOpenCopyModal = (p: MedicalProtocol, e: React.MouseEvent) => {
    e.stopPropagation();
    setProtocolToCopy(p);
    setCopyModalOpen(true);
  };

  // Filter Logic
  const filteredProtocols = protocols.filter(p => {
    // 1. Search
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) || 
      p.subcategory.toLowerCase().includes(searchLower) ||
      (p.medications && p.medications.some(m => m.name.toLowerCase().includes(searchLower)));

    if (!matchesSearch) return false;

    // 2. Category
    if (selectedCategory === 'Todos') return true;
    if (selectedCategory === 'Favoritos') return p.isFavorite;
    return p.category === selectedCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* If Editing or Creating, show Editor full width */}
        {(editingProtocol || isCreatingNew) && !isStudentMode ? (
           <div className="w-full h-full overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800">
              <ProtocolEditor 
                protocol={editingProtocol!} 
                onSave={handleSaveProtocol}
                onCancel={() => { 
                   if (initialDataForCreation) { onClose(); } // If came from "Save As", cancel closes modal
                   else { setEditingProtocol(null); setIsCreatingNew(false); } 
                }}
                isNew={isCreatingNew}
              />
           </div>
        ) : (
          <>
            {/* Sidebar Categories */}
            <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Book className="h-5 w-5 text-blue-600" />
                    Sistemas
                  </h2>
                  {!isStudentMode && (
                    <button 
                      onClick={startCreate}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> INSERIR NOVO PROTOCOLO
                    </button>
                  )}
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                        selectedCategory === cat.id 
                          ? 'bg-white dark:bg-gray-800 shadow-sm border-l-4 border-blue-600 text-blue-700 dark:text-blue-300 font-medium' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                        <span className={`p-1.5 rounded-md shrink-0 ${selectedCategory === cat.id ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {cat.icon}
                        </span>
                        <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
              
              {/* Header & Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar doença, sintoma ou protocolo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
              </div>

              {/* Protocol List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/30">
                  {filteredProtocols.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <Book className="h-12 w-12 mb-3 opacity-20" />
                        <p>Nenhum protocolo encontrado.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {filteredProtocols.map(protocol => {
                          const isExpanded = expandedProtocolId === protocol.id;
                          const medCount = protocol.medications?.length || 0;
                          
                          return (
                              <div key={protocol.id} className={`bg-white dark:bg-gray-800 rounded-lg border transition-all ${isExpanded ? 'border-blue-300 dark:border-blue-700 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                
                                {/* Card Header */}
                                <div 
                                    onClick={() => setExpandedProtocolId(isExpanded ? null : protocol.id)}
                                    className="p-4 flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${isExpanded ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                          {protocol.name.charAt(0)}
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{protocol.name}</h3>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">{protocol.subcategory} • {medCount} medicamentos</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button 
                                          onClick={(e) => handleToggleFavorite(protocol.id, e)}
                                          className={`p-2 rounded-full transition-colors ${protocol.isFavorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-300 hover:text-amber-400'}`}
                                          title="Favoritar"
                                      >
                                          <Star className={`h-4 w-4 ${protocol.isFavorite ? 'fill-current' : ''}`} />
                                      </button>
                                      
                                      {!isStudentMode && protocol.isCustom && (
                                          <button 
                                              onClick={(e) => handleDelete(protocol.id, e)}
                                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                              title="Excluir"
                                          >
                                              <Trash2 className="h-4 w-4" />
                                          </button>
                                      )}
                                      {isExpanded ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Card Body (Expanded) */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                          <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Medicamentos</h4>
                                            <ul className="space-y-1">
                                                {(protocol.medications || []).map((m, i) => (
                                                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                                                      <span className="font-medium">• {m.name}</span>
                                                      <span className="text-gray-500">{m.dosage}</span>
                                                  </li>
                                                ))}
                                            </ul>
                                          </div>
                                          {protocol.customInstructions && (
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Orientações</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-4">
                                                  {protocol.customInstructions}
                                                </p>
                                            </div>
                                          )}
                                      </div>

                                      {/* Reference Section */}
                                      {protocol.reference && (
                                        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                          <p className="text-[10px] text-gray-400 dark:text-gray-500 italic flex items-center gap-1">
                                            <BookOpen size={10} /> {protocol.reference}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {isStudentMode ? (
                                         <button 
                                            onClick={(e) => handleOpenCopyModal(protocol, e)}
                                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors mt-3"
                                         >
                                            <Copy className="h-4 w-4" /> Copiar Conteúdo para Estudo
                                         </button>
                                      ) : (
                                        <div className="flex gap-3 flex-wrap mt-3">
                                            <button 
                                                onClick={() => handleInsert(protocol)}
                                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <Plus className="h-4 w-4" /> Inserir na Prescrição
                                            </button>
                                            
                                            <button 
                                                onClick={(e) => startEdit(protocol, e)}
                                                className="flex-1 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" /> Editar Prescrição
                                            </button>

                                            <button 
                                                onClick={(e) => handleOpenCopyModal(protocol, e)}
                                                className="flex-1 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <Copy className="h-4 w-4" /> Copiar como Texto
                                            </button>
                                        </div>
                                      )}
                                    </div>
                                )}
                              </div>
                          );
                        })}
                    </div>
                  )}
              </div>

            </div>
          </>
        )}
      </div>

      {/* Modal for Copying Text */}
      {protocolToCopy && (
        <CopyTextModal
          isOpen={copyModalOpen}
          onClose={() => setCopyModalOpen(false)}
          medications={protocolToCopy.medications || []}
          customInstructions={protocolToCopy.customInstructions}
        />
      )}
    </div>
  );
};

export default QuickPrescriptions;