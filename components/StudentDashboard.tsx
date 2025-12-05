import React from 'react';
import { ClipboardPen, BookOpen, GraduationCap, ChevronRight, User, Siren } from 'lucide-react';
import { Doctor } from '../types';

interface StudentDashboardProps {
  user: Doctor | null;
  onOpenSoap: () => void;
  onOpenProtocols: () => void;
  onOpenHospital: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onOpenSoap, onOpenProtocols, onOpenHospital }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/50 animate-in fade-in duration-300">
      
      <div className="max-w-6xl w-full space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            <GraduationCap className="h-4 w-4" />
            Modo Estudante
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Área Acadêmica & Internato
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Olá, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.name || 'Acadêmico'}</span>. O que vamos praticar hoje?
          </p>
        </div>

        {/* Giant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Card 1: SOAP */}
          <button 
            onClick={onOpenSoap}
            className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1 text-left md:text-center"
          >
            <div className="h-20 w-20 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ClipboardPen className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Fazer Anamnese Dirigida
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Guia passo a passo para estruturar histórias clínicas, evolução e raciocínio clínico.
            </p>
            <div className="mt-auto flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wide group-hover:gap-2 transition-all">
              Iniciar Prática <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </button>

          {/* Card 2: Protocols */}
          <button 
            onClick={onOpenProtocols}
            className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 text-left md:text-center"
          >
            <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Consultar Protocolos
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Acesse o banco de prescrições ambulatoriais, doses e condutas para estudo.
            </p>
            <div className="mt-auto flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wide group-hover:gap-2 transition-all">
              Acessar Biblioteca <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </button>

          {/* Card 3: Hospital/Emergency Guide */}
          <button 
            onClick={onOpenHospital}
            className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-transparent hover:border-red-500 dark:hover:border-red-400 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 transform hover:-translate-y-1 text-left md:text-center"
          >
            <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Siren className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              Guia Intra-Hospitalar
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Consulte protocolos de emergência, sedação, drogas vasoativas e sala vermelha.
            </p>
            <div className="mt-auto flex items-center text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide group-hover:gap-2 transition-all">
              Abrir Guia <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </button>

        </div>

        {/* Footer Hint */}
        <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
           <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
             <User className="h-4 w-4" /> 
             Modo de Estudo: Documentos gerados não possuem validade legal.
           </p>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;