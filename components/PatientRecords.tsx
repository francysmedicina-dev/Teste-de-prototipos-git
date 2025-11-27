
import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, FileText, Star, Share2, Printer, Edit2, Trash2, ChevronDown, ChevronRight, Download, ArrowLeft } from 'lucide-react';
import { Doctor, PatientRecord, PrescriptionState } from '../types';
import { getDoctorPatientRecords, toggleRecordFavorite, deleteRecord } from '../services/storageService';

interface PatientRecordsProps {
  doctor: Doctor;
  onLoadRecord: (state: PrescriptionState) => void;
  onBack: () => void;
}

const PatientRecords: React.FC<PatientRecordsProps> = ({ doctor, onLoadRecord, onBack }) => {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'prescription' | 'certificate'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedPatients, setExpandedPatients] = useState<string[]>([]);

  // Load records
  useEffect(() => {
    // For guests, we might pass a specific ID or handle it, but prompt says "logged in doctor".
    // We'll use the doctor.email as ID or a specific ID if available. Using name+crm as fallback key if no ID.
    const doctorId = doctor.email || `${doctor.crm}`;
    setRecords(getDoctorPatientRecords(doctorId));
  }, [doctor]);

  // Filtering Logic
  const filteredRecords = records.filter(record => {
    // 1. Search (Normalize both query and target)
    const normQuery = searchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const matchesSearch = record.patientNameNormalized.includes(normQuery);

    // 2. Type Filter
    const matchesType = filterType === 'all' || record.type === filterType || record.type === 'both';

    // 3. Favorites
    const matchesFav = showFavoritesOnly ? record.isFavorite : true;

    return matchesSearch && matchesType && matchesFav;
  });

  // Grouping by Patient Name
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    const name = record.patientName;
    if (!acc[name]) acc[name] = [];
    acc[name].push(record);
    return acc;
  }, {} as Record<string, PatientRecord[]>);

  // Sorting: Keys (Names) A-Z, Values (Records) Date Descending
  const sortedPatientNames = Object.keys(groupedRecords).sort();

  const togglePatientExpand = (name: string) => {
    setExpandedPatients(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Update local state immediately for UI responsiveness
    setRecords(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
    // Persist
    toggleRecordFavorite(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este registro permanentemente?')) {
      const updated = deleteRecord(id);
      // We need to fetch specifically for this doctor again to ensure state consistency or just filter local
      const doctorId = doctor.email || `${doctor.crm}`;
      setRecords(getDoctorPatientRecords(doctorId));
    }
  };

  const handleShare = (record: PatientRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Olá, segue prescrição para ${record.patientName} gerada em ${new Date(record.date).toLocaleDateString('pt-BR')}.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 animate-in fade-in duration-300">
      
      {/* Header / Search Area */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-200 transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Prescrições e Atestados
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gerencie o histórico clínico dos seus pacientes
                </p>
              </div>
            </div>
         </div>

         <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar paciente (nome, sobrenome)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
               <button 
                 onClick={() => setFilterType('all')}
                 className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors border ${filterType === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'}`}
               >
                 Todos
               </button>
               <button 
                 onClick={() => setFilterType('prescription')}
                 className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors border ${filterType === 'prescription' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'}`}
               >
                 Apenas Receitas
               </button>
               <button 
                 onClick={() => setFilterType('certificate')}
                 className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors border ${filterType === 'certificate' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'}`}
               >
                 Atestados
               </button>
               <button 
                 onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                 className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors border flex items-center gap-2 ${showFavoritesOnly ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'}`}
               >
                 <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-amber-500 text-amber-500' : ''}`} /> Favoritos
               </button>
            </div>
         </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
         {sortedPatientNames.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                 <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Nenhum registro encontrado</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto mt-1">
                 Suas prescrições salvas aparecerão aqui. Certifique-se de estar logado para salvar automaticamente.
              </p>
           </div>
         ) : (
           <div className="space-y-4 max-w-5xl mx-auto">
              {sortedPatientNames.map((patientName) => {
                 const patientRecords = groupedRecords[patientName].sort((a, b) => b.timestamp - a.timestamp); // Most recent first
                 const isExpanded = expandedPatients.includes(patientName);
                 const lastRecord = patientRecords[0];

                 return (
                    <div key={patientName} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all">
                       
                       {/* Patient Group Header */}
                       <button 
                         onClick={() => togglePatientExpand(patientName)}
                         className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                       >
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                                {patientName.charAt(0).toUpperCase()}
                             </div>
                             <div className="text-left">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{patientName}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                   Última visita: {new Date(lastRecord.date).toLocaleDateString('pt-BR')} • {patientRecords.length} documento(s)
                                </p>
                             </div>
                          </div>
                          <div className="text-gray-400">
                             {isExpanded ? <ChevronDown /> : <ChevronRight />}
                          </div>
                       </button>

                       {/* Expanded Records List */}
                       {isExpanded && (
                          <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 space-y-3">
                             {patientRecords.map((record) => (
                                <div key={record.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group relative">
                                   
                                   <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                         <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                               record.type === 'prescription' 
                                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                                  : record.type === 'certificate' 
                                                     ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                     : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                               {record.type === 'prescription' ? 'Receita' : record.type === 'certificate' ? 'Atestado' : 'Combo'}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                               <Calendar className="h-3 w-3" />
                                               {new Date(record.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            {record.state.cid && (
                                               <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                  CID: {record.state.cid}
                                               </span>
                                            )}
                                         </div>
                                         
                                         {record.diagnosis && (
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">
                                               Dx: {record.diagnosis}
                                            </p>
                                         )}
                                         
                                         {record.medicationSummary && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                               <span className="font-medium text-xs text-gray-400 uppercase mr-1">Rx:</span>
                                               {record.medicationSummary}
                                            </p>
                                         )}
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-1">
                                         <button 
                                            onClick={(e) => handleToggleFavorite(record.id, e)}
                                            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${record.isFavorite ? 'text-amber-500' : 'text-gray-300'}`}
                                            title="Favoritar"
                                         >
                                            <Star className={`h-5 w-5 ${record.isFavorite ? 'fill-current' : ''}`} />
                                         </button>
                                         
                                         <button 
                                            onClick={(e) => handleShare(record, e)}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                            title="Compartilhar"
                                         >
                                            <Share2 className="h-5 w-5" />
                                         </button>

                                         <button 
                                            onClick={(e) => handleDelete(record.id, e)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Excluir"
                                         >
                                            <Trash2 className="h-5 w-5" />
                                         </button>
                                      </div>
                                   </div>

                                   <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                      <button 
                                         onClick={() => onLoadRecord(record.state)}
                                         className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                      >
                                         <Printer className="h-4 w-4" /> Ver / PDF
                                      </button>
                                      <button 
                                         onClick={() => onLoadRecord(record.state)}
                                         className="flex-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                      >
                                         <Edit2 className="h-4 w-4" /> Editar / Copiar
                                      </button>
                                   </div>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                 );
              })}
           </div>
         )}
      </div>
    </div>
  );
};

export default PatientRecords;
