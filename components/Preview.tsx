
import React, { useState, useRef } from 'react';
import { ArrowLeft, Printer, FileDown, Loader2, Copy, CheckCircle, GraduationCap } from 'lucide-react';
import { PrescriptionState, Doctor, Institution, Medication } from '../types';

// --- Constants & Helpers ---
const MEDS_PER_PAGE = 5;

// Helper to split long text into A4-friendly chunks
const paginateText = (text: string, maxLinesPerPage: number = 22): string[] => {
  if (!text) return [];
  
  const lines = text.split('\n');
  const pages: string[] = [];
  let currentPage: string[] = [];
  let currentLines = 0;

  lines.forEach(line => {
    // Estimate lines wrapped (approx 95 chars per line)
    const wrappedLines = Math.ceil(line.length / 95) || 1;
    
    if (currentLines + wrappedLines > maxLinesPerPage) {
      pages.push(currentPage.join('\n'));
      currentPage = [line];
      currentLines = wrappedLines;
    } else {
      currentPage.push(line);
      currentLines += wrappedLines;
    }
  });

  if (currentPage.length > 0) {
    pages.push(currentPage.join('\n'));
  }

  return pages;
};

// --- Interfaces ---

interface PreviewProps {
  state: PrescriptionState;
  setState: React.Dispatch<React.SetStateAction<PrescriptionState>>;
  doctor: Doctor;
  institution: Institution;
  onBack: () => void;
  customHeaderImage: string | null;
  hideTextHeader: boolean;
  onAutoSave: () => void;
  onSaveAndExit: () => void;
  isStudentMode?: boolean; // New Prop
}

interface PrescriptionPaperProps {
  state: PrescriptionState;
  doctor: Doctor;
  institution: Institution;
  label?: string; // "1ª VIA" / "2ª VIA"
  customHeaderImage: string | null;
  hideTextHeader: boolean;
  pageType: 'prescription' | 'instructions';
  medicationsToRender?: Medication[];
  customContent?: string;
  startIndex?: number;
  paginationInfo?: string;
}

// --- Internal Component: The Paper Sheet ---
const PrescriptionPaper: React.FC<PrescriptionPaperProps> = ({ 
  state, 
  doctor, 
  institution, 
  label, 
  customHeaderImage, 
  hideTextHeader,
  pageType,
  medicationsToRender,
  customContent,
  startIndex = 0,
  paginationInfo
}) => {
  const showHeaderBlock = institution.name || (!hideTextHeader || !customHeaderImage);
  const showDoctorText = !hideTextHeader || !customHeaderImage;

  // Format date
  const dateObj = state.date ? new Date(state.date + 'T12:00:00') : new Date();
  const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="prescription-paper bg-white w-full max-w-[210mm] min-h-[297mm] p-[2cm] shadow-xl text-gray-900 relative flex flex-col font-serif mx-auto transition-all">
      
      {/* Optional Label (2ª Via) */}
      {label && (
        <div className="absolute top-8 right-8 border-2 border-gray-800 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest opacity-70">
          {label}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
         {customHeaderImage && (
            <div className="mb-4 flex justify-center w-full">
              <img 
                src={customHeaderImage} 
                alt="Cabeçalho" 
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '140px' }} 
              />
            </div>
         )}

         {showHeaderBlock && (
            <div className="border-b-4 border-gray-900 pb-4 text-center">
               {institution.name && (
                 <div className="mb-2">
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-wider">{institution.name}</h2>
                    <p className="text-xs text-gray-600">
                      {institution.address}
                      {institution.city && ` - ${institution.city}`}
                      {institution.state && `/${institution.state}`}
                      {institution.phone && ` • Tel: ${institution.phone}`}
                    </p>
                 </div>
               )}
               
               {showDoctorText && (
                 <div className="mt-2">
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Dr. {doctor.name}</h1>
                    <div className="flex justify-center gap-4 text-sm text-gray-700 font-medium">
                       <span>{doctor.specialty}</span>
                       <span>•</span>
                       <span>CRM: {doctor.crm}</span>
                    </div>
                 </div>
               )}
            </div>
         )}
      </div>

      {/* Body Content */}
      <div className="flex-1 flex flex-col">
         
         {/* Patient Info Box (Only on first page or logic dependent, usually on all prescription pages) */}
         <div className="mb-8 bg-gray-50 p-4 rounded border border-gray-200">
            <div className="flex justify-between items-baseline border-b border-gray-300 pb-2 mb-2">
               <span className="font-bold text-lg">Paciente: {state.patient.name}</span>
               {state.patient.age && <span className="text-sm text-gray-600">Idade: {state.patient.age} anos</span>}
            </div>
            {state.includeAddress && state.patient.address && (
               <p className="text-xs text-gray-500">Endereço: {state.patient.address}</p>
            )}
            {state.includeCid && state.cid && (
                <p className="text-xs text-gray-500 mt-1 font-mono">CID: {state.cid}</p>
            )}
         </div>

         {/* Content: Medications OR Instructions */}
         {pageType === 'prescription' && medicationsToRender ? (
            <div className="space-y-6">
               <h3 className="text-center font-bold text-xl border-b-2 border-gray-200 pb-2 mb-6">
                  USO INTERNO / EXTERNO
               </h3>
               
               <ul className="space-y-6 list-none pl-0">
                  {medicationsToRender.map((med, idx) => (
                     <li key={med.id || idx} className="pl-4 relative">
                        <span className="absolute left-0 top-1 font-bold text-gray-400 text-sm">
                           {startIndex + idx + 1}.
                        </span>
                        
                        <div className="flex justify-between items-baseline mb-1 border-b border-dotted border-gray-300 pb-1">
                           <span className="font-bold text-lg text-gray-900">
                              {med.name} {med.dosage}
                           </span>
                           <span className="font-bold text-gray-800 whitespace-nowrap ml-4">
                              {med.quantity} {med.unit}
                           </span>
                        </div>

                        <div className="text-gray-700 pl-4 text-sm leading-relaxed uppercase font-medium tracking-wide">
                           <p>
                              {med.frequency} {med.duration && `- ${med.duration}`}
                           </p>
                           {med.instructions && (
                              <p className="normal-case text-gray-600 italic mt-0.5 text-xs">
                                 Obs: {med.instructions}
                              </p>
                           )}
                        </div>
                     </li>
                  ))}
               </ul>
            </div>
         ) : (
            <div className="space-y-4">
               <h3 className="text-center font-bold text-xl border-b-2 border-gray-200 pb-2 mb-6">
                  ORIENTAÇÕES AO PACIENTE
               </h3>
               <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line text-justify">
                  {customContent}
               </div>
            </div>
         )}

      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t-2 border-gray-200">
         <div className="flex justify-between items-end">
            <div className="text-sm text-gray-500">
               <p className="capitalize font-medium">{formattedDate}</p>
               {paginationInfo && <p className="text-xs mt-1 text-gray-400">{paginationInfo}</p>}
            </div>

            <div className="text-center min-w-[200px]">
               <div className="w-full border-b border-gray-900 mb-2 mx-auto"></div>
               <p className="font-bold text-sm uppercase text-gray-900">Dr. {doctor.name}</p>
               <p className="text-xs text-gray-600 uppercase">CRM {doctor.crm}</p>
            </div>
         </div>
         
         <div className="text-center mt-8 text-[10px] text-gray-300 font-sans">
            Documento gerado via Prescreve AI
         </div>
      </div>

    </div>
  );
};


// --- Main Component ---

const Preview: React.FC<PreviewProps> = ({ state, setState, doctor, institution, onBack, customHeaderImage, hideTextHeader, onAutoSave, onSaveAndExit, isStudentMode }) => {
  const [printCopies, setPrintCopies] = useState<1 | 2>(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleToggleCopies = () => {
    setPrintCopies(prev => prev === 1 ? 2 : 1);
  };

  const handleProcessPdf = async (action: 'save' | 'print') => {
    onAutoSave(); // Save record
    const loadingState = action === 'save' ? setIsGeneratingPdf : setIsPrinting;
    loadingState(true);

    // Target the container holding all pages
    const element = document.getElementById('pdf-source-container');

    if (element) {
        // Backup styles
        const papers = element.querySelectorAll('.prescription-paper');
        const backups: string[] = [];
        papers.forEach((p) => {
            const el = p as HTMLElement;
            backups.push(el.style.boxShadow);
            el.style.boxShadow = 'none'; // Remove shadow for clean PDF
            el.style.height = '296.5mm'; // Enforce A4 height
            el.style.margin = '0';
        });

        // @ts-ignore - html2pdf loaded via CDN
        if (typeof html2pdf !== 'undefined') {
            const opt = {
                margin: 0,
                filename: `Receita_${state.patient.name || 'paciente'}_${state.date}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            try {
                if (action === 'save') {
                    // @ts-ignore
                    await html2pdf().set(opt).from(element).save();
                } else {
                    // @ts-ignore
                    const worker = html2pdf().set(opt).from(element).output('bloburl');
                    const blobUrl = await worker;
                    
                    // Print via iframe
                    const iframe = document.createElement('iframe');
                    iframe.style.position = 'fixed';
                    iframe.style.right = '0';
                    iframe.style.bottom = '0';
                    iframe.style.width = '0';
                    iframe.style.height = '0';
                    iframe.style.border = '0';
                    iframe.src = blobUrl;
                    document.body.appendChild(iframe);
                    
                    iframe.onload = () => {
                        try {
                            iframe.contentWindow?.focus();
                            iframe.contentWindow?.print();
                        } catch (e) {
                            window.open(blobUrl, '_blank');
                        }
                    };
                    
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        URL.revokeObjectURL(blobUrl);
                    }, 60000);
                }
            } catch (error) {
                console.error("PDF Error", error);
                alert("Erro ao gerar documento.");
            }
        } else {
            alert("Biblioteca PDF não carregada.");
        }

        // Restore styles
        papers.forEach((p, i) => {
            (p as HTMLElement).style.boxShadow = backups[i];
            (p as HTMLElement).style.height = '';
            (p as HTMLElement).style.margin = '';
        });
    }
    loadingState(false);
  };

  // --- Render Pages Logic ---
  const renderPages = () => {
    const pages: React.ReactNode[] = [];
    const showInstructions = state.customInstructions && state.includeCustomInstructions;
    
    // 1. Prepare Instructions Pages
    const instructionPages = showInstructions ? paginateText(state.customInstructions) : [];

    // 2. Prepare Medication Pages
    const medicationChunks: Medication[][] = [];
    if (state.medications.length > 0) {
      for (let i = 0; i < state.medications.length; i += MEDS_PER_PAGE) {
        medicationChunks.push(state.medications.slice(i, i + MEDS_PER_PAGE));
      }
    } else {
      medicationChunks.push([]); // Empty page if no meds
    }

    // 3. Generate Components for Each Copy
    for (let i = 0; i < printCopies; i++) {
        const copyLabel = printCopies === 2 ? (i === 0 ? "1ª VIA" : "2ª VIA") : undefined;
        
        // Add Med Pages
        medicationChunks.forEach((chunk, pageIdx) => {
           const isFirstPageOverall = pages.length === 0;
           const pageInfo = medicationChunks.length > 1 ? `Página ${pageIdx + 1}/${medicationChunks.length}` : undefined;

           pages.push(
             <div key={`med-${i}-${pageIdx}`} className={!isFirstPageOverall ? "break-before-page mt-8 print:mt-0" : ""}>
                <PrescriptionPaper 
                    state={state} 
                    doctor={doctor}
                    institution={institution}
                    label={copyLabel}
                    customHeaderImage={customHeaderImage}
                    hideTextHeader={hideTextHeader}
                    pageType="prescription"
                    medicationsToRender={chunk}
                    startIndex={pageIdx * MEDS_PER_PAGE}
                    paginationInfo={pageInfo}
                />
             </div>
           );
        });

        // Add Instruction Pages (Appended after meds for this copy)
        if (showInstructions && instructionPages.length > 0) {
           instructionPages.forEach((chunk, pageIdx) => {
             pages.push(
                <div key={`instr-${i}-${pageIdx}`} className="break-before-page mt-8 print:mt-0">
                    <PrescriptionPaper 
                        state={state} 
                        doctor={doctor}
                        institution={institution}
                        label={copyLabel}
                        customHeaderImage={customHeaderImage}
                        hideTextHeader={hideTextHeader}
                        pageType="instructions"
                        customContent={chunk}
                        paginationInfo={`Orientação Pag. ${pageIdx + 1}/${instructionPages.length}`}
                    />
                </div>
             );
           });
        }
    }
    return pages;
  };

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      
      {/* Student Mode Banner */}
      {isStudentMode && (
        <div className="bg-amber-100 dark:bg-amber-900/50 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2">
           <GraduationCap className="h-4 w-4" />
           MODO ESTUDO: Documento sem valor legal. Apenas para consulta acadêmica.
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 z-10">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
               <ArrowLeft className="h-5 w-5" /> Voltar
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Pré-visualização</h2>
         </div>

         <div className="flex items-center gap-3">
            {!isStudentMode && (
              <button 
                 onClick={handleToggleCopies}
                 className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all border ${
                    printCopies === 2 
                      ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' 
                      : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50'
                 }`}
              >
                 <Copy className="h-4 w-4" />
                 {printCopies === 2 ? 'Remover 2ª Via' : 'Adicionar 2ª Via'}
              </button>
            )}

            {!isStudentMode && (
              <>
                <button
                   onClick={() => handleProcessPdf('save')}
                   disabled={isGeneratingPdf}
                   className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                >
                   {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                   Baixar PDF
                </button>

                <button
                   onClick={() => handleProcessPdf('print')}
                   disabled={isPrinting}
                   className="px-4 py-2 bg-gray-900 dark:bg-gray-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-black dark:hover:bg-gray-500 transition-colors shadow-md"
                >
                   {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                   Imprimir
                </button>
              </>
            )}

            <button
               onClick={onSaveAndExit}
               className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-md"
            >
               <CheckCircle className="h-4 w-4" />
               {isStudentMode ? "Salvar (Estudo)" : "Salvar e Sair"}
            </button>
         </div>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-200 dark:bg-gray-950 flex justify-center custom-scrollbar">
         <div id="pdf-source-container" className="w-fit flex flex-col gap-8 items-center pb-20">
            {renderPages()}
         </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pdf-source-container, #pdf-source-container * {
            visibility: visible;
          }
          #pdf-source-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            gap: 0 !important;
          }
          .break-before-page {
            page-break-before: always !important;
            break-before: page !important;
            display: block !important;
            margin-top: 0 !important;
          }
          .prescription-paper {
             box-shadow: none !important;
             border: none !important;
             width: 100% !important;
             height: 100% !important;
             max-width: none !important;
             margin: 0 !important;
             padding: 2cm !important; /* Keep padding for readability */
          }
        }
      `}</style>
    </div>
  );
};

export default Preview;
