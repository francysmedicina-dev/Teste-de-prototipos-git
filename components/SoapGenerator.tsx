import React, { useState, useEffect, useMemo } from 'react';
import { Copy, RefreshCw, Plus, Trash2, Check, User, Pill, ClipboardList, AlertCircle, ChevronDown, ChevronUp, Stethoscope, UserCheck, ArrowLeft, Siren, Activity, Wind, HeartPulse, Brain, Eye, AlertTriangle, Syringe, BedDouble } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---

interface MedicationItem {
  id: string;
  name: string;
  posology: string;
}

interface SoapState {
  mode: 'standard' | 'trauma';

  // Common Header
  shiftTitle: string;
  patientName: string;
  patientAge: string;
  admissionType: string;

  // --- STANDARD MODE DATA ---
  habits: {
    smoker: boolean;
    smokerLoad: string;
    alcohol: boolean;
    alcoholDetails: string;
    drugs: boolean;
    drugsDetails: string;
    sedentary: boolean;
  };
  history: {
    comorbidities: string;
    allergies: string;
    surgeries: string;
  };
  medications: MedicationItem[];
  chiefComplaint: string;
  hdaText: string;
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
  deniedSymptoms: {
    febre: boolean;
    cefaleia: boolean;
    tontura: boolean;
    dispneia: boolean;
    dorToracica: boolean;
    nauseasVomitos: boolean;
    altIntestinais: boolean;
    altUrinarias: boolean;
  };
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
  diagnosis: string;
  planActions: {
    prescricao: boolean;
    exames: boolean;
    alta: boolean;
    internacao: boolean;
    reavaliacao: boolean;
  };
  planDetails: {
    prescriptionText: string;
    examsText: string;
    discharge: {
      returnWarning: boolean;
      certificate: boolean;
      followUp: boolean;
      medicationGuidance: boolean;
    };
    internmentLocation: string;
    reevaluationTime: string;
  };
  planText: string;

  // --- TRAUMA MODE DATA ---
  trauma: {
    mechanism: string;
    prehospital: {
      iotAtScene: boolean;
      cervicalCollar: boolean;
      backboard: boolean;
      ivAccess: boolean;
    };
    primarySurvey: {
      x: { 
        contained: boolean; 
        tourniquet: boolean; 
        noExternalBleeding: boolean; 
      };
      a: { 
        airway: string; // Pervia, Obstruida, TOT, TQT
        cervicalProtection: boolean; 
      };
      b: { 
        murmurs: string; // Simetrico, Diminuido D, Diminuido E
        expansion: string; // Normal, Assimetrica
      };
      c: { 
        pulses: string; // Cheios, Filiformes, Ausentes
        skin: string; // Corada, Palida, Cianotica
        fast: string; // Positivo, Negativo, Nao realizado
      };
      d: {
        glasgowOcular: string; // 1-4
        glasgowVerbal: string; // 1-5 or 'T'
        glasgowMotor: string;  // 1-6
        pupils: string; // Isocoricas, Anisocoricas...
      };
      e: { 
        injuries: string; 
      };
    };
    immediateActions: {
      monitoring: boolean;
      oxygen: boolean;
      tomography: boolean;
      labTrauma: boolean;
      bloodBank: boolean;
      consultGenSurg: boolean;
      consultNeuro: boolean;
      consultOrtho: boolean;
    };
    procedures: {
        iot: boolean;
        cvc: boolean;
        thoracentesis: boolean;
        thoracotomy: boolean;
        cve: boolean;
        fast: boolean;
        immobilization: boolean;
    };
    disposition: string; // Destination
  };

  // Identification
  identification: {
    authorName: string;
    role: string;
    supervisorName: string;
    crm?: string;
  };
}

const INITIAL_STATE: SoapState = {
  mode: 'standard',
  shiftTitle: "PS CLÍNICA MÉDICA - PLANTÃO DIURNO",
  patientName: "",
  patientAge: "",
  admissionType: "Demanda Espontânea",
  
  // Standard Defaults
  habits: { smoker: false, smokerLoad: "", alcohol: false, alcoholDetails: "", drugs: false, drugsDetails: "", sedentary: false },
  history: { comorbidities: "", allergies: "", surgeries: "" },
  medications: [],
  chiefComplaint: "",
  hdaText: "",
  socrates: { site: "", onset: "", character: "", radiation: "", associations: "", time: "", exacerbatingRelieving: "", severity: "" },
  deniedSymptoms: { febre: false, cefaleia: false, tontura: false, dispneia: false, dorToracica: false, nauseasVomitos: false, altIntestinais: false, altUrinarias: false },
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

  // Trauma Defaults
  trauma: {
    mechanism: "",
    prehospital: { iotAtScene: false, cervicalCollar: false, backboard: false, ivAccess: false },
    primarySurvey: {
      x: { contained: false, tourniquet: false, noExternalBleeding: true },
      a: { airway: "Pérvia", cervicalProtection: true },
      b: { murmurs: "Simétrico", expansion: "Normal" },
      c: { pulses: "Cheios", skin: "Corada", fast: "Não realizado" },
      d: { glasgowOcular: "4", glasgowVerbal: "5", glasgowMotor: "6", pupils: "Isocóricas" },
      e: { injuries: "" }
    },
    immediateActions: {
      monitoring: true, oxygen: true, tomography: false, labTrauma: false,
      bloodBank: false, consultGenSurg: false, consultNeuro: false, consultOrtho: false
    },
    procedures: {
        iot: false, cvc: false, thoracentesis: false, thoracotomy: false, cve: false, fast: false, immobilization: false
    },
    disposition: "Observação Sala Vermelha"
  },

  identification: { authorName: "", role: "Médico(a)", supervisorName: "", crm: "" }
};

const NORMAL_EXAMS = {
  general: "BEG, LOTE, Corado, Hidratado, Anictérico, Afebril.",
  acv: "RCR em 2T, BNF, sem sopros.",
  ar: "MV+ em AHT, sem ruídos adventícios.",
  abd: "Flácido, indolor à palpação, RHA+, sem visceromegalias.",
  neuro: "Pupilas isocóricas e fotorreagentes, sem déficits focais aparentes.",
  mmii: "Sem edema, panturrilhas livres, pulsos presentes."
};

const PLAN_ACTION_LABELS: Record<string, string> = {
  prescricao: "Prescrição",
  exames: "Exames",
  alta: "Alta",
  internacao: "Internação",
  reavaliacao: "Reavaliação"
};

interface SoapGeneratorProps {
  onBack?: () => void;
}

const SoapGenerator: React.FC<SoapGeneratorProps> = ({ onBack }) => {
  const [state, setState] = useState<SoapState>(INITIAL_STATE);
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSocrates, setShowSocrates] = useState(false);
  
  const [newMedName, setNewMedName] = useState("");
  const [newMedPos, setNewMedPos] = useState("");

  // --- Helpers & Calculations ---

  const glasgowScore = useMemo(() => {
    const { glasgowOcular, glasgowVerbal, glasgowMotor } = state.trauma.primarySurvey.d;
    const eye = parseInt(glasgowOcular) || 0;
    const motor = parseInt(glasgowMotor) || 0;
    
    if (glasgowVerbal === 'T') {
      return `${eye + motor}T (O:${eye} V:T M:${motor})`;
    } else {
      const verbal = parseInt(glasgowVerbal) || 0;
      return `${eye + verbal + motor} (O:${eye} V:${verbal} M:${motor})`;
    }
  }, [state.trauma.primarySurvey.d]);

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

  const handleTraumaChange = (section: keyof typeof state.trauma, field: string, value: any, nestedSection?: string) => {
    setState(prev => {
      if (nestedSection) {
        return {
          ...prev,
          trauma: {
            ...prev.trauma,
            [section]: {
              ...(prev.trauma[section] as any),
              [nestedSection]: {
                ...(prev.trauma[section] as any)[nestedSection],
                [field]: value
              }
            }
          }
        };
      } else {
        return {
          ...prev,
          trauma: {
            ...prev.trauma,
            [section]: {
              ...(prev.trauma[section] as any),
              [field]: value
            }
          }
        };
      }
    });
  };

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
      posology: newMedPos || "1-0-0"
    };
    setState(prev => ({ ...prev, medications: [...prev.medications, newMed] }));
    setNewMedName("");
    setNewMedPos("");
  };

  // Allow editing medications in the list (especially for Trauma mode)
  const updateMedication = (id: string, field: keyof MedicationItem, value: string) => {
    setState(prev => ({
      ...prev,
      medications: prev.medications.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
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
      setState({ ...INITIAL_STATE, shiftTitle: state.shiftTitle, identification: state.identification, mode: state.mode }); 
    }
  };

  // --- Output Generation ---

  useEffect(() => {
    const { 
      mode, shiftTitle, patientName, patientAge, admissionType, habits, history, medications,
      chiefComplaint, hdaText, socrates, deniedSymptoms, vitals, exams, diagnosis, 
      planActions, planDetails, planText, identification, trauma
    } = state;

    let textBody = "";

    // --- Identification Block (Common) ---
    let signBlock = "";
    if (identification.authorName) {
       signBlock = `\n____________________________\n${identification.authorName}\n${identification.role}${identification.crm ? " - CRM: " + identification.crm : ""}`;
       
       if (identification.supervisorName && (identification.role === 'Interno(a)' || identification.role === 'Residente')) {
          signBlock += `\n\nSupervisão: Dr(a). ${identification.supervisorName}`;
       }
    }

    // Common String Builders
    const medsString = medications.length > 0 ? medications.map(m => `${m.name} (${m.posology})`).join(", ") : "Nega uso contínuo";
    const allergiesString = history.allergies || "Nega";

    if (mode === 'standard') {
      // --- STANDARD OUTPUT ---
      const habitsList = [];
      if (habits.smoker) habitsList.push(`Tabagista (${habits.smokerLoad || 'Carga não inf.'})`);
      if (habits.alcohol) habitsList.push(`Etilista (${habits.alcoholDetails || 'Uso não inf.'})`);
      if (habits.drugs) habitsList.push(`Usuário de drogas (${habits.drugsDetails || 'Tipo não inf.'})`);
      if (habits.sedentary) habitsList.push("Sedentário");
      const habitsString = habitsList.length > 0 ? habitsList.join(", ") : "Hábitos: Nega tabagismo, etilismo ou uso de drogas.";

      const negativesList = Object.entries(deniedSymptoms).filter(([_, v]) => v).map(([k]) => k).join(", ");
      const negativeText = negativesList ? `NEGA: ${negativesList}.` : "";

      const socratesParts = [
        socrates.site && `Local: ${socrates.site}`,
        socrates.onset && `Início: ${socrates.onset}`,
        socrates.character && `Tipo: ${socrates.character}`,
        socrates.radiation && `Irradiação: ${socrates.radiation}`,
        socrates.associations && `Sint. Assoc.: ${socrates.associations}`,
        socrates.time && `Duração: ${socrates.time}`,
        socrates.exacerbatingRelieving && `Fatores +/-: ${socrates.exacerbatingRelieving}`,
        socrates.severity && `Intensidade: ${socrates.severity}`,
      ].filter(Boolean).join("; ");
      const socratesBlock = socratesParts ? `\n[Detalhes da Queixa]: ${socratesParts}.` : "";

      const planDetailsArr = [];
      if (planActions.prescricao) planDetailsArr.push(`PRESCRIÇÃO:\n${planDetails.prescriptionText || "(Ver receita anexa)"}`);
      if (planActions.exames) planDetailsArr.push(`EXAMES SOLICITADOS:\n${planDetails.examsText || "Rotina laboratorial"}`);
      if (planActions.internacao) planDetailsArr.push(`INTERNAÇÃO: Destino - ${planDetails.internmentLocation}`);
      if (planActions.reavaliacao) planDetailsArr.push(`REAVALIAÇÃO: ${planDetails.reevaluationTime || "Aguardar exames/evolução"}`);
      if (planActions.alta) {
         const dischargeItems = [];
         if (planDetails.discharge.medicationGuidance) dischargeItems.push("Uso das medicações explicado");
         if (planDetails.discharge.returnWarning) dischargeItems.push("Sinais de alarme orientados");
         if (planDetails.discharge.certificate) dischargeItems.push("Atestado médico fornecido");
         if (planDetails.discharge.followUp) dischargeItems.push("Encaminhamento para especialista/UBS");
         planDetailsArr.push(`ALTA MÉDICA:\n${dischargeItems.map(i => `- ${i}`).join("\n")}`);
      }
      const detailedPlan = planDetailsArr.length > 0 ? `\n${planDetailsArr.join("\n\n")}` : "";

      textBody = `
# ANTECEDENTES:
${history.comorbidities || "Comorbidades: Nega"} | ${history.surgeries || "Cirurgias: Nega"}
${habitsString}
ALERGIAS: ${allergiesString}
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
${planText}${detailedPlan}`;

    } else {
      // --- TRAUMA MODE OUTPUT ---
      const preHosp = [];
      if (trauma.prehospital.iotAtScene) preHosp.push("IOT na cena");
      if (trauma.prehospital.cervicalCollar) preHosp.push("Colar Cervical");
      if (trauma.prehospital.backboard) preHosp.push("Prancha Rígida");
      if (trauma.prehospital.ivAccess) preHosp.push("Acesso Venoso");
      
      const xStatus = [];
      if (trauma.primarySurvey.x.noExternalBleeding) xStatus.push("Sem sangramento externo visível");
      if (trauma.primarySurvey.x.contained) xStatus.push("Hemorragia contida");
      if (trauma.primarySurvey.x.tourniquet) xStatus.push("Torniquete aplicado");

      // Procedures Done
      const proceduresDone = [];
      if (trauma.procedures.iot) proceduresDone.push("Intubação Orotraqueal (IOT)");
      if (trauma.procedures.cvc) proceduresDone.push("Acesso Venoso Central");
      if (trauma.procedures.thoracentesis) proceduresDone.push("Toracocentese de Alívio");
      if (trauma.procedures.thoracotomy) proceduresDone.push("Drenagem de Tórax");
      if (trauma.procedures.cve) proceduresDone.push("Cardioversão/Desfibrilação");
      if (trauma.procedures.fast) proceduresDone.push("E-FAST");
      if (trauma.procedures.immobilization) proceduresDone.push("Imobilização de Fraturas");

      // Immediate Actions Plan (Verbs)
      const actions = [];
      if (trauma.immediateActions.monitoring) actions.push("Realizo monitorização multiparamétrica contínua");
      if (trauma.immediateActions.oxygen) actions.push("Prescrevo O2 suplementar");
      if (trauma.immediateActions.tomography) actions.push("Solicito Tomografia (TC)");
      if (trauma.immediateActions.labTrauma) actions.push("Solicito Laboratório (Rotina Trauma)");
      if (trauma.immediateActions.bloodBank) actions.push("Solicito reserva de hemoderivados");
      if (trauma.immediateActions.consultGenSurg) actions.push("Solicito avaliação da Cirurgia Geral");
      if (trauma.immediateActions.consultNeuro) actions.push("Solicito avaliação da Neurocirurgia");
      if (trauma.immediateActions.consultOrtho) actions.push("Solicito avaliação da Ortopedia");

      textBody = `
MECANISMO DO TRAUMA: ${trauma.mechanism || "Não informado"}
DADOS PRÉ-HOSPITALAR: ${preHosp.join(", ") || "-"}
ALERGIAS: ${allergiesString}
MEDICAÇÕES EM USO: ${medsString}

# AVALIAÇÃO PRIMÁRIA (XABCDE):
X (Hemorragia): ${xStatus.join(", ") || "Não avaliado"}
A (Vias Aéreas): ${trauma.primarySurvey.a.airway}. Proteção Cervical: ${trauma.primarySurvey.a.cervicalProtection ? "Sim" : "Não"}.
B (Respiração): Murmúrio: ${trauma.primarySurvey.b.murmurs}. Expansão: ${trauma.primarySurvey.b.expansion}. SatO2: ${vitals.sat || "-"}%.
C (Circulação): Pulsos: ${trauma.primarySurvey.c.pulses}. Pele: ${trauma.primarySurvey.c.skin}. FAST: ${trauma.primarySurvey.c.fast}. PA: ${vitals.pa || "-"} FC: ${vitals.fc || "-"}
D (Neurológico): Glasgow: ${glasgowScore}. Pupilas: ${trauma.primarySurvey.d.pupils}.
E (Exposição): ${trauma.primarySurvey.e.injuries || "Sem lesões aparentes descritas."}

# PROCEDIMENTOS REALIZADOS NA EMERGÊNCIA:
${proceduresDone.length > 0 ? proceduresDone.join("; ") : "Nenhum procedimento invasivo imediato."}

# DIAGNÓSTICO / HIPÓTESES:
${diagnosis || "Politraumatismo a esclarecer"}

# CONDUTA TÉCNICA E PLANO:
${actions.map(a => `- ${a}`).join("\n")}
${planText ? `\nOBSERVAÇÕES DA CONDUTA:\n${planText}` : ""}
${planDetails.prescriptionText ? `\nPRESCRIÇÃO:\n${planDetails.prescriptionText}` : ""}

# DESTINO / ENCAMINHAMENTO:
${trauma.disposition || "Aguardando definição"}
`;
    }

    const fullText = `
${state.mode === 'trauma' ? "PROTOCOLO DE TRAUMA / SALA VERMELHA" : shiftTitle.toUpperCase()}
PACIENTE: ${patientName || "Não identificado"}, ${patientAge || "?"} anos.
ADMISSÃO: ${admissionType}
${textBody}
${signBlock}
`.trim();

    setOutputText(fullText);
  }, [state, glasgowScore]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 p-2">
      
      {/* LEFT COLUMN - EDITOR */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar">
        
        {/* HEADER & MODE SELECTION */}
        <div className="bg-medical-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 space-y-3">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-medical-700 dark:text-medical-300 transition-colors" title="Voltar">
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            <input
              type="text"
              value={state.shiftTitle}
              onChange={(e) => handleInputChange('shiftTitle', e.target.value)}
              className="w-full text-center font-black text-xl text-medical-800 dark:text-medical-300 bg-transparent border-none focus:ring-0 placeholder-gray-400 uppercase tracking-wide"
              placeholder="TÍTULO DO PLANTÃO"
            />
          </div>

          {/* MODE TOGGLE */}
          <div className="flex bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setState(prev => ({...prev, mode: 'standard'}))}
              className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                state.mode === 'standard' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Stethoscope className="h-4 w-4" /> Padrão / Ambulatorial
            </button>
            <button
              onClick={() => setState(prev => ({...prev, mode: 'trauma'}))}
              className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                state.mode === 'trauma' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Siren className="h-4 w-4" /> Trauma / Emergência
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">

          {/* COMMON: PATIENT DATA */}
          <section className="space-y-4">
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
                <option>Trazido por terceiros</option>
              </select>
            </div>
          </section>

          {/* ----------------- TRAUMA MODE LAYOUT ----------------- */}
          {state.mode === 'trauma' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              
              {/* A. HISTÓRICO PRÉ-HOSPITALAR */}
              <section className="border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 flex items-center gap-2 border-b border-red-100 dark:border-red-900/30">
                  <Activity className="h-5 w-5 text-red-600" />
                  <h3 className="font-bold text-red-800 dark:text-red-200">Histórico & Mecanismo</h3>
                </div>
                <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Mecanismo do Trauma (MIST)</label>
                    <textarea 
                      value={state.trauma.mechanism}
                      onChange={(e) => handleInputChange('trauma', {...state.trauma, mechanism: e.target.value})}
                      className="w-full p-2 mt-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-16 outline-none focus:border-red-500"
                      placeholder="Ex: Colisão frontal auto x auto, alta energia, paciente ejetado..."
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {['iotAtScene', 'cervicalCollar', 'backboard', 'ivAccess'].map((key) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(state.trauma.prehospital as any)[key]} 
                          onChange={(e) => handleTraumaChange('prehospital', key, e.target.checked)}
                          className="text-red-600 focus:ring-red-500 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {key === 'iotAtScene' ? "IOT na Cena" : 
                           key === 'cervicalCollar' ? "Colar Cervical" :
                           key === 'backboard' ? "Prancha Rígida" : "Acesso Venoso"}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Added Allergies and Meds for Trauma */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Alergias</label>
                        <textarea 
                           value={state.history.allergies}
                           onChange={(e) => handleNestedChange('history', 'allergies', e.target.value)}
                           className="w-full p-2 mt-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-16 resize-none outline-none focus:border-red-500"
                           placeholder="Nega"
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Medicamentos Contínuos</label>
                        <div className="mt-1">
                           <div className="flex gap-1 mb-2">
                              <input 
                                 value={newMedName}
                                 onChange={(e) => setNewMedName(e.target.value)}
                                 placeholder="Nome..."
                                 className="flex-1 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                 onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                              />
                              <input 
                                 value={newMedPos}
                                 onChange={(e) => setNewMedPos(e.target.value)}
                                 placeholder="Posologia (ex: 1-0-0)"
                                 className="w-24 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center"
                                 onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                              />
                              <button onClick={addMedication} className="bg-red-100 text-red-600 p-1.5 rounded hover:bg-red-200"><Plus size={16}/></button>
                           </div>
                           <div className="space-y-1">
                              {state.medications.map(m => (
                                 <div key={m.id} className="flex gap-1 items-center">
                                    <input 
                                       value={m.name} 
                                       onChange={(e) => updateMedication(m.id, 'name', e.target.value)}
                                       className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-200 p-1 rounded border-none focus:ring-1 focus:ring-red-500"
                                    />
                                    <input 
                                       value={m.posology} 
                                       onChange={(e) => updateMedication(m.id, 'posology', e.target.value)}
                                       className="w-20 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-200 p-1 rounded border-none focus:ring-1 focus:ring-red-500 text-center"
                                    />
                                    <button onClick={() => removeMedication(m.id)}><Trash2 size={12} className="text-red-500 hover:text-red-700"/></button>
                                 </div>
                              ))}
                              {state.medications.length === 0 && <span className="text-xs text-gray-400 italic">Nenhum</span>}
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </section>

              {/* B. PRIMARY SURVEY (XABCDE) */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xl font-black text-gray-800 dark:text-white">
                  <span className="bg-gray-800 text-white px-2 rounded">1º</span> 
                  AVALIAÇÃO PRIMÁRIA (XABCDE)
                </div>

                {/* X - Hemorragia */}
                <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-600 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-red-600">X</span>
                    <span className="font-bold text-red-800 dark:text-red-300 uppercase">Hemorragia Exsanguinante</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={state.trauma.primarySurvey.x.noExternalBleeding} onChange={(e) => handleTraumaChange('primarySurvey', 'noExternalBleeding', e.target.checked, 'x')} className="text-red-600 rounded" />
                      <span className="text-sm dark:text-gray-300 text-gray-900">Sem sangramento externo visível</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={state.trauma.primarySurvey.x.contained} onChange={(e) => handleTraumaChange('primarySurvey', 'contained', e.target.checked, 'x')} className="text-red-600 rounded" />
                      <span className="text-sm dark:text-gray-300 text-gray-900">Contida (Compressão)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={state.trauma.primarySurvey.x.tourniquet} onChange={(e) => handleTraumaChange('primarySurvey', 'tourniquet', e.target.checked, 'x')} className="text-red-600 rounded" />
                      <span className="text-sm font-bold dark:text-gray-300 text-gray-900">Torniquete Aplicado</span>
                    </label>
                  </div>
                </div>

                {/* A - Airway */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-4 rounded-r-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-black text-blue-600">A</span>
                      <span className="font-bold text-blue-800 dark:text-blue-300 uppercase">Vias Aéreas & Coluna</span>
                    </div>
                    <select 
                      value={state.trauma.primarySurvey.a.airway}
                      onChange={(e) => handleTraumaChange('primarySurvey', 'airway', e.target.value, 'a')}
                      className="w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white text-gray-900"
                    >
                      <option>Pérvia</option>
                      <option>Obstruída (Secreção/Sangue)</option>
                      <option>Tubo Orotraqueal (TOT)</option>
                      <option>Traqueostomia</option>
                      <option>Máscara Laríngea</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 p-2 rounded border border-blue-200 dark:border-blue-800 shadow-sm w-full">
                      <input type="checkbox" checked={state.trauma.primarySurvey.a.cervicalProtection} onChange={(e) => handleTraumaChange('primarySurvey', 'cervicalProtection', e.target.checked, 'a')} className="text-blue-600 rounded" />
                      <span className="text-sm font-bold dark:text-gray-300 text-gray-900">Proteção Cervical Mantida</span>
                    </label>
                  </div>
                </div>

                {/* B - Breathing */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-blue-500">B</span>
                    <span className="font-bold text-blue-800 dark:text-blue-300 uppercase">Respiração & Ventilação</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500">Murmúrio Vesicular</label>
                      <select 
                        value={state.trauma.primarySurvey.b.murmurs}
                        onChange={(e) => handleTraumaChange('primarySurvey', 'murmurs', e.target.value, 'b')}
                        className="w-full p-1.5 border rounded text-sm dark:bg-gray-800 dark:text-white text-gray-900"
                      >
                        <option>Simétrico</option>
                        <option>Diminuído à Direita</option>
                        <option>Diminuído à Esquerda</option>
                        <option>Ausente Bilateral</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Expansibilidade</label>
                      <select 
                        value={state.trauma.primarySurvey.b.expansion}
                        onChange={(e) => handleTraumaChange('primarySurvey', 'expansion', e.target.value, 'b')}
                        className="w-full p-1.5 border rounded text-sm dark:bg-gray-800 dark:text-white text-gray-900"
                      >
                        <option>Normal</option>
                        <option>Assimétrica</option>
                        <option>Paradoxal (Tórax Instável)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Sat O2 (%)</label>
                      <input 
                        value={state.vitals.sat}
                        onChange={(e) => handleNestedChange('vitals', 'sat', e.target.value)}
                        className="w-full p-1.5 border rounded text-sm dark:bg-gray-800 dark:text-white text-gray-900 text-center"
                        placeholder="%"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Freq. Resp</label>
                      <input 
                        value={state.vitals.fr}
                        onChange={(e) => handleNestedChange('vitals', 'fr', e.target.value)}
                        className="w-full p-1.5 border rounded text-sm dark:bg-gray-800 dark:text-white text-gray-900 text-center"
                        placeholder="irpm"
                      />
                    </div>
                  </div>
                </div>

                {/* C - Circulation */}
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-yellow-600">C</span>
                    <span className="font-bold text-yellow-800 dark:text-yellow-300 uppercase">Circulação</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500">Pulsos</label>
                      <select value={state.trauma.primarySurvey.c.pulses} onChange={(e) => handleTraumaChange('primarySurvey', 'pulses', e.target.value, 'c')} className="w-full p-1.5 border rounded text-sm dark:bg-gray-800 dark:text-white text-gray-900">
                        <option>Cheios/Simétricos</option>
                        <option>Filiformes</option>
                        <option>Ausentes</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Pele</label>
                      <select value={state.trauma.primarySurvey.c.skin} onChange={(e) => handleTraumaChange('primarySurvey', 'skin', e.target.value, 'c')} className="w-full p-1.5 border rounded text-sm dark:bg-gray-800 dark:text-white text-gray-900">
                        <option>Corada/Quente</option>
                        <option>Pálida/Fria</option>
                        <option>Cianótica</option>
                        <option>Marmorada</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">FAST (USG)</label>
                      <select value={state.trauma.primarySurvey.c.fast} onChange={(e) => handleTraumaChange('primarySurvey', 'fast', e.target.value, 'c')} className="w-full p-1.5 border rounded text-sm dark:bg-gray-800 dark:text-white text-gray-900">
                        <option>Não realizado</option>
                        <option>Negativo (Livre)</option>
                        <option>Positivo (Líquido livre)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">PA</label>
                      <input value={state.vitals.pa} onChange={(e) => handleNestedChange('vitals', 'pa', e.target.value)} className="w-full p-1.5 border rounded text-sm dark:bg-gray-800 dark:text-white text-gray-900 text-center" placeholder="mmHg" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">FC</label>
                      <input value={state.vitals.fc} onChange={(e) => handleNestedChange('vitals', 'fc', e.target.value)} className="w-full p-1.5 border rounded text-sm dark:bg-gray-800 dark:text-white text-gray-900 text-center" placeholder="bpm" />
                    </div>
                  </div>
                </div>

                {/* D - Disability (GLASGOW) */}
                <div className="bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-600 p-4 rounded-r-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-gray-700 dark:text-gray-300">D</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 uppercase">Neurológico (Glasgow: {glasgowScore})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500">Abertura Ocular</label>
                      <select value={state.trauma.primarySurvey.d.glasgowOcular} onChange={(e) => handleTraumaChange('primarySurvey', 'glasgowOcular', e.target.value, 'd')} className="w-full p-1.5 border rounded text-sm dark:bg-gray-900 dark:text-white text-gray-900">
                        <option value="4">4 - Espontânea</option>
                        <option value="3">3 - À voz</option>
                        <option value="2">2 - À dor</option>
                        <option value="1">1 - Ausente</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Resposta Verbal</label>
                      <select value={state.trauma.primarySurvey.d.glasgowVerbal} onChange={(e) => handleTraumaChange('primarySurvey', 'glasgowVerbal', e.target.value, 'd')} className="w-full p-1.5 border rounded text-sm dark:bg-gray-900 dark:text-white text-gray-900">
                        <option value="5">5 - Orientado</option>
                        <option value="4">4 - Confuso</option>
                        <option value="3">3 - Palavras inaprop.</option>
                        <option value="2">2 - Sons inintelig.</option>
                        <option value="1">1 - Ausente</option>
                        <option value="T">T - Tubo/Traqueo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Resposta Motora</label>
                      <select value={state.trauma.primarySurvey.d.glasgowMotor} onChange={(e) => handleTraumaChange('primarySurvey', 'glasgowMotor', e.target.value, 'd')} className="w-full p-1.5 border rounded text-sm dark:bg-gray-900 dark:text-white text-gray-900">
                        <option value="6">6 - Obedece comandos</option>
                        <option value="5">5 - Localiza dor</option>
                        <option value="4">4 - Mov. Retirada</option>
                        <option value="3">3 - Flexão Anormal (Decort)</option>
                        <option value="2">2 - Extensão Anormal (Descereb)</option>
                        <option value="1">1 - Ausente</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Pupilas</label>
                      <select value={state.trauma.primarySurvey.d.pupils} onChange={(e) => handleTraumaChange('primarySurvey', 'pupils', e.target.value, 'd')} className="w-full p-1.5 border rounded text-sm dark:bg-gray-900 dark:text-white text-gray-900">
                        <option>Isocóricas / Fotoreagentes</option>
                        <option>Anisocóricas (D&gt;E)</option>
                        <option>Anisocóricas (E&gt;D)</option>
                        <option>Midríase Bilateral</option>
                        <option>Miose Bilateral</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* E - Exposure */}
                <div className="bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-purple-600">E</span>
                    <span className="font-bold text-purple-800 dark:text-purple-300 uppercase">Exposição & Controle Térmico</span>
                  </div>
                  <input 
                    value={state.trauma.primarySurvey.e.injuries}
                    onChange={(e) => handleTraumaChange('primarySurvey', 'injuries', e.target.value, 'e')}
                    className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Descreva lesões encontradas, deformidades, escoriações..."
                  />
                </div>
              </section>

              {/* Diagnosis Input */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    <span className="font-bold text-gray-700 dark:text-gray-300">DIAGNÓSTICO / HIPÓTESES</span>
                </div>
                <input 
                    value={state.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-lg font-medium bg-yellow-50 dark:bg-yellow-900/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    placeholder="Ex: Politraumatismo, TCE Grave, Fratura de Fêmur..."
                />
              </section>

              {/* C. PROCEDIMENTOS REALIZADOS (NEW) */}
              <section className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 uppercase text-sm">
                  <Syringe className="h-5 w-5 text-blue-500" /> Procedimentos Realizados (Sala de Emergência)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {k: 'iot', l: 'IOT (Intubação)'}, {k: 'cvc', l: 'Acesso Central'},
                    {k: 'thoracentesis', l: 'Toracocentese'}, {k: 'thoracotomy', l: 'Drenagem Tórax'},
                    {k: 'cve', l: 'Cardioversão/Desfib'}, {k: 'fast', l: 'USG E-FAST'},
                    {k: 'immobilization', l: 'Imobilização'}
                  ].map(item => (
                    <label key={item.k} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={(state.trauma.procedures as any)[item.k]}
                        onChange={(e) => handleTraumaChange('procedures', item.k, e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.l}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* D. CONDUTA IMEDIATA & DESTINO (Updated) */}
              <section className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase text-sm">
                  <Siren className="h-5 w-5 text-red-500" /> Conduta Imediata & Encaminhamento
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {k: 'monitoring', l: 'Monitorização'}, {k: 'oxygen', l: 'O2 Suplementar'},
                    {k: 'tomography', l: 'TC (Politrauma)'}, {k: 'labTrauma', l: 'Lab. Rotina Trauma'},
                    {k: 'bloodBank', l: 'Reserva de Sangue'}, {k: 'consultGenSurg', l: 'Aval. Cirurgia Geral'},
                    {k: 'consultNeuro', l: 'Aval. Neurocirurgia'}, {k: 'consultOrtho', l: 'Aval. Ortopedia'}
                  ].map(item => (
                    <label key={item.k} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={(state.trauma.immediateActions as any)[item.k]}
                        onChange={(e) => handleTraumaChange('immediateActions', item.k, e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.l}</span>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                         <BedDouble className="inline h-3 w-3 mr-1"/> Destino / Encaminhamento
                      </label>
                      <select 
                         value={state.trauma.disposition}
                         onChange={(e) => setState(prev => ({
                            ...prev,
                            trauma: { ...prev.trauma, disposition: e.target.value }
                         }))}
                         className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                         <option>Observação Sala Vermelha</option>
                         <option>Observação Sala Amarela/Trauma</option>
                         <option>Encaminhamento UTI</option>
                         <option>Encaminhamento Centro Cirúrgico</option>
                         <option>Transferência Externa (Vaga Zero)</option>
                         <option>Alta / Liberado</option>
                         <option>Óbito</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                         Conduta Escrita (Texto Livre)
                      </label>
                      <textarea
                         value={state.planText}
                         onChange={(e) => handleInputChange('planText', e.target.value)}
                         className="w-full p-2 h-16 border rounded text-sm resize-none text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                         placeholder="Descreva detalhes da conduta..."
                      />
                   </div>
                </div>
              </section>

            </div>
          )}

          {/* ----------------- STANDARD MODE LAYOUT ----------------- */}
          {state.mode === 'standard' && (
            <>
              {/* Existing Sections for Standard Mode */}
              <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 animate-in slide-in-from-left-4 fade-in duration-300">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-left-4 fade-in duration-300">
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

            <section className="space-y-4 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30 animate-in slide-in-from-left-4 fade-in duration-300">
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

          <section className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
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

          <section className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
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

          <section className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
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

          <section className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
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
                      {PLAN_ACTION_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)}
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
            </>
          )}

          {/* 5. IDENTIFICAÇÃO DO PROFISSIONAL (Common to both modes) */}
          <section className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
             <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <UserCheck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase">Identificação do Profissional</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Nome do Profissional</label>
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