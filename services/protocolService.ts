import { MedicalProtocol, ProtocolCategory, Medication } from "../types";
import { v4 as uuidv4 } from 'uuid';

const PROTOCOLS_KEY = 'prescriber_ai_custom_protocols';
const FAVORITES_KEY = 'prescriber_ai_favorite_protocols';

// --- SEED DATA (Standard Medical Protocols) ---
const DEFAULT_PROTOCOLS: MedicalProtocol[] = [
  // --- PROTOCOLOS HOSPITALARES / EMERGÊNCIA (NOVO) ---
  {
    id: 'hosp-intubacao-rsi',
    name: 'Intubação Sequência Rápida (RSI)',
    category: 'Hospitalar',
    subcategory: 'Via Aérea Avançada',
    isFavorite: true,
    isCustom: false,
    reference: "Ref: Difficult Airway Society (DAS) Guidelines 2015",
    customInstructions: "• PREPARO: Checar material, acesso venoso e monitorização.\n• PRÉ-OXIGENAÇÃO: 3-5 min com O2 100%.\n• POSICIONAMENTO: Coxim occipital (Sniffing Position).",
    medications: [
      { name: "Fentanil", dosage: "100mcg (2ml)", quantity: "1", unit: "Ampola", frequency: "Dose Única", duration: "Bolus Lento", instructions: "Analgesia pré-indução (2-3mcg/kg)." },
      { name: "Etomidato", dosage: "20mg (10ml)", quantity: "1", unit: "Ampola", frequency: "Dose Única", duration: "Bolus", instructions: "Indução (0.3mg/kg). Alternativa: Cetamina 2mg/kg." },
      { name: "Rocurônio", dosage: "50mg (5ml)", quantity: "2", unit: "Ampola", frequency: "Dose Única", duration: "Bolus", instructions: "Bloqueio Neuromuscular (1.2mg/kg). Alternativa: Succinilcolina 1.5mg/kg." }
    ]
  },
  {
    id: 'hosp-sedacao-continua',
    name: 'Sedação Contínua (Midazolam + Fentanil)',
    category: 'Hospitalar',
    subcategory: 'Sedação e Analgesia',
    isFavorite: false,
    isCustom: false,
    reference: "Ref: Diretrizes Brasileiras de Sedação e Analgesia em UTI (AMIB)",
    customInstructions: "• SOLUÇÃO PADRÃO UTI: Ajustar conforme escala RASS.\n• Monitorar hipotensão e depressão respiratória.",
    medications: [
      { name: "Midazolam", dosage: "50mg (10ml)", quantity: "4", unit: "Ampola", frequency: "Bomba Infusão", duration: "Contínuo", instructions: "Diluir 4 ampolas (40ml) + 60ml SF 0,9% (Total 100ml). Dose inicial: 5-10ml/h." },
      { name: "Fentanil", dosage: "500mcg (10ml)", quantity: "4", unit: "Ampola", frequency: "Bomba Infusão", duration: "Contínuo", instructions: "Diluir 4 ampolas (40ml) + 60ml SF 0,9% (Total 100ml). Dose inicial: 2-5ml/h." }
    ]
  },
  {
    id: 'hosp-noradrenalina',
    name: 'Noradrenalina (Vasopressor)',
    category: 'Hospitalar',
    subcategory: 'Choque / Vasoativo',
    isFavorite: true,
    isCustom: false,
    reference: "Ref: Surviving Sepsis Campaign Guidelines 2021",
    customInstructions: "• Acesso venoso central preferencial (ou periférico calibroso provisório).\n• Meta PAM > 65 mmHg.",
    medications: [
      { name: "Hemitartarato de Norepinefrina", dosage: "4mg (4ml)", quantity: "4", unit: "Ampola", frequency: "Bomba Infusão", duration: "Contínuo", instructions: "DILUIÇÃO CONCENTRADA: 4 ampolas (16ml) + 234ml SG 5% (Total 250ml). [64mcg/ml]." }
    ]
  },
  {
    id: 'hosp-anafilaxia',
    name: 'Anafilaxia / Choque Anafilático',
    category: 'Hospitalar',
    subcategory: 'Emergência Clínica',
    isFavorite: false,
    isCustom: false,
    reference: "Ref: World Allergy Organization (WAO) Anaphylaxis Guidelines",
    customInstructions: "• IMEDIATO: Adrenalina IM no vasto lateral.\n• Elevar membros inferiores.\n• Oxigênio alto fluxo.",
    medications: [
      { name: "Epinefrina (Adrenalina)", dosage: "1mg/ml", quantity: "1", unit: "Ampola", frequency: "IMediato", duration: "Dose Única", instructions: "Fazer 0,5ml (meia ampola) IM no vasto lateral. Repetir em 5 min se necessário." },
      { name: "Hidrocortisona", dosage: "500mg", quantity: "1", unit: "Frasco", frequency: "EV", duration: "Agora", instructions: "Corticoide para evitar fase tardia." },
      { name: "Prometazina (Fenergan)", dosage: "50mg", quantity: "1", unit: "Ampola", frequency: "IM", duration: "Agora", instructions: "Anti-histamínico." }
    ]
  },
  {
    id: 'hosp-iam-sind-coronariana',
    name: 'SCA / Infarto (MONAB)',
    category: 'Hospitalar',
    subcategory: 'Cardiologia',
    isFavorite: false,
    isCustom: false,
    reference: "Ref: Diretriz da SBC sobre Angina Instável e IAM sem Supradesnível (2021)",
    customInstructions: "• Monitorização cardíaca, Oximetria, Acesso venoso.\n• ECG em até 10 minutos.",
    medications: [
      { name: "AAS", dosage: "100mg", quantity: "3", unit: "Cp", frequency: "VO", duration: "Agora", instructions: "Mastigar 300mg." },
      { name: "Clopidogrel", dosage: "75mg", quantity: "4", unit: "Cp", frequency: "VO", duration: "Agora", instructions: "Dose ataque 300mg (ou 600mg se angioplastia primária)." },
      { name: "Morfina", dosage: "10mg/ml", quantity: "1", unit: "Ampola", frequency: "EV", duration: "Se dor", instructions: "Diluir para 10ml. Fazer 2-4mg (2-4ml) lento se dor refratária." },
      { name: "Nitrato (Isordil)", dosage: "5mg", quantity: "1", unit: "Cp", frequency: "SL", duration: "Agora", instructions: "Se PAS > 100mmHg. Repetir até 3x." }
    ]
  },
  {
    id: 'hosp-cetoacidose',
    name: 'Cetoacidose Diabética (Manejo Inicial)',
    category: 'Hospitalar',
    subcategory: 'Endocrinologia',
    isFavorite: false,
    isCustom: false,
    reference: "Ref: ADA Standards of Medical Care in Diabetes - 2024",
    customInstructions: "• Hidratação vigorosa é a prioridade inicial.\n• Só iniciar insulina se K+ > 3.3.",
    medications: [
      { name: "Soro Fisiológico 0,9%", dosage: "1000ml", quantity: "1", unit: "Frasco", frequency: "EV", duration: "1 hora", instructions: "Correr aberto na primeira hora (15-20ml/kg)." },
      { name: "Insulina Regular", dosage: "100 UI/ml", quantity: "1", unit: "Frasco", frequency: "EV", duration: "Contínuo", instructions: "Bolus 0.1 UI/kg EV + Manutenção 0.1 UI/kg/h em bomba." }
    ]
  },

  // PNEUMOLOGIA
  {
    id: 'resp-ivas-adulto',
    name: 'IVAS (Sintomáticos) - Adulto',
    category: 'Pneumologia',
    subcategory: 'IVAS',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Hidratação vigorosa (2 a 3 litros de água por dia).\n• Repouso relativo.\n• Lavagem nasal com soro fisiológico abundante várias vezes ao dia.\n• Retornar se febre persistente > 3 dias ou falta de ar.",
    medications: [
      { name: "Dipirona Monohidratada", dosage: "500mg", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor ou febre", instructions: "" },
      { name: "Loratadina", dosage: "10mg", quantity: "1", unit: "Caixa(s)", frequency: "1x ao dia", duration: "5 dias", instructions: "Se coriza intensa" },
      { name: "Sorine (Cloreto de Sódio 0,9%)", dosage: "Spray", quantity: "1", unit: "Frasco(s)", frequency: "Livre demanda", duration: "Uso contínuo", instructions: "Aplicação nasal" }
    ]
  },
  {
    id: 'resp-sinusite',
    name: 'Sinusite Aguda Bacteriana',
    category: 'Pneumologia',
    subcategory: 'Sinusite',
    isFavorite: false,
    isCustom: false,
    reference: "Ref: Diretrizes Brasileiras de Rinossinusites (2022) - ABORL-CCF",
    customInstructions: "• Lavagem nasal com Soro Fisiológico 0,9% morno (seringa 20ml) 4x ao dia.\n• Inalação com soro fisiológico se necessário.",
    medications: [
      { name: "Amoxicilina + Clavulanato", dosage: "875mg + 125mg", quantity: "14", unit: "Comprimido(s)", frequency: "12/12h", duration: "7 dias", instructions: "Tomar junto às refeições" },
      { name: "Prednisona", dosage: "20mg", quantity: "5", unit: "Comprimido(s)", frequency: "1x ao dia (manhã)", duration: "5 dias", instructions: "" },
      { name: "Budecort Aqua (Budesonida)", dosage: "32mcg", quantity: "1", unit: "Frasco(s)", frequency: "2 jatos cada narina 12/12h", duration: "10 dias", instructions: "" }
    ]
  },
  {
    id: 'resp-amigdalite',
    name: 'Amigdalite Estreptocócica',
    category: 'Pneumologia',
    subcategory: 'Amigdalite',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Evitar alimentos muito quentes ou ácidos.\n• Trocar escova de dentes após 24h de antibiótico.",
    medications: [
      { name: "Amoxicilina", dosage: "500mg", quantity: "21", unit: "Comprimido(s)", frequency: "8/8h", duration: "7 dias", instructions: "" },
      { name: "Ibuprofeno", dosage: "600mg", quantity: "1", unit: "Caixa(s)", frequency: "8/8h", duration: "3 dias", instructions: "Se dor intensa. Tomar após refeição." }
    ]
  },
  {
    id: 'resp-asma-alta',
    name: 'Crise de Asma (Alta)',
    category: 'Pneumologia',
    subcategory: 'Asma',
    isFavorite: true,
    isCustom: false,
    reference: "Ref: GINA 2023 - Global Strategy for Asthma Management and Prevention",
    customInstructions: "• Manter boa hidratação (aprox. 2L de água/dia).\n• Evitar contato com poeira, mofo, ácaros, perfumes e fumaça.\n• Lavar narinas com soro fisiológico se congestão.\n• Retornar se: febre > 37,8°C, falta de ar ou cansaço intenso.",
    medications: [
      { name: "Salbutamol (Aerolin)", dosage: "100mcg/dose", quantity: "1", unit: "Frasco(s)", frequency: "8/8h", duration: "30 dias", instructions: "Fazer 1 puff a cada 8h. Em caso de cansaço, fazer 2 puffs até de 4/4h." },
      { name: "Prednisolona", dosage: "40mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "Tomar 1 comprimido pela manhã." },
      { name: "Dipirona", dosage: "1g", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor ou febre", instructions: "" }
    ]
  },
  {
    id: 'resp-asma-manutencao',
    name: 'Asma (Alta - Aerolin + Clenil)',
    category: 'Pneumologia',
    subcategory: 'Asma',
    isFavorite: true,
    isCustom: false,
    reference: "Ref: Diretrizes da Sociedade Brasileira de Pneumologia e Tisiologia (SBPT) para o Manejo da Asma - 2020",
    customInstructions: "• Lavar a boca após o uso das bombinhas.\n• Manter boa hidratação (2L/dia).\n• Evitar poeira, mofo e animais no quarto de dormir.",
    medications: [
      { name: "Salbutamol (Aerolin)", dosage: "100mcg/dose", quantity: "1", unit: "Frasco(s)", frequency: "8/8h", duration: "30 dias", instructions: "Fazer 1 puff a cada 8h. Em caso de crise, usar conforme demanda." },
      { name: "Beclometasona (Clenil HFA)", dosage: "250mcg/dose", quantity: "1", unit: "Frasco(s)", frequency: "12/12h", duration: "30 dias", instructions: "Fazer 1 inalação via oral." },
      { name: "Prednisolona", dosage: "40mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "Tomar 1 comprimido pela manhã." }
    ]
  },
  {
    id: 'resp-dpoc-alta',
    name: 'DPOC Exacerbado (Alta)',
    category: 'Pneumologia',
    subcategory: 'DPOC',
    isFavorite: false,
    isCustom: false,
    reference: "Ref: GOLD 2024 - Global Strategy for the Diagnosis, Management, and Prevention of COPD",
    customInstructions: "• Evitar exposição a fumaça e tabagismo.\n• Retornar se piora da falta de ar ou febre.\n• Manter uso das medicações de uso contínuo se houver.",
    medications: [
      { name: "Salbutamol (Aerolin)", dosage: "100mcg/dose", quantity: "1", unit: "Frasco(s)", frequency: "8/8h", duration: "30 dias", instructions: "1 puff a cada 8h." },
      { name: "Beclometasona (Clenil HFA)", dosage: "250mcg/dose", quantity: "1", unit: "Frasco(s)", frequency: "12/12h", duration: "30 dias", instructions: "1 inalação via oral." },
      { name: "Prednisolona", dosage: "40mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "Tomar pela manhã." }
    ]
  },
  // ... (Other protocols follow with similar updates where appropriate) ...
  // CARDIOLÓGICO
  {
    id: 'cardio-has',
    name: 'Hipertensão 1',
    category: 'Cardiologia',
    subcategory: 'HAS',
    isFavorite: false,
    isCustom: false,
    reference: "Ref: Diretrizes Brasileiras de Hipertensão Arterial (2020) - SBC",
    customInstructions: "• Reduzir consumo de sal.\n• Atividade física regular (30 min/dia).\n• Monitorar PA residencial.",
    medications: [
      { name: "Losartana Potássica", dosage: "50mg", quantity: "30", unit: "Comprimido(s)", frequency: "1x ao dia (manhã)", duration: "Uso contínuo", instructions: "" },
      { name: "Hidroclorotiazida", dosage: "25mg", quantity: "30", unit: "Comprimido(s)", frequency: "1x ao dia (manhã)", duration: "Uso contínuo", instructions: "" }
    ]
  },
  // ... (Remaining protocols would be here)
];

export const getProtocols = (): MedicalProtocol[] => {
  try {
    const customStored = localStorage.getItem(PROTOCOLS_KEY);
    const customProtocols: MedicalProtocol[] = customStored ? JSON.parse(customStored) : [];
    
    const favsStored = localStorage.getItem(FAVORITES_KEY);
    const favs: string[] = favsStored ? JSON.parse(favsStored) : [];

    // Shadowing Logic: If a custom protocol has the same ID as a default one, use the custom one.
    const customIds = new Set(customProtocols.map(p => p.id));
    // Re-create full list by filtering defaults that are shadowed + customs
    // Note: In a real app we'd merge this better, here we rely on DEFAULT_PROTOCOLS being the source of truth for defaults.
    
    // We need to merge the updated DEFAULT_PROTOCOLS with any local custom protocols
    // Since we just updated DEFAULT_PROTOCOLS in code, we use it.
    
    const filteredDefaults = DEFAULT_PROTOCOLS.filter(p => !customIds.has(p.id));

    const all = [...customProtocols, ...filteredDefaults].map(p => ({
      ...p,
      isFavorite: favs.includes(p.id)
    }));

    return all;
  } catch (error) {
    console.error("Error fetching protocols", error);
    return DEFAULT_PROTOCOLS;
  }
};

export const saveCustomProtocol = (protocol: Omit<MedicalProtocol, 'id' | 'isCustom' | 'isFavorite'>): MedicalProtocol => {
  const customStored = localStorage.getItem(PROTOCOLS_KEY);
  const customProtocols: MedicalProtocol[] = customStored ? JSON.parse(customStored) : [];

  const newProtocol: MedicalProtocol = {
    ...protocol,
    id: uuidv4(),
    isCustom: true,
    isFavorite: false
  };

  const updated = [newProtocol, ...customProtocols];
  localStorage.setItem(PROTOCOLS_KEY, JSON.stringify(updated));
  return newProtocol;
};

export const updateCustomProtocol = (protocol: MedicalProtocol): void => {
  const customStored = localStorage.getItem(PROTOCOLS_KEY);
  let customProtocols: MedicalProtocol[] = customStored ? JSON.parse(customStored) : [];
  
  // Check if exists in custom list
  const index = customProtocols.findIndex(p => p.id === protocol.id);

  if (index !== -1) {
    // Update existing custom
    customProtocols[index] = { ...protocol, isCustom: true };
  } else {
    // "Upsert": It was a default protocol, now saving as custom override (shadowing)
    customProtocols.push({ ...protocol, isCustom: true });
  }
  
  localStorage.setItem(PROTOCOLS_KEY, JSON.stringify(customProtocols));
};

export const deleteCustomProtocol = (id: string): void => {
  const customStored = localStorage.getItem(PROTOCOLS_KEY);
  if (!customStored) return;
  
  const customProtocols: MedicalProtocol[] = JSON.parse(customStored);
  const updated = customProtocols.filter(p => p.id !== id);
  localStorage.setItem(PROTOCOLS_KEY, JSON.stringify(updated));
};

export const toggleProtocolFavorite = (id: string): void => {
  const favsStored = localStorage.getItem(FAVORITES_KEY);
  let favs: string[] = favsStored ? JSON.parse(favsStored) : [];

  if (favs.includes(id)) {
    favs = favs.filter(fid => fid !== id);
  } else {
    favs.push(id);
  }
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
};