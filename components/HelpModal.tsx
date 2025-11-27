
import React, { useState } from 'react';
import { X, HelpCircle, Search, ChevronDown, ChevronUp, ExternalLink, Zap, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AppGuideContent } from '../types';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGuest: boolean;
  onNavigate: (view: 'editor' | 'profile') => void;
}

const STATIC_GUIDE_CONTENT: AppGuideContent = {
  overview: "Bem-vindo ao Prescreve AI, seu assistente inteligente para a prática médica! O aplicativo permite criar prescrições, atestados e declarações de forma rápida, segura e eficiente. Você pode utilizá-lo tanto com login quanto como visitante. No modo visitante, é possível personalizar seus documentos manualmente sem que suas informações fiquem armazenadas.",
  steps: [
    {
      title: "Personalize o Cabeçalho (Modo Visitante)",
      description: "Como visitante, insira manualmente seus dados profissionais (nome, registro, especialidade ou informações do consultório). Essas informações serão aplicadas automaticamente aos documentos criados enquanto a sessão estiver ativa."
    },
    {
      title: "Selecione o Tipo de Documento",
      description: "Escolha entre Receita Médica, Atestado ou Declaração. Preencha os dados básicos do paciente e comece a adicionar informações conforme o tipo de documento."
    },
    {
      title: "Use as Sugestões Clínicas",
      description: "Ao adicionar medicamentos ou informações clínicas, você verá sugestões inteligentes de dosagem, posologia e termos técnicos. Revise sempre antes de confirmar."
    },
    {
      title: "Verifique Interações Medicamentosas",
      description: "Utilize a ferramenta de verificação de interações para aumentar a segurança da prescrição, com alertas especiais para gestantes e pacientes pediátricos."
    },
    {
      title: "Edite Orientações Personalizadas",
      description: "Utilize o editor de orientações para criar mensagens customizadas para o paciente. Quando quiser, pode usar sugestões automáticas de texto para tornar o processo mais rápido."
    },
    {
      title: "Revise e Exporte em PDF",
      description: "Após revisar tudo, clique em Exportar PDF para gerar um arquivo pronto para impressão, compartilhamento ou armazenamento local."
    }
  ],
  tips: [
    "Sempre revise as sugestões automáticas antes de finalizar o documento.",
    "Utilize a verificação de interações em prescrições mais complexas.",
    "No Modo Visitante, o histórico recente fica salvo apenas no seu navegador."
  ],
  faq: [
    {
      question: "A IA pode errar ou dar informações imprecisas?",
      answer: "Sim. A IA é apenas uma ferramenta auxiliar. O profissional de saúde deve revisar e validar todas as informações antes de finalizar o documento."
    },
    {
      question: "Como salvo minhas prescrições em PDF?",
      answer: "Após finalizar o documento, clique em ‘Exportar PDF’, que gera o arquivo completo automaticamente."
    },
    {
      question: "Os dados são salvos no Modo Visitante?",
      answer: "Não. Nenhuma informação pessoal ou de pacientes é enviada aos servidores. O histórico fica salvo apenas no navegador do usuário."
    },
    {
      question: "Como edito o cabeçalho no Modo Visitante?",
      answer: "Na área de prescrição, há campos específicos para inserir manualmente nome, CRM e informações profissionais, que serão aplicadas a todos os documentos enquanto o app estiver aberto."
    }
  ]
};

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, isGuest, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaq = STATIC_GUIDE_CONTENT.faq.filter(f => 
     f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
     f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (action: string) => {
     onClose();
     if (action === 'profile') onNavigate('profile');
     if (action === 'editor') onNavigate('editor');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-indigo-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Guia de Uso</h2>
              <p className="text-indigo-100 text-sm opacity-90">Prescreve AI - Manual Oficial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
             >
                <X className="h-6 w-6" />
             </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900">
            <div className="p-6 max-w-5xl mx-auto space-y-8">
                 
                 {/* Overview */}
                 <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                       <BookOpen className="h-5 w-5 text-indigo-500" /> Visão Geral
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                       {STATIC_GUIDE_CONTENT.overview}
                    </p>
                    
                    {/* Quick Shortcuts */}
                    <div className="mt-6 flex flex-wrap gap-3">
                       <button onClick={() => handleAction('editor')} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition flex items-center gap-2">
                          <ExternalLink size={14} /> Criar Nova Receita
                       </button>
                       {!isGuest && (
                          <button onClick={() => handleAction('profile')} className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-2">
                             <ExternalLink size={14} /> Editar Perfil
                          </button>
                       )}
                    </div>
                 </section>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Steps Checklist */}
                    <div className="lg:col-span-2 space-y-6">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Criar Nova Receita — Passo a Passo
                       </h3>
                       <div className="space-y-4">
                          {STATIC_GUIDE_CONTENT.steps.map((step, idx) => (
                             <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex gap-4 group hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                                <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 h-8 w-8 rounded-full flex items-center justify-center font-bold shrink-0">
                                   {idx + 1}
                                </div>
                                <div>
                                   <h4 className="font-bold text-gray-900 dark:text-gray-100">{step.title}</h4>
                                   <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                                </div>
                             </div>
                          ))}
                       </div>

                        {/* Tips */}
                       {STATIC_GUIDE_CONTENT.tips.length > 0 && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4">
                             <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                                <Zap className="h-4 w-4" /> Dicas Rápidas
                             </h4>
                             <ul className="space-y-2">
                                {STATIC_GUIDE_CONTENT.tips.map((tip, i) => (
                                   <li key={i} className="text-sm text-yellow-900 dark:text-yellow-100 flex gap-2">
                                      <span className="text-yellow-500">•</span> {tip}
                                   </li>
                                ))}
                             </ul>
                          </div>
                       )}
                    </div>

                    {/* FAQ & Search */}
                    <div className="space-y-6">
                       <div className="relative">
                          <input 
                             type="text" 
                             placeholder="Pesquisar ajuda..." 
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                       </div>

                       <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-200">
                             Perguntas Frequentes
                          </div>
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                             {filteredFaq.length > 0 ? filteredFaq.map((item, idx) => (
                                <div key={idx} className="group">
                                   <button 
                                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                      className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                   >
                                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.question}</span>
                                      {expandedFaq === idx ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                   </button>
                                   {expandedFaq === idx && (
                                      <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-gray-900/20 animate-in slide-in-from-top-1">
                                         {item.answer}
                                      </div>
                                   )}
                                </div>
                             )) : (
                                <div className="p-4 text-center text-gray-500 text-sm">Nenhum resultado encontrado.</div>
                             )}
                          </div>
                       </div>
                    </div>

                 </div>
                 
                 {/* Disclaimer */}
                 <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 font-medium">
                       <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                       LGPD: Seus dados são armazenados apenas localmente no navegador.
                    </div>
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto flex items-start justify-center gap-1">
                       <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                       Aviso Legal: A Inteligência Artificial é uma ferramenta de auxílio e pode cometer erros. A responsabilidade final pela validação clínica e prescrição é exclusivamente do médico.
                    </p>
                 </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
