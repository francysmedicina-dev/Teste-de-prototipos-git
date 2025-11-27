
import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Plus, Trash2, Check, User, Pill, ClipboardList, AlertCircle, ChevronDown, ChevronUp, Stethoscope, UserCheck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---

interface MedicationItem {
  id: string;
  name: string;
  posology: string; // e.g. "1-0-1", "1-1-1"
}

interface SoapState {
  // Header
  shiftTitle: string;
  
  // Identificação
  patientName: string;
  patientAge: string;
  admissionType: string;
  habits: {
    smoker: boolean;
    smokerLoad: string; // Carga tabágica
    alcohol: boolean;
    alcoholDetails: string; // O que e quanto
    drugs: boolean;
    drugsDetails: string; // Quais e frequência
    sedentary: boolean;
  };
  history: {
    comorbidities: string;
    allergies: string;
    surgeries: string;
  };

  // Meds
  medications: MedicationItem[];

  // Subjective
  chiefComplaint: string; // QP
  hdaText: string; // Texto livre HDA
  
  // New SOCRATES Fields
  socrates: {
    site: string;
    onset: string;
    character: string;
    radiation: string;
    associations: string;
    time: string;
    exacerbatingRelieving: string;
    severity: string;
  };

  deniedSymptoms: { // Negativas
    febre: boolean;
    cefaleia: boolean;
    tontura: boolean;
    dispneia: boolean;
    dorToracica: boolean;
    nauseasVomitos: boolean;
    altIntestinais: boolean; // Diarreia/Constipação
    altUrinarias: boolean;   // Disuria/Polaciuria
  };

  // Objective
  vitals: {
    pa: string;
    fc: string;
    fr: string;
    temp: string;
    sat: string;
    hgt: string;
    glasgow: string;
  };
  exams: {
    general: string;
    acv: string;
    ar: string;
    abd: string;
    neuro: string;
    mmii: string;
  };

  // Assessment
  diagnosis: string; // HD

  // Plan
  planActions: {
    prescricao: boolean;
    exames: boolean;
    alta: boolean;
    internacao: boolean;
    reavaliacao: boolean;
  };
  
  // Detailed Plan Data
  planDetails: {
    prescriptionText: string;
    examsText: string;
    discharge: {
      returnWarning: boolean; // Orientado sinais de alarme
      certificate: boolean;   // Atestado entregue
      followUp: boolean;      // Encaminhamento/Retorno ambulatorial
      medicationGuidance: boolean; // Orientado uso de medicações
    };
    internmentLocation: string; // Enfermaria, UTI, Sala Vermelha, etc
    reevaluationTime: string; // ex: "Em 1 hora", "Após exames"
  };

  planText: string; // Texto livre adicional

  // Identification
  identification: {
    authorName: string;
    role: string; // Médico, Interno, Residente
    supervisorName: string; // Opcional
    crm?: string; // Opcional
  };
}

const INITIAL_STATE: SoapState = {
  shiftTitle: "PS CLÍNICA MÉDICA - PLANTÃO DIURNO",
  patientName: "",
  patientAge: "",
  admissionType: "Demanda Espontânea",
  habits: { 
    smoker: false, smokerLoad: "", 
    alcohol: false, alcoholDetails: "", 
    drugs: false, drugsDetails: "", 
    sedentary: false 
  },
  history: { comorbidities: "", allergies: "", surgeries: "" },
  medications: [],
  chiefComplaint: "",
  hdaText: "",
  socrates: {
    site: "", onset: "", character: "", radiation: "", associations: "", 
    time: "", exacerbatingRelieving: "", severity: ""
  },
  deniedSymptoms: {
    febre: false, cefaleia: false, tontura: false, dispneia: false,
    dorToracica: false, nauseasVomitos: false, altIntestinais: false, altUrinarias: false
  },
  vitals: { pa: "", fc: "", fr: "", temp: "", sat: "", hgt: "", glasgow: "15" },
  exams: { general: "", acv: "", ar: "", abd: "", neuro: "", mmii: "" },
  diagnosis: "",
  planActions: { prescricao: true, exames: false, alta: false, internacao: false, reavaliacao: false },
  planDetails: {
    prescriptionText: "",
    examsText: "",
    discharge: { returnWarning: true, certificate: false, followUp: false, medicationGuidance: true },
    internmentLocation: "Enfermaria",
    reevaluationTime: ""
  },
  planText: "",
  identification: {
    authorName: "",
    role: "Médico(a)",
    supervisorName: "",
    crm: ""
  }
};

// --- Standard Normal Exams ---
const NORMAL_EXAMS = {
  general: "BEG, LOTE, Corado, Hidratado, Anictérico, Afebril.",
  acv: "RCR em 2T, BNF, sem sopros.",
  ar: "MV+ em AHT, sem ruídos adventícios.",
  abd: "Flácido, indolor à palpação, RHA+, sem visceromegalias.",
  neuro: "Pupilas isocóricas e fotorreagentes, sem déficits focais aparentes.",
  mmii: "Sem edema, panturrilhas livres, pulsos presentes."
};

const SoapGenerator: React.FC = () => {
  const [state, setState] = useState<SoapState>(INITIAL_STATE);
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSocrates, setShowSocrates] = useState(false);
  
  // Temporary state for adding medication
  const [newMedName, setNewMedName] = useState("");
  const [newMedPos, setNewMedPos] = useState("");

  // --- Handlers ---

  const handleInputChange = (field: keyof SoapState, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section: keyof SoapState, field: string, value: any) => {
    setState(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value
      }
    }));
  };

  // Specific handler for Plan Details deeper nesting
  const handlePlanDetailChange = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      planDetails: { ...prev.planDetails, [field]: value }
    }));
  };

  const handleDischargeChange = (field: string, value: boolean) => {
    setState(prev => ({
      ...prev,
      planDetails: {
        ...prev.planDetails,
        discharge: {
          ...prev.planDetails.discharge,
          [field]: value
        }
      }
    }));
  };

  const addMedication = () => {
    if (!newMedName) return;
    const newMed: MedicationItem = {
      id: uuidv4(),
      name: newMedName,
      posology: newMedPos || "1-0-0" // Default if empty
    };
    setState(prev => ({ ...prev, medications: [...prev.medications, newMed] }));
    setNewMedName("");
    setNewMedPos("");
  };

  const removeMedication = (id: string) => {
    setState(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }));
  };

  const setExamNormal = (field: keyof typeof NORMAL_EXAMS) => {
    handleNestedChange('exams', field, NORMAL_EXAMS[field]);
  };

  const handleReset = () => {
    if (confirm("Limpar todos os campos e iniciar novo atendimento?")) {
      setState({ ...INITIAL_STATE, shiftTitle: state.shiftTitle, identification: state.identification }); // Keep header and author
    }
  };

  // --- Output Generation ---

  useEffect(() => {
    const { 
      shiftTitle, patientName, patientAge, admissionType, habits, history, medications,
      chiefComplaint, hdaText, socrates, deniedSymptoms, vitals, exams, diagnosis, 
      planActions, planDetails, planText, identification
    } = state;

    // Build Habits String
    const habitsList = [];
    if (habits.smoker) habitsList.push(`Tabagista (${habits.smokerLoad || 'Carga não inf.'})`);
    if (habits.alcohol) habitsList.push(`Etilista (${habits.alcoholDetails || 'Uso não inf.'})`);
    if (habits.drugs) habitsList.push(`Usuário de drogas (${habits.drugsDetails || 'Tipo não inf.'})`);
    if (habits.sedentary) habitsList.push("Sedentário");

    const habitsString = habitsList.length > 0 ? habitsList.join(", ") : "Hábitos: Nega tabagismo, etilismo ou uso de drogas.";

    // Build Denied Symptoms String
    const negativesList = Object.entries(deniedSymptoms)
      .filter(([_, active]) => active)
      .map(([key]) => {
         const labels: Record<string, string> = {
            febre: "febre",
            cefaleia: "cefaleia",
            tontura: "tontura/vertigem",
            dispneia: "dispneia",
            dorToracica: "dor torácica",
            nauseasVomitos: "náuseas/vômitos",
            altIntestinais: "alterações intestinais",
            altUrinarias: "sintomas urinários"
         };
         return labels[key];
      })
      .join(", ");

    const negativeText = negativesList ? `NEGA: ${negativesList}.` : "";

    const medsString = medications.length > 0
      ? medications.map(m => `${m.name} (${m.posology})`).join(", ")
      : "Nega uso contínuo";

    // Build SOCRATES String
    const socratesParts = [
      socrates.site && `Local: ${socrates.site}`,
      socrates.onset && `Início: ${socrates.onset}`,
      socrates.character && `Tipo: ${socrates.character}`,
      socrates.radiation && `Irradiação: ${socrates.radiation}`,
      socrates.associations && `Sint. Assoc.: ${socrates.associations}`,
      socrates.time && `Duração: ${socrates.time}`,
      socrates.exacerbatingRelieving && `Fatores +/-: ${socrates.exacerbatingRelieving}`,
      socrates.severity && `Intensidade: ${socrates.severity}`,
    ].filter(Boolean);
    
    const socratesBlock = socratesParts.length > 0 ? `\n[Detalhes da Queixa]: ${socratesParts.join("; ")}.` : "";

    // Build Plan Details
    const planDetailsArr = [];

    if (planActions.prescricao) {
       planDetailsArr.push(`PRESCRIÇÃO:\n${planDetails.prescriptionText || "(Ver receita anexa)"}`);
    }
    if (planActions.exames) {
       planDetailsArr.push(`EXAMES SOLICITADOS:\n${planDetails.examsText || "Rotina laboratorial"}`);
    }
    if (planActions.internacao) {
       planDetailsArr.push(`INTERNAÇÃO: Destino - ${planDetails.internmentLocation}`);
    }
    if (planActions.reavaliacao) {
       planDetailsArr.push(`REAVALIAÇÃO: ${planDetails.reevaluationTime || "Aguardar exames/evolução"}`);
    }
    if (planActions.alta) {
       const dischargeItems = [];
       if (planDetails.discharge.medicationGuidance) dischargeItems.push("Uso das medicações explicado");
       if (planDetails.discharge.returnWarning) dischargeItems.push("Sinais de alarme orientados (retornar se piora)");
       if (planDetails.discharge.certificate) dischargeItems.push("Atestado médico fornecido");
       if (planDetails.discharge.followUp) dischargeItems.push("Encaminhamento para especialista/UBS");
       
       planDetailsArr.push(`ALTA MÉDICA:\n${dischargeItems.map(i => `- ${i}`).join("\n")}`);
    }

    const detailedPlan = planDetailsArr.length > 0 ? `\n${planDetailsArr.join("\n\n")}` : "";

    // Build Identification
    let signBlock = "";
    if (identification.authorName) {
       signBlock = `\n____________________________\n${identification.authorName}\n${identification.role}${identification.crm ? " - CRM: " + identification.crm : ""}`;
       if (identification.supervisorName && (identification.role === 'Interno' || identification.role === 'Residente')) {
          signBlock += `\n\nSupervisão: Dr(a). ${identification.supervisorName}`;
       }
    }

    // Template Construction
    const text = `
${shiftTitle.toUpperCase()}
PACIENTE: ${patientName || "Não identificado"}, ${patientAge || "?"} anos.
ADMISSÃO: ${admissionType}

# ANTECEDENTES:
${history.comorbidities || "Comorbidades: Nega"} | ${history.surgeries || "Cirurgias: Nega"}
${habitsString}
ALERGIAS: ${history.allergies || "Nega"}
MEDICAÇÕES: ${medsString}

# S (SUBJETIVO):
QP: ${chiefComplaint || "Não referida"}
HDA: ${hdaText || "Paciente refere..."}${socratesBlock}
${negativeText}

# O (OBJETIVO):
SSVV: PA: ${vitals.pa || "-"} FC: ${vitals.fc || "-"} FR: ${vitals.fr || "-"} Sat: ${vitals.sat || "-"}% Tax: ${vitals.temp || "-"}ºC HGT: ${vitals.hgt || "-"}
GERAL: ${exams.general || "-"}
AR: ${exams.ar || "-"} | ACV: ${exams.acv || "-"} | ABD: ${exams.abd || "-"} | NEURO: ${exams.neuro || "-"}

# A (AVALIAÇÃO):
HD: ${diagnosis || "A esclarecer"}

# P (CONDUTA):
${planText}${detailedPlan}

${signBlock}
`.trim();

    setOutputText(text);
  }, [state]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 p-2">
      
      {/* LEFT COLUMN - EDITOR */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar">
        
        {/* 1. HEADER EDITÁVEL */}
        <div className="bg-medical-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <input
            type="text"
            value={state.shiftTitle}
            onChange={(e) => handleInputChange('shiftTitle', e.target.value)}
            className="w-full text-center font-black text-xl text-medical-800 dark:text-medical-300 bg-transparent border-none focus:ring-0 placeholder-gray-400 uppercase tracking-wide"
            placeholder="TÍTULO DO PLANTÃO"
          />
        </div>

        <div className="p-6 space-y-8">

          {/* 2. IDENTIFICAÇÃO E ANTECEDENTES */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 border-b pb-1">
              <User className="h-4 w-4" /> Dados do Paciente
            </h3>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Nome</label>
                <input 
                  value={state.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nome do Paciente"
                />
              </div>
              <div className="w-24">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Idade</label>
                <input 
                  value={state.patientAge}
                  onChange={(e) => handleInputChange('patientAge', e.target.value)}
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Anos"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Admissão</label>
              <select 
                value={state.admissionType}
                onChange={(e) => handleInputChange('admissionType', e.target.value)}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                <option>Demanda Espontânea</option>
                <option>SAMU</option>
                <option>SIATE / Bombeiros</option>
                <option>Transferência</option>
                <option>Retorno</option>
                <option>Encaminhamento UBS</option>
              </select>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
               <label className="text-xs font-bold text-gray-500 uppercase">Hábitos de Vida</label>
               
               {/* TABAGISMO */}
               <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-1">
                    <input type="checkbox" checked={state.habits.smoker} onChange={(e) => handleNestedChange('habits', 'smoker', e.target.checked)} className="text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tabagista</span>
                  </label>
                  {state.habits.smoker && (
                    <input 
                      value={state.habits.smokerLoad}
                      onChange={(e) => handleNestedChange('habits', 'smokerLoad', e.target.value)}
                      className="w-full p-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none animate-in slide-in-from-top-1"
                      placeholder="Carga tabágica (ex: 20 maços/ano)..."
                    />
                  )}
               </div>

               {/* ETILISMO */}
               <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-1">
                    <input type="checkbox" checked={state.habits.alcohol} onChange={(e) => handleNestedChange('habits', 'alcohol', e.target.checked)} className="text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Etilista</span>
                  </label>
                  {state.habits.alcohol && (
                    <input 
                      value={state.habits.alcoholDetails}
                      onChange={(e) => handleNestedChange('habits', 'alcoholDetails', e.target.value)}
                      className="w-full p-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none animate-in slide-in-from-top-1"
                      placeholder="Tipo e frequência (ex: Social, Cerveja fds)..."
                    />
                  )}
               </div>

               {/* DROGAS */}
               <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-1">
                    <input type="checkbox" checked={state.habits.drugs} onChange={(e) => handleNestedChange('habits', 'drugs', e.target.checked)} className="text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuário de Drogas</span>
                  </label>
                  {state.habits.drugs && (
                    <input 
                      value={state.habits.drugsDetails}
                      onChange={(e) => handleNestedChange('habits', 'drugsDetails', e.target.value)}
                      className="w-full p-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none animate-in slide-in-from-top-1"
                      placeholder="Substâncias e frequência..."
                    />
                  )}
               </div>

               {/* SEDENTARISMO */}
               <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={state.habits.sedentary} onChange={(e) => handleNestedChange('habits', 'sedentary', e.target.checked)} className="text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sedentário</span>
                  </label>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <textarea 
                value={state.history.comorbidities}
                onChange={(e) => handleNestedChange('history', 'comorbidities', e.target.value)}
                placeholder="Comorbidades (HAS, DM...)"
                className="p-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-20 resize-none outline-none focus:border-blue-500"
              />
              <textarea 
                value={state.history.allergies}
                onChange={(e) => handleNestedChange('history', 'allergies', e.target.value)}
                placeholder="ALERGIAS"
                className={`p-2 text-xs rounded border h-20 resize-none outline-none focus:border-red-500 ${state.history.allergies ? 'bg-red-50 border-red-300 text-red-800 font-bold placeholder-red-300' : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white'}`}
              />
              <textarea 
                value={state.history.surgeries}
                onChange={(e) => handleNestedChange('history', 'surgeries', e.target.value)}
                placeholder="Cirurgias Prévias"
                className="p-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-20 resize-none outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* 3. MEDICAÇÕES DE USO CONTÍNUO */}
          <section className="space-y-4 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase flex items-center gap-2 border-b border-blue-200 pb-1">
              <Pill className="h-4 w-4" /> Medicação Contínua
            </h3>
            
            <div className="flex gap-2 items-end">
               <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Nome e Dose</label>
                  <input 
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="Ex: Losartana 50mg"
                    className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                  />
               </div>
               <div className="w-24">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Posologia</label>
                  <input 
                    value={newMedPos}
                    onChange={(e) => setNewMedPos(e.target.value)}
                    placeholder="1-0-1"
                    className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none text-center"
                    onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                  />
               </div>
               <button 
                 onClick={addMedication}
                 className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
               >
                 <Plus className="h-5 w-5" />
               </button>
            </div>

            <div className="space-y-2">
               {state.medications.map(med => (
                 <div key={med.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 px-3 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2">
                       <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{med.name}</span>
                       <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-mono">
                         {med.posology}
                       </span>
                    </div>
                    <button onClick={() => removeMedication(med.id)} className="text-red-400 hover:text-red-600">
                       <Trash2 className="h-4 w-4" />
                    </button>
                 </div>
               ))}
               {state.medications.length === 0 && (
                 <p className="text-xs text-gray-400 italic text-center">Nenhuma medicação adicionada.</p>
               )}
            </div>
          </section>

          {/* 4. SOAP */}
          
          {/* S - Subjetivo */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <span className="font-black text-xl text-blue-600">S</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">SUBJETIVO</span>
             </div>

             <div>
               <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Queixa Principal (QP)</label>
               <input 
                 value={state.chiefComplaint}
                 onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                 className="w-full p-2 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:border-blue-500 outline-none text-lg font-medium"
                 placeholder="Digite a queixa..."
               />
             </div>

             <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">História da Doença Atual (HDA)</label>
                <textarea 
                    value={state.hdaText}
                    onChange={(e) => handleInputChange('hdaText', e.target.value)}
                    className="w-full p-3 h-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed"
                    placeholder="Descrição livre da história clínica..."
                />
                
                {/* SOCRATES EXPANSION */}
                <div className="mt-2">
                   <button 
                     onClick={() => setShowSocrates(!showSocrates)}
                     className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                   >
                     {showSocrates ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} 
                     {showSocrates ? "Ocultar Anamnese Detalhada (SOCRATES)" : "Expandir SOCRATES Detalhado"}
                   </button>
                   
                   {showSocrates && (
                     <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30 animate-in slide-in-from-top-2">
                        <div className="col-span-1 md:col-span-2 text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">
                           Protocolo SOCRATES para avaliação da dor/queixa
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500">Site (Local)</label>
                           <input 
                              value={state.socrates.site} 
                              onChange={(e) => handleNestedChange('socrates', 'site', e.target.value)}
                              className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="Onde dói?" 
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500">Onset (Início)</label>
                           <input 
                              value={state.socrates.onset} 
                              onChange={(e) => handleNestedChange('socrates', 'onset', e.target.value)}
                              className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="Quando começou? Súbito ou gradual?" 
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500">Character (Tipo/Caráter)</label>
                           <input 
                              value={state.socrates.character} 
                              onChange={(e) => handleNestedChange('socrates', 'character', e.target.value)}
                              className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="Pontada, queimação, aperto..." 
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500">Radiation (Irradiação)</label>
                           <input 
                              value={state.socrates.radiation} 
                              onChange={(e) => handleNestedChange('socrates', 'radiation', e.target.value)}
                              className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="Vai para algum lugar?" 
                           />
                        </div>
                         <div>
                           <label className="text-[10px] font-bold text-gray-500">Associations (Sintomas Assoc.)</label>
                           <input 
                              value={state.socrates.associations} 
                              onChange={(e) => handleNestedChange('socrates', 'associations', e.target.value)}
                              className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="Náusea, sudorese, febre..." 
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500">Time (Tempo/Duração)</label>
                           <input 
                              value={state.socrates.time} 
                              onChange={(e) => handleNestedChange('socrates', 'time', e.target.value)}
                              className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="Quanto tempo dura? É constante?" 
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500">Exacerbating/Relieving (Fatores)</label>
                           <input 
                              value={state.socrates.exacerbatingRelieving} 
                              onChange={(e) => handleNestedChange('socrates', 'exacerbatingRelieving', e.target.value)}
                              className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="O que melhora ou piora?" 
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-gray-500">Severity (Intensidade)</label>
                           <input 
                              value={state.socrates.severity} 
                              onChange={(e) => handleNestedChange('socrates', 'severity', e.target.value)}
                              className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="Escala 0 a 10" 
                           />
                        </div>
                     </div>
                   )}
                </div>
             </div>

             <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Sintomas Negados (Marque o que o paciente NEGA)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                   {Object.keys(state.deniedSymptoms).map(key => {
                     const labels: Record<string, string> = {
                        febre: "Febre",
                        cefaleia: "Cefaleia",
                        tontura: "Tontura",
                        dispneia: "Falta de Ar",
                        dorToracica: "Dor Torácica",
                        nauseasVomitos: "Náuseas/Vômitos",
                        altIntestinais: "Alt. Intestinais",
                        altUrinarias: "Alt. Urinárias"
                     };
                     
                     return (
                        <label key={key} className="flex items-center gap-2 p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <input 
                            type="checkbox"
                            checked={(state.deniedSymptoms as any)[key]}
                            onChange={(e) => handleNestedChange('deniedSymptoms', key, e.target.checked)}
                            className="text-red-500 rounded focus:ring-red-400"
                            />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{labels[key]}</span>
                        </label>
                     );
                   })}
                </div>
             </div>
          </section>

          {/* O - Objetivo */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <span className="font-black text-xl text-green-600">O</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">OBJETIVO (Exame Físico)</span>
             </div>

             {/* Vitals */}
             <div className="grid grid-cols-3 md:grid-cols-7 gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                {Object.keys(state.vitals).map(key => (
                   <div key={key} className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-500 uppercase text-center">{key}</label>
                      <input 
                        value={(state.vitals as any)[key]}
                        onChange={(e) => handleNestedChange('vitals', key, e.target.value)}
                        className="text-center p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-1 focus:ring-green-500 outline-none"
                        placeholder="-"
                      />
                   </div>
                ))}
             </div>

             {/* Exam Segments */}
             <div className="space-y-3">
                {[
                  { key: 'general', label: 'Geral' },
                  { key: 'acv', label: 'ACV' },
                  { key: 'ar', label: 'AR' },
                  { key: 'abd', label: 'Abdome' },
                  { key: 'neuro', label: 'Neuro' },
                  { key: 'mmii', label: 'MMII' },
                ].map(seg => (
                   <div key={seg.key}>
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">{seg.label}</span>
                         <button 
                           onClick={() => setExamNormal(seg.key as keyof typeof NORMAL_EXAMS)}
                           className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded hover:bg-green-200 transition font-bold"
                         >
                            NORMAL
                         </button>
                      </div>
                      <input 
                        value={(state.exams as any)[seg.key]}
                        onChange={(e) => handleNestedChange('exams', seg.key, e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-green-500 outline-none"
                        placeholder={`Descreva ${seg.label}...`}
                      />
                   </div>
                ))}
             </div>
          </section>

          {/* A - Avaliação */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <span className="font-black text-xl text-yellow-600">A</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">AVALIAÇÃO</span>
             </div>
             <input 
                value={state.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-lg font-medium bg-yellow-50 dark:bg-yellow-900/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="Hipótese Diagnóstica / CID"
             />
          </section>

          {/* P - Plano */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <span className="font-black text-xl text-purple-600">P</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">CONDUTA (Plano)</span>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {Object.keys(state.planActions).map(key => (
                   <label key={key} className={`px-3 py-1.5 rounded-full border cursor-pointer text-sm transition-colors ${
                     (state.planActions as any)[key] 
                     ? 'bg-purple-100 border-purple-300 text-purple-700 font-bold' 
                     : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                   }`}>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={(state.planActions as any)[key]}
                        onChange={(e) => handleNestedChange('planActions', key, e.target.checked)}
                      />
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                   </label>
                ))}
             </div>

             {/* Dynamic Plan Fields based on Selection */}
             <div className="space-y-3 pl-2 border-l-2 border-purple-200 dark:border-purple-800">
                
                {state.planActions.prescricao && (
                   <div className="animate-in slide-in-from-left-2 fade-in">
                      <label className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1">Prescrição Realizada</label>
                      <textarea
                         value={state.planDetails.prescriptionText}
                         onChange={(e) => handlePlanDetailChange('prescriptionText', e.target.value)}
                         className="w-full p-2 text-sm border border-purple-100 dark:border-purple-900 rounded bg-purple-50 dark:bg-purple-900/10 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-purple-500 outline-none h-20"
                         placeholder="Descreva o que foi prescrito (analgesia, antibiótico, etc)..."
                      />
                   </div>
                )}

                {state.planActions.exames && (
                   <div className="animate-in slide-in-from-left-2 fade-in">
                      <label className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1">Exames Solicitados</label>
                      <textarea
                         value={state.planDetails.examsText}
                         onChange={(e) => handlePlanDetailChange('examsText', e.target.value)}
                         className="w-full p-2 text-sm border border-purple-100 dark:border-purple-900 rounded bg-purple-50 dark:bg-purple-900/10 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-purple-500 outline-none h-20"
                         placeholder="Hemograma, PCR, Raio-X..."
                      />
                   </div>
                )}

                {state.planActions.alta && (
                   <div className="animate-in slide-in-from-left-2 fade-in bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                      <label className="text-xs font-bold text-green-700 dark:text-green-400 block mb-2">Checklist de Alta</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={state.planDetails.discharge.medicationGuidance} onChange={(e) => handleDischargeChange('medicationGuidance', e.target.checked)} className="rounded text-green-600 focus:ring-green-500"/>
                            Orientado uso de medicações
                         </label>
                         <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={state.planDetails.discharge.returnWarning} onChange={(e) => handleDischargeChange('returnWarning', e.target.checked)} className="rounded text-green-600 focus:ring-green-500"/>
                            Sinais de alarme / Retorno se piora
                         </label>
                         <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={state.planDetails.discharge.certificate} onChange={(e) => handleDischargeChange('certificate', e.target.checked)} className="rounded text-green-600 focus:ring-green-500"/>
                            Atestado Médico entregue
                         </label>
                         <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={state.planDetails.discharge.followUp} onChange={(e) => handleDischargeChange('followUp', e.target.checked)} className="rounded text-green-600 focus:ring-green-500"/>
                            Encaminhamento / Ambulatório
                         </label>
                      </div>
                   </div>
                )}

                {state.planActions.internacao && (
                   <div className="animate-in slide-in-from-left-2 fade-in">
                      <label className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1">Local de Internação / Destino</label>
                      <select
                         value={state.planDetails.internmentLocation}
                         onChange={(e) => handlePlanDetailChange('internmentLocation', e.target.value)}
                         className="w-full p-2 text-sm border border-purple-100 dark:border-purple-900 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500 outline-none"
                      >
                         <option>Enfermaria</option>
                         <option>UTI</option>
                         <option>Sala Vermelha (Emergência)</option>
                         <option>Sala Amarela (Observação)</option>
                         <option>Centro Cirúrgico</option>
                         <option>Transferência Externa</option>
                      </select>
                   </div>
                )}

                {state.planActions.reavaliacao && (
                   <div className="animate-in slide-in-from-left-2 fade-in">
                      <label className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1">Reavaliação</label>
                      <input
                         value={state.planDetails.reevaluationTime}
                         onChange={(e) => handlePlanDetailChange('reevaluationTime', e.target.value)}
                         className="w-full p-2 text-sm border border-purple-100 dark:border-purple-900 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500 outline-none"
                         placeholder="Ex: Em 1 hora, Após resultado de exames..."
                      />
                   </div>
                )}

             </div>

             <label className="text-xs font-bold text-gray-500 block uppercase mt-2">Observações Adicionais</label>
             <textarea 
               value={state.planText}
               onChange={(e) => handleInputChange('planText', e.target.value)}
               className="w-full p-3 h-20 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
               placeholder="Outros detalhes da conduta..."
             />
          </section>

          {/* 5. IDENTIFICAÇÃO DO PROFISSIONAL */}
          <section className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
             <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <UserCheck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase">Identificação do Profissional</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Nome do Profissional (Quem atendeu)</label>
                   <input 
                      value={state.identification.authorName}
                      onChange={(e) => handleNestedChange('identification', 'authorName', e.target.value)}
                      className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="Seu nome"
                   />
                </div>
                <div>
                   <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Função</label>
                   <select 
                      value={state.identification.role}
                      onChange={(e) => handleNestedChange('identification', 'role', e.target.value)}
                      className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                   >
                      <option>Médico(a)</option>
                      <option>Residente</option>
                      <option>Interno(a)</option>
                      <option>Enfermeiro(a)</option>
                   </select>
                </div>
                
                {(state.identification.role === 'Interno(a)' || state.identification.role === 'Residente') && (
                   <div className="md:col-span-2 animate-in slide-in-from-top-1 fade-in">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Supervisor / Preceptor</label>
                      <input 
                         value={state.identification.supervisorName}
                         onChange={(e) => handleNestedChange('identification', 'supervisorName', e.target.value)}
                         className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                         placeholder="Dr(a). Supervisor"
                      />
                   </div>
                )}
                 <div>
                   <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">CRM / Registro (Opcional)</label>
                   <input 
                      value={state.identification.crm || ""}
                      onChange={(e) => handleNestedChange('identification', 'crm', e.target.value)}
                      className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="12345/UF"
                   />
                </div>
             </div>
          </section>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
             <button 
               onClick={handleReset}
               className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded flex items-center justify-center gap-2"
             >
                <RefreshCw className="h-4 w-4" /> Novo Atendimento (Limpar)
             </button>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN - PREVIEW */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4">
         <div className="bg-gray-800 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
               <ClipboardList className="h-5 w-5" />
               <span className="font-bold">Texto Gerado</span>
            </div>
            <button 
              onClick={handleCopy}
              className={`p-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                 copied ? 'bg-green-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-200'
              }`}
            >
               {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
               {copied ? 'Copiado!' : 'Copiar'}
            </button>
         </div>

         <div className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 overflow-hidden flex flex-col">
            <textarea 
               readOnly
               value={outputText}
               className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-300 leading-relaxed custom-scrollbar outline-none"
            />
         </div>
         
         <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <AlertCircle className="h-4 w-4 inline mr-1 mb-0.5" />
            Este texto é gerado automaticamente. Revise sempre antes de salvar no prontuário.
         </div>
      </div>

    </div>
  );
};

export default SoapGenerator;
