
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
  // ... (Other existing protocols kept as is, but for brevity I am not re-pasting the ENTIRE 800 lines, I will just show the new additions at the end. In a real patch I would include everything or append).
  // Note: For XML output in this context, I must provide the FULL content of the file to ensure no data loss. I will do that below.
  
  {
    id: 'resp-sinusite',
    name: 'Sinusite Aguda Bacteriana',
    category: 'Pneumologia',
    subcategory: 'Sinusite',
    isFavorite: false,
    isCustom: false,
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
    customInstructions: "• Evitar exposição a fumaça e tabagismo.\n• Retornar se piora da falta de ar ou febre.\n• Manter uso das medicações de uso contínuo se houver.",
    medications: [
      { name: "Salbutamol (Aerolin)", dosage: "100mcg/dose", quantity: "1", unit: "Frasco(s)", frequency: "8/8h", duration: "30 dias", instructions: "1 puff a cada 8h." },
      { name: "Beclometasona (Clenil HFA)", dosage: "250mcg/dose", quantity: "1", unit: "Frasco(s)", frequency: "12/12h", duration: "30 dias", instructions: "1 inalação via oral." },
      { name: "Prednisolona", dosage: "40mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "Tomar pela manhã." }
    ]
  },
  {
    id: 'resp-faringo-viral',
    name: 'Faringoamigdalite Viral',
    category: 'Pneumologia',
    subcategory: 'Infecção de Vias Aéreas Superiores',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Dieta leve e fria/gelada ajuda na dor.\n• Repouso relativo.\n• Hidratação rigorosa.",
    medications: [
      { name: "Prednisolona", dosage: "40mg", quantity: "4", unit: "Comprimido(s)", frequency: "24/24h", duration: "4 dias", instructions: "Tomar 1 comprimido pela manhã." },
      { name: "Dipirona", dosage: "1g", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor ou febre", instructions: "" },
      { name: "Pastilhas (Strepsils)", dosage: "8,75mg", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor", instructions: "Dissolver lentamente na boca." }
    ]
  },
  {
    id: 'resp-faringo-bact-benzetacil',
    name: 'Faringoamigdalite Bact. (Benzetacil)',
    category: 'Pneumologia',
    subcategory: 'Infecção de Vias Aéreas Superiores',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Trocar escova de dentes após 24h do antibiótico.\n• Compressa morna no local da injeção se dor.",
    medications: [
      { name: "Penicilina Benzatina (Benzetacil)", dosage: "1.200.000 UI", quantity: "1", unit: "Ampola(s)", frequency: "Dose Única", duration: "", instructions: "Aplicação Intramuscular Profunda." },
      { name: "Prednisolona", dosage: "40mg", quantity: "4", unit: "Comprimido(s)", frequency: "24/24h", duration: "4 dias", instructions: "Tomar pela manhã." },
      { name: "Dipirona", dosage: "1g", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor ou febre", instructions: "" }
    ]
  },
  {
    id: 'resp-faringo-bact-clavulin',
    name: 'Faringoamigdalite Bact. (Clavulin)',
    category: 'Pneumologia',
    subcategory: 'Infecção de Vias Aéreas Superiores',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Completar os 10 dias mesmo se houver melhora antes.\n• Trocar escova de dentes após 24h do antibiótico.",
    medications: [
      { name: "Amoxicilina + Clavulanato", dosage: "875mg + 125mg", quantity: "20", unit: "Comprimido(s)", frequency: "12/12h", duration: "10 dias", instructions: "Tomar junto com as refeições." },
      { name: "Prednisolona", dosage: "40mg", quantity: "4", unit: "Comprimido(s)", frequency: "24/24h", duration: "4 dias", instructions: "Tomar pela manhã." }
    ]
  },
  {
    id: 'resp-influenza-tamiflu',
    name: 'Influenza / Gripe (Tamiflu)',
    category: 'Pneumologia',
    subcategory: 'Infecção Viral',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Isolamento domiciliar enquanto houver sintomas.\n• Hidratação vigorosa para fluidificar secreções.",
    medications: [
      { name: "Fosfato de Oseltamivir (Tamiflu)", dosage: "75mg", quantity: "10", unit: "Cápsula(s)", frequency: "12/12h", duration: "5 dias", instructions: "" },
      { name: "Acetilcisteína", dosage: "600mg", quantity: "5", unit: "Envelope(s)", frequency: "24/24h", duration: "5 dias", instructions: "Dissolver em meio copo d'água." },
      { name: "Loratadina", dosage: "10mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "" }
    ]
  },
  {
    id: 'resp-pac-clavulin',
    name: 'Pneumonia (PAC) - Clavulin',
    category: 'Pneumologia',
    subcategory: 'Pneumonia',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Retornar imediatamente se falta de ar intensa, confusão mental ou pressão baixa.\n• Repouso absoluto.",
    medications: [
      { name: "Amoxicilina + Clavulanato", dosage: "875mg + 125mg", quantity: "20", unit: "Comprimido(s)", frequency: "12/12h", duration: "10 dias", instructions: "" },
      { name: "Acetilcisteína", dosage: "600mg", quantity: "5", unit: "Envelope(s)", frequency: "24/24h", duration: "5 dias", instructions: "Dissolver em água." },
      { name: "Dipirona", dosage: "1g", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se febre", instructions: "" }
    ]
  },
  {
    id: 'resp-pac-levo',
    name: 'Pneumonia (PAC) - Levofloxacino',
    category: 'Pneumologia',
    subcategory: 'Pneumonia',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Opção para alérgicos a penicilina.\n• Evitar exposição excessiva ao sol durante o tratamento.",
    medications: [
      { name: "Levofloxacino", dosage: "750mg", quantity: "7", unit: "Comprimido(s)", frequency: "24/24h", duration: "7 dias", instructions: "Tomar preferencialmente pela manhã." },
      { name: "Acetilcisteína", dosage: "600mg", quantity: "5", unit: "Envelope(s)", frequency: "24/24h", duration: "5 dias", instructions: "" }
    ]
  },
  {
    id: 'resp-sinusite-bact',
    name: 'Sinusite Bacteriana (Amoxicilina)',
    category: 'Pneumologia',
    subcategory: 'Infecção de Vias Aéreas Superiores',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Lavagem nasal com Soro Fisiológico é fundamental (4x ao dia).\n• Inalar vapor de água quente pode ajudar a descongestionar.",
    medications: [
      { name: "Amoxicilina", dosage: "875mg", quantity: "20", unit: "Comprimido(s)", frequency: "12/12h", duration: "10 dias", instructions: "" },
      { name: "Budesonida Spray Nasal", dosage: "50mcg", quantity: "1", unit: "Frasco(s)", frequency: "12/12h", duration: "10 dias", instructions: "Aplicar 1 a 2 jatos em cada narina." },
      { name: "Loratadina", dosage: "10mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "" }
    ]
  },
  {
    id: 'resp-tosse-sintomatica',
    name: 'Tosse Seca / Irritativa',
    category: 'Pneumologia',
    subcategory: 'Sintomático',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Manter garganta hidratada.\n• Evitar ar condicionado muito frio ou seco.",
    medications: [
      { name: "Cloperastina (Seki)", dosage: "3,54mg/mL", quantity: "1", unit: "Frasco(s)", frequency: "8/8h", duration: "5 dias", instructions: "Tomar 10mL." },
      { name: "Acetilcisteína", dosage: "600mg", quantity: "5", unit: "Envelope(s)", frequency: "24/24h", duration: "5 dias", instructions: "" },
      { name: "Pastilhas (Benalet/Endcoff)", dosage: "Várias", quantity: "1", unit: "Caixa(s)", frequency: "Livre", duration: "se tosse", instructions: "Dissolver lentamente na boca (Máx 8/dia)." }
    ]
  },

// GASTROINTESTINAL
  {
    id: 'gastro-geca',
    name: 'Gastroenterite (GECA) - Adulto',
    category: 'Gastroenterologia',
    subcategory: 'Diarreia/Vômitos',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Dieta leve, obstipante (arroz, batata, frango grelhado, bolacha água e sal).\n• Soro de reidratação oral: beber 1 copo após cada episódio de diarreia.",
    medications: [
      { name: "Sais para Reidratação Oral", dosage: "Pó", quantity: "4", unit: "Envelope(s)", frequency: "Livre demanda", duration: "3 dias", instructions: "Diluir em 1L de água filtrada" },
      { name: "Ondansetrona", dosage: "8mg", quantity: "1", unit: "Caixa(s)", frequency: "8/8h", duration: "se náuseas", instructions: "Sublingual" },
      { name: "Floratil (Saccharomyces boulardii)", dosage: "200mg", quantity: "1", unit: "Caixa(s)", frequency: "12/12h", duration: "5 dias", instructions: "" },
      { name: "Buscopan Composto", dosage: "Drágeas", quantity: "1", unit: "Caixa(s)", frequency: "8/8h", duration: "se cólica", instructions: "" }
    ]
  },
 
 {
    id: 'gastro-drge32',
    name: 'DRGE - Gastrite',
    category: 'Gastroenterologia',
    subcategory: 'DRGE',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Evitar café, álcool, chocolate, menta e alimentos gordurosos.\n• Não deitar logo após comer (aguardar 2h).\n• Elevar a cabeceira da cama.",
    medications: [
      { name: "Omeprazol", dosage: "20mg", quantity: "30", unit: "Comprimido(s)", frequency: "1x ao dia", duration: "30 dias", instructions: "Em jejum, 30 min antes do café" },
      { name: "Domperidona", dosage: "10mg", quantity: "30", unit: "Comprimido(s)", frequency: "15 min antes almoço e jantar", duration: "15 dias", instructions: "Se empachamento" }
    ]
  },
  {
    id: 'gastro-geca-sintomatica',
    name: 'Gastroenterite / Diarreia (Sintomáticos)',
    category: 'Gastroenterologia',
    subcategory: 'Infecção Intestinal',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Hidratação vigorosa: Soro de reidratação após cada episódio.\n• Dieta leve e obstipante.\n• Suspender cafeína e leite.",
    medications: [
      { name: "Racecadotrila (Tiorfan)", dosage: "100mg", quantity: "12", unit: "Cápsula(s)", frequency: "8/8h", duration: "5 dias", instructions: "Antidiarreico seguro." },
      { name: "Floratil (Saccharomyces)", dosage: "200mg", quantity: "6", unit: "Cápsula(s)", frequency: "12/12h", duration: "3 dias", instructions: "Probiótico." },
      { name: "Ondansetrona", dosage: "8mg", quantity: "10", unit: "Comprimido(s)", frequency: "8/8h", duration: "se náusea", instructions: "Sublingual." },
      { name: "Buscopan Composto", dosage: "Drágeas", quantity: "1", unit: "Caixa(s)", frequency: "8/8h", duration: "se cólica", instructions: "" },
      { name: "Sais para Reidratação Oral", dosage: "Envelope", quantity: "4", unit: "Envelope(s)", frequency: "Livre", duration: "3 dias", instructions: "Diluir em 1L de água e beber ao longo do dia." }
    ]
  },
  {
    id: 'gastro-geca-infecciosa',
    name: 'Diarreia Infecciosa (Cipro + Metro)',
    category: 'Gastroenterologia',
    subcategory: 'Infecção Intestinal',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Indicado se: febre alta, sangue/muco nas fezes.\n• PROIBIDO álcool (reação com Metronidazol).",
    medications: [
      { name: "Ciprofloxacino", dosage: "500mg", quantity: "10", unit: "Comprimido(s)", frequency: "12/12h", duration: "5 dias", instructions: "" },
      { name: "Metronidazol", dosage: "400mg", quantity: "21", unit: "Comprimido(s)", frequency: "8/8h", duration: "7 dias", instructions: "" }
    ]
  },

  {
    id: 'gastro-drge2',
    name: 'Refluxo / Gastrite (Omeprazol)',
    category: 'Gastroenterologia',
    subcategory: 'Estômago',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Tomar em jejum.\n• Elevar a cabeceira da cama.\n• Evitar café, chocolate e menta.",
    medications: [
      { name: "Omeprazol", dosage: "20mg", quantity: "30", unit: "Comprimido(s)", frequency: "24/24h", duration: "30 dias", instructions: "Pela manhã, em jejum." },
      { name: "Domperidona", dosage: "10mg", quantity: "30", unit: "Comprimido(s)", frequency: "8/8h", duration: "10 dias", instructions: "Se empachamento." }
    ]
  },
  {
    id: 'gastro-constipacao',
    name: 'Constipação (Lactulose)',
    category: 'Gastroenterologia',
    subcategory: 'Intestino',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Beber 3L de água/dia.\n• Aumentar ingestão de fibras.",
    medications: [
      { name: "Lactulose", dosage: "667mg/mL", quantity: "1", unit: "Frasco(s)", frequency: "24/24h", duration: "Uso contínuo", instructions: "15 a 40ml/dia. Ajustar conforme necessidade." },
      { name: "Plantago Ovata", dosage: "Envelope", quantity: "1", unit: "Caixa(s)", frequency: "24/24h", duration: "Uso contínuo", instructions: "Diluir em água abundante." }
    ]
  },
  {
    id: 'gastro-hemorroida',
    name: 'Hemorróidas (Crise)',
    category: 'Gastroenterologia',
    subcategory: 'Proctologia',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Banho de assento morno.\n• Evitar papel higiênico.",
    medications: [
      { name: "Proctyl (Pomada)", dosage: "Bisnaga", quantity: "1", unit: "Bisnaga(s)", frequency: "3x/dia", duration: "7 dias", instructions: "Aplicar na região anal." },
      { name: "Naproxeno", dosage: "500mg", quantity: "10", unit: "Comprimido(s)", frequency: "12/12h", duration: "5 dias", instructions: "Anti-inflamatório." }
    ]
  },
  {
    id: 'gastro-fissura-anal',
    name: 'Fissura Anal (Diltiazem)',
    category: 'Gastroenterologia',
    subcategory: 'Proctologia',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Banho de assento com água morna 3x ao dia.",
    medications: [
      { name: "Diltiazem Gel 2%", dosage: "Bisnaga", quantity: "1", unit: "Bisnaga(s)", frequency: "12/12h", duration: "30 dias", instructions: "Aplicar na borda anal (manipulado)." },
      { name: "Metamucil", dosage: "Envelope", quantity: "1", unit: "Caixa(s)", frequency: "24/24h", duration: "Uso contínuo", instructions: "Para amolecer fezes." }
    ]
  },
  {
    id: 'gastro-encefalopatia',
    name: 'Encefalopatia Hepática',
    category: 'Gastroenterologia',
    subcategory: 'Fígado',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Ajustar Lactulose para 2-3 evacuações pastosas/dia.",
    medications: [
      { name: "Lactulose", dosage: "667mg/mL", quantity: "2", unit: "Frasco(s)", frequency: "12/12h", duration: "Uso contínuo", instructions: "20-40ml." },
      { name: "Metronidazol", dosage: "400mg", quantity: "42", unit: "Comprimido(s)", frequency: "8/8h", duration: "14 dias", instructions: "" }
    ]
  },

  // CARDIOLÓGICO
  {
    id: 'cardio-has',
    name: 'Hipertensão 1',
    category: 'Cardiologia',
    subcategory: 'HAS',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Reduzir consumo de sal.\n• Atividade física regular (30 min/dia).\n• Monitorar PA residencial.",
    medications: [
      { name: "Losartana Potássica", dosage: "50mg", quantity: "30", unit: "Comprimido(s)", frequency: "1x ao dia (manhã)", duration: "Uso contínuo", instructions: "" },
      { name: "Hidroclorotiazida", dosage: "25mg", quantity: "30", unit: "Comprimido(s)", frequency: "1x ao dia (manhã)", duration: "Uso contínuo", instructions: "" }
    ]
  },

  {
    id: 'cardio-sca',
    name: 'Pós-IAM / Angina (Kit SCA)',
    category: 'Cardiologia',
    subcategory: 'Coronária',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Uso contínuo obrigatório.",
    medications: [
      { name: "AAS", dosage: "100mg", quantity: "30", unit: "Comprimido(s)", frequency: "24/24h", duration: "Uso contínuo", instructions: "Após almoço." },
      { name: "Clopidogrel", dosage: "75mg", quantity: "30", unit: "Comprimido(s)", frequency: "24/24h", duration: "Uso contínuo", instructions: "" },
      { name: "Atorvastatina", dosage: "40mg", quantity: "30", unit: "Comprimido(s)", frequency: "24/24h", duration: "Uso contínuo", instructions: "À noite." },
      { name: "Isordil", dosage: "5mg", quantity: "1", unit: "Caixa(s)", frequency: "Livre", duration: "se dor no peito", instructions: "Sublingual." }
    ]
  },
  {
    id: 'cardio-arritmia',
    name: 'Arritmia (Metoprolol)',
    category: 'Cardiologia',
    subcategory: 'Arritmia',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Controle de frequência.",
    medications: [
      { name: "Succinato de Metoprolol", dosage: "50mg", quantity: "30", unit: "Comprimido(s)", frequency: "24/24h", duration: "Uso contínuo", instructions: "" }
    ]
  },
  {
    id: 'cardio-anticoagulacao',
    name: 'Anticoagulação (Rivaroxabana)',
    category: 'Cardiologia',
    subcategory: 'Trombose',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Fase 1 (21 dias): 15mg 12/12h.\n• Fase 2: 20mg 1x ao dia.",
    medications: [
      { name: "Rivaroxabana", dosage: "15mg", quantity: "42", unit: "Comprimido(s)", frequency: "12/12h", duration: "21 dias", instructions: "Fase inicial." },
      { name: "Rivaroxabana", dosage: "20mg", quantity: "30", unit: "Comprimido(s)", frequency: "24/24h", duration: "Uso contínuo", instructions: "Fase manutenção (jantar)." }
    ]
  },

  // ORTOPÉDICO
  {
    id: 'orto-lombalgia',
    name: 'Lombalgia Aguda Mecânica',
    category: 'Ortopedia e Reumatologia',
    subcategory: 'Lombalgia',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Evitar carregar peso.\n• Compressas mornas no local por 20 min, 3x ao dia.\n• Melhora postural.",
    medications: [
      { name: "Toragesic (Cetrolaco de Trometamol)", dosage: "10mg", quantity: "10", unit: "Comprimido(s)", frequency: "8/8h", duration: "3 dias", instructions: "Sublingual. Máximo 5 dias." },
      { name: "Ciclobenzaprina", dosage: "5mg", quantity: "10", unit: "Comprimido(s)", frequency: "1x a noite", duration: "5 dias", instructions: "Pode causar sonolência" },
      { name: "Dipirona Monohidratada", dosage: "1g", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor", instructions: "" }
    ]
  },
  {
    id: 'orto-entorse',
    name: 'Entorse de Tornozelo',
    category: 'Ortopedia e Reumatologia',
    subcategory: 'Entorse',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Repouso, Gelo (20 min 3x/dia), Compressão e Elevação (Protocolo RICE).\n• Uso de órtese/imobilizador se indicado.",
    medications: [
      { name: "Nimesulida", dosage: "100mg", quantity: "10", unit: "Comprimido(s)", frequency: "12/12h", duration: "5 dias", instructions: "Após refeições" },
      { name: "Paracetamol", dosage: "750mg", quantity: "1", unit: "Caixa(s)", frequency: "8/8h", duration: "se dor", instructions: "" }
    ]
  },

  {
    id: 'ortop-lombalgia',
    name: 'Dor Lombar (Naproxeno)',
    category: 'Ortopedia e Reumatologia',
    subcategory: 'Dor',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Calor local.",
    medications: [
      { name: "Naproxeno", dosage: "500mg", quantity: "10", unit: "Comprimido(s)", frequency: "12/12h", duration: "5 dias", instructions: "Após refeições." },
      { name: "Ciclobenzaprina", dosage: "10mg", quantity: "5", unit: "Comprimido(s)", frequency: "Noite", duration: "5 dias", instructions: "Relaxante muscular." }
    ]
  },
  {
    id: 'ortop-torcicolo',
    name: 'Torcicolo (Torsilax)',
    category: 'Ortopedia e Reumatologia',
    subcategory: 'Dor',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Causa sonolência.",
    medications: [
      { name: "Torsilax", dosage: "Comprimido", quantity: "15", unit: "Comprimido(s)", frequency: "12/12h", duration: "5 dias", instructions: "8/8h se dor forte." }
    ]
  },
  {
    id: 'ortop-gota',
    name: 'Crise de Gota',
    category: 'Ortopedia e Reumatologia',
    subcategory: 'Dor',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Evitar carne vermelha e álcool.",
    medications: [
      { name: "Colchicina", dosage: "0,5mg", quantity: "20", unit: "Comprimido(s)", frequency: "Específico", duration: "Crise", instructions: "2 comp agora + 1 comp em 1h. Depois 12/12h." },
      { name: "Naproxeno", dosage: "500mg", quantity: "10", unit: "Comprimido(s)", frequency: "12/12h", duration: "5 dias", instructions: "" }
    ]
  },

  // NEUROLÓGICO
  {
    id: 'neuro-cefaleia',
    name: 'Cefaleia Tensional',
    category: 'Neurologia',
    subcategory: 'Cefaleia',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Evitar jejum prolongado.\n• Higiene do sono.\n• Redução de estresse.",
    medications: [
      { name: "Dipirona Monohidratada", dosage: "1g", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor", instructions: "" },
      { name: "Cefaliv (Dihydroergotamine + Caffeine + Dipyrone)", dosage: "1cp", quantity: "1", unit: "Caixa(s)", frequency: "8/8h", duration: "se crise forte", instructions: "" }
    ]
  },
  {
    id: 'neuro-migranea',
    name: 'Crise de Enxaqueca',
    category: 'Neurologia',
    subcategory: 'Migrânea',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Repouso em ambiente escuro e silencioso durante a crise.",
    medications: [
      { name: "Sumatriptana", dosage: "50mg", quantity: "2", unit: "Comprimido(s)", frequency: "Dose única", duration: "1 dia", instructions: "Tomar no início da dor" },
      { name: "Naproxeno", dosage: "500mg", quantity: "1", unit: "Caixa(s)", frequency: "12/12h", duration: "3 dias", instructions: "" },
      { name: "Metoclopramida", dosage: "10mg", quantity: "1", unit: "Caixa(s)", frequency: "8/8h", duration: "se náusea", instructions: "" }
    ]
  },

  {
    id: 'neuro-vertigem',
    name: 'Vertigem / Labirintite',
    category: 'Neurologia',
    subcategory: 'Tontura',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Cuidado ao levantar.",
    medications: [
      { name: "Dramin B6", dosage: "Comprimido", quantity: "10", unit: "Comprimido(s)", frequency: "8/8h", duration: "3 dias", instructions: "" },
      { name: "Cinarizina", dosage: "25mg", quantity: "30", unit: "Comprimido(s)", frequency: "8/8h", duration: "10 dias", instructions: "" }
    ]
  },

  // PSIQUIATRIA


{
    id: 'psiq-ansiedade',
    name: 'Ansiedade (Crise)',
    category: 'Psiquiatria e Saúde Mental',
    subcategory: 'Ansiedade',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Uso pontual em crises.",
    medications: [
      { name: "Clonazepam", dosage: "0,25mg", quantity: "1", unit: "Caixa(s)", frequency: "Se necessário", duration: "", instructions: "Sublingual." }
    ]
  },
  {
    id: 'psiq-insonia',
    name: 'Ansiedade Leve (Passiflora)',
    category: 'Psiquiatria e Saúde Mental',
    subcategory: 'Ansiedade',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Fitoterápico.",
    medications: [
      { name: "Passiflora Incarnata", dosage: "300mg", quantity: "20", unit: "Comprimido(s)", frequency: "12/12h", duration: "10 dias", instructions: "" }
    ]
  },

  // DERMATOLÓGICO
  {
    id: 'dermato-herpes',
    name: 'Herpes Zóster',
    category: 'Dermatologia',
    subcategory: 'Herpes',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Manter lesões limpas.\n• Lavar mãos após tocar nas lesões.\n• Evitar contato com gestantes e imunossuprimidos.",
    medications: [
      { name: "Aciclovir", dosage: "800mg", quantity: "35", unit: "Comprimido(s)", frequency: "4/4h (5x dia)", duration: "7 dias", instructions: "Pular dose da madrugada" },
      { name: "Gabapentina", dosage: "300mg", quantity: "1", unit: "Caixa(s)", frequency: "1x a noite", duration: "Uso contínuo", instructions: "Para dor neuropática" },
      { name: "Dipirona", dosage: "1g", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor", instructions: "" }
    ]
  },
  {
    id: 'dermato-impetigo',
    name: 'Impetigo / Piodermite',
    category: 'Dermatologia',
    subcategory: 'Infecção Pele',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Limpeza das lesões com água e sabão.\n• Remover crostas suavemente.\n• Trocar toalhas e fronhas diariamente.",
    medications: [
      { name: "Cefalexina", dosage: "500mg", quantity: "28", unit: "Comprimido(s)", frequency: "6/6h", duration: "7 dias", instructions: "" },
      { name: "Mupirocina", dosage: "Pomada", quantity: "1", unit: "Bisnaga(s)", frequency: "3x ao dia", duration: "7 dias", instructions: "Nas lesões" }
    ]
  },

  {
    id: 'dermato-alergia',
    name: 'Alergia / Urticária (Crise)',
    category: 'Dermatologia',
    subcategory: 'Alergia',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Afastar causador.\n• Retornar se falta de ar.",
    medications: [
      { name: "Prednisolona", dosage: "40mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "" },
      { name: "Loratadina", dosage: "10mg", quantity: "5", unit: "Comprimido(s)", frequency: "12/12h", duration: "5 dias", instructions: "" }
    ]
  },
  {
    id: 'dermato-celulite',
    name: 'Celulite Infecciosa',
    category: 'Dermatologia',
    subcategory: 'Infecção Bacteriana',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Manter membro elevado.\n• Compressas frias.",
    medications: [
      { name: "Cefalexina", dosage: "500mg", quantity: "28", unit: "Comprimido(s)", frequency: "6/6h", duration: "7 dias", instructions: "Tomar com estômago vazio." },
      { name: "Naproxeno", dosage: "500mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "" }
    ]
  },
  {
    id: 'dermato-escabiose',
    name: 'Escabiose / Sarna',
    category: 'Dermatologia',
    subcategory: 'Infestação',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Lavar roupas com água quente.\n• Tratar todos da casa.",
    medications: [
      { name: "Ivermectina", dosage: "6mg", quantity: "4", unit: "Comprimido(s)", frequency: "Dose Única", duration: "Repetir em 7 dias", instructions: "2 comp hoje + 2 comp em 7 dias (Dose adulto 60kg)." },
      { name: "Permetrina Loção 1%", dosage: "Frasco", quantity: "1", unit: "Frasco(s)", frequency: "Noite", duration: "Repetir em 7 dias", instructions: "Aplicar no corpo todo, deixar 8h e lavar." },
      { name: "Hidroxizina", dosage: "25mg", quantity: "10", unit: "Comprimido(s)", frequency: "12/12h", duration: "5 dias", instructions: "Para coceira." }
    ]
  },
  {
    id: 'dermato-zoster',
    name: 'Herpes Zoster (Valaciclovir)',
    category: 'Dermatologia',
    subcategory: 'Infecção Viral',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Cuidado com contágio.\n• Retornar se dor ocular.",
    medications: [
      { name: "Valaciclovir", dosage: "500mg", quantity: "42", unit: "Comprimido(s)", frequency: "8/8h", duration: "7 dias", instructions: "2 comprimidos de 8/8h." },
      { name: "Tramadol", dosage: "50mg", quantity: "10", unit: "Comprimido(s)", frequency: "6/6h", duration: "se dor intensa", instructions: "" }
    ]
  },
  {
    id: 'dermato-herpes-simples',
    name: 'Herpes Simples (Aciclovir)',
    category: 'Dermatologia',
    subcategory: 'Infecção Viral',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Iniciar nas primeiras 72h.",
    medications: [
      { name: "Aciclovir", dosage: "400mg", quantity: "21", unit: "Comprimido(s)", frequency: "8/8h", duration: "7 dias", instructions: "" }
    ]
  },
  {
    id: 'dermato-dermatite',
    name: 'Dermatite Atópica (Crise)',
    category: 'Dermatologia',
    subcategory: 'Eczema',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Hidratação intensa da pele.",
    medications: [
      { name: "Prednisolona", dosage: "40mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "" },
      { name: "Hidrocortisona Creme", dosage: "1%", quantity: "1", unit: "Bisnaga(s)", frequency: "12/12h", duration: "7 dias", instructions: "Nas lesões." }
    ]
  },
  
// CLÍNICA GERAL e UROLOGIA e OTORRINO
  {
    id: 'geral-itu',
    name: 'ITU (Cistite) - Mulher não gestante',
    category: 'Urologia e Nefro', 
    subcategory: 'ITU',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Ingestão hídrica abundante.\n• Higiene adequada.",
    medications: [
      { name: "Fosfomicina (Monuril)", dosage: "3g", quantity: "1", unit: "Envelope(s)", frequency: "Dose Única", duration: "1 dia", instructions: "Tomar a noite ao deitar, após esvaziar bexiga" },
      { name: "Pyridium (Fenazopiridina)", dosage: "200mg", quantity: "6", unit: "Comprimido(s)", frequency: "8/8h", duration: "2 dias", instructions: "Para alívio da disúria. Urina ficará laranja." }
    ]
  },
  
  {
    id: 'uro-cistite-nitro',
    name: 'Cistite (Nitrofurantoína)',
    category: 'Urologia e Nefro',
    subcategory: 'Infecção Urinária',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Urina pode ficar laranja (Pyridium).\n• Aumentar ingesta hídrica.",
    medications: [
      { name: "Nitrofurantoína", dosage: "100mg", quantity: "28", unit: "Comprimido(s)", frequency: "6/6h", duration: "7 dias", instructions: "Com alimentos." },
      { name: "Fenazopiridina (Pyridium)", dosage: "200mg", quantity: "6", unit: "Comprimido(s)", frequency: "8/8h", duration: "2 dias", instructions: "Analgésico." }
    ]
  },

  {
    id: 'uro-pielonefrite5',
    name: 'Pielonefrite (Amox+Clav)',
    category: 'Urologia e Nefro',
    subcategory: 'Infecção Urinária',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Retornar se febre após 48h.",
    medications: [
      { name: "Amoxicilina + Clavulanato", dosage: "875mg + 125mg", quantity: "20", unit: "Comprimido(s)", frequency: "12/12h", duration: "10 dias", instructions: "" }
    ]
  },
  
  {
    id: 'uro-litiase12',
    name: 'Cálculo Renal (Expulsão)',
    category: 'Urologia e Nefro',
    subcategory: 'Litíase',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Peneirar urina para recuperar cálculo.",
    medications: [
      { name: "Tansulosina", dosage: "0,4mg", quantity: "30", unit: "Cápsula(s)", frequency: "24/24h", duration: "30 dias", instructions: "" },
      { name: "Naproxeno", dosage: "500mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "" },
      { name: "Tramadol", dosage: "50mg", quantity: "10", unit: "Comprimido(s)", frequency: "8/8h", duration: "se dor intensa", instructions: "" }
    ]
  },

  {
    id: 'resp-otite', 
    name: 'Otite Média Aguda',
    category: 'Otorrinolaringologia',
    subcategory: 'Otite',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Evitar entrada de água no ouvido.\n• Compressas mornas secas para alívio da dor.",
    medications: [
      { name: "Amoxicilina", dosage: "500mg", quantity: "21", unit: "Comprimido(s)", frequency: "8/8h", duration: "7 dias", instructions: "" },
      { name: "Dipirona", dosage: "500mg", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor", instructions: "" }
    ]
  },
  
  // PEDIATRIA
  {
    id: 'ped-febre',
    name: 'Febre / Dor - Pediátrica',
    category: 'Pediatria',
    subcategory: 'Sintomáticos',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Banho morno.\n• Oferecer líquidos.",
    medications: [
      { name: "Dipirona (Gotas 500mg/ml)", dosage: "1 gota/kg", quantity: "1", unit: "Frasco(s)", frequency: "6/6h", duration: "se febre > 37.8", instructions: "Max: 40 gotas" },
      { name: "Ibuprofeno (Gotas 100mg/ml)", dosage: "1 gota/kg", quantity: "1", unit: "Frasco(s)", frequency: "8/8h", duration: "intercalar se necessário", instructions: "" }
    ]
  },

  {
    id: 'ped-amoxicilina',
    name: 'Amoxicilina (Cálculo)',
    category: 'Pediatria',
    subcategory: 'Antibiótico',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Dose: 50mg/kg/dia (dividir em 3x).",
    medications: [
      { name: "Amoxicilina 250mg/5mL", dosage: "Calculada", quantity: "1", unit: "Frasco(s)", frequency: "8/8h", duration: "7 dias", instructions: "Peso x 50 / 3" }
    ]
  },
  {
    id: 'ped-dengue',
    name: 'Dengue Ped (Hidratação)',
    category: 'Pediatria',
    subcategory: 'Hidratação',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Até 10kg: 130ml/kg.\n• 10-20kg: 100ml/kg.",
    medications: [
      { name: "Sais de Reidratação", dosage: "Envelope", quantity: "4", unit: "Envelope(s)", frequency: "Livre", duration: "Uso contínuo", instructions: "Ofertar pequenos goles." }
    ]
  },

  // --- CISTITE (NITROFURANTOÍNA) ---
  {
    id: 'uro-cistite-nitro11',
    name: 'Cistite (Nitrofurantoína)',
    category: 'Urologia e Nefro',
    subcategory: 'Infecção Urinária',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Aumentar ingestão de água.\n• Urinar sempre que sentir vontade.\n• O Pyridium deixa a urina alaranjada (é normal).\n• Retornar se febre > 37,8°C ou dor lombar.",
    medications: [
      { name: "Nitrofurantoína", dosage: "100mg", quantity: "28", unit: "Comprimido(s)", frequency: "6/6h", duration: "7 dias", instructions: "Tomar junto com alimentos para evitar náusea." },
      { name: "Fenazopiridina (Pyridium)", dosage: "200mg", quantity: "6", unit: "Comprimido(s)", frequency: "8/8h", duration: "2 dias", instructions: "Analgésico urinário." },
      { name: "Escopolamina (Buscopan)", dosage: "10mg", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor", instructions: "Se cólica abdominal." }
    ]
  },

  // --- CISTITE (DOSE ÚNICA - FOSFOMICINA) ---
  {
    id: 'uro-cistite-monuril',
    name: 'Cistite (Fosfomicina)',
    category: 'Urologia e Nefro',
    subcategory: 'Infecção Urinária',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Esvaziar a bexiga antes de tomar.\n• Preferencialmente à noite, ao deitar.",
    medications: [
      { name: "Fosfomicina Trometamol", dosage: "3g (5,631g)", quantity: "1", unit: "Envelope(s)", frequency: "Dose Única", duration: "1 dia", instructions: "Dissolver em meio copo d'água." },
      { name: "Fenazopiridina (Pyridium)", dosage: "200mg", quantity: "6", unit: "Comprimido(s)", frequency: "8/8h", duration: "2 dias", instructions: "Analgésico urinário." }
    ]
  },

  // --- PIELONEFRITE (ITU ALTA) ---
  {
    id: 'uro-pielonefrit2',
    name: 'Pielonefrite (Amoxicilina+Clav)',
    category: 'Urologia e Nefro',
    subcategory: 'Infecção Urinária',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Repouso e hidratação.\n• Retornar imediatamente se: febre persistente após 48h ou vômitos incoercíveis.",
    medications: [
      { name: "Amoxicilina + Clavulanato", dosage: "875mg + 125mg", quantity: "20", unit: "Comprimido(s)", frequency: "12/12h", duration: "10 dias", instructions: "Tomar 1 comprimido a cada 12 horas." },
      { name: "Fenazopiridina (Pyridium)", dosage: "200mg", quantity: "6", unit: "Comprimido(s)", frequency: "8/8h", duration: "2 dias", instructions: "Sintomático." },
      { name: "Dipirona", dosage: "1g", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se febre", instructions: "" }
    ]
  },

  // --- CÁLCULO RENAL (TERAPIA EXPULSIVA) ---
  {
    id: 'uro-litiase',
    name: 'Cálculo Renal (Tansulosina)',
    category: 'Urologia e Nefro',
    subcategory: 'Litíase',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Peneirar a urina para tentar recuperar o cálculo.\n• Se febre ou dor intratável: ir ao Pronto Socorro.\n• Agendar Urologista.",
    medications: [
      { name: "Tansulosina", dosage: "0,4mg", quantity: "30", unit: "Cápsula(s)", frequency: "24/24h", duration: "4 semanas", instructions: "Tomar 1 cápsula ao dia." },
      { name: "Naproxeno", dosage: "500mg", quantity: "5", unit: "Comprimido(s)", frequency: "24/24h", duration: "5 dias", instructions: "Anti-inflamatório." },
      { name: "Tramadol", dosage: "50mg", quantity: "10", unit: "Comprimido(s)", frequency: "8/8h", duration: "se dor intensa", instructions: "Opioide para dor forte." }
    ]
  },

  // GINECOLOGIA
  // --- CANDIDÍASE VULVOVAGINAL ---
  {
    id: 'gineco-candidiase',
    name: 'Candidíase (Fluconazol + Creme)',
    category: 'Ginecologia',
    subcategory: 'Infecção Vaginal',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Usar roupas íntimas de algodão.\n• Abstinência sexual durante o tratamento.\n• Evitar duchas vaginais.",
    medications: [
      { name: "Fluconazol", dosage: "150mg", quantity: "1", unit: "Cápsula(s)", frequency: "Dose Única", duration: "1 dia", instructions: "Via Oral." },
      { name: "Miconazol Creme 2%", dosage: "Bisnaga", quantity: "1", unit: "Bisnaga(s)", frequency: "Noite", duration: "7 dias", instructions: "Aplicar 1 aplicador cheio via vaginal ao deitar." }
    ]
  },

  // --- SUA ---

  {
    id: 'gineco-sua',
    name: 'Sangramento Uterino Anormal',
    category: 'Ginecologia',
    subcategory: 'Sangramento',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Repouso. Realizar BHCG.",
    medications: [
      { name: "Ácido Tranexâmico (Transamin)", dosage: "250mg", quantity: "24", unit: "Comprimido(s)", frequency: "8/8h", duration: "4 dias", instructions: "2 comprimidos por vez." },
      { name: "Ibuprofeno", dosage: "600mg", quantity: "15", unit: "Comprimido(s)", frequency: "8/8h", duration: "5 dias", instructions: "" }
    ]
  },

  // --- VAGINOSE BACTERIANA ---
  {
    id: 'gineco-vaginose',
    name: 'Vaginose Bacteriana (Gardnerella)',
    category: 'Ginecologia',
    subcategory: 'Infecção Vaginal',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• PROIBIDO ingerir álcool durante o tratamento (risco de reação grave com Metronidazol).\n• Tratar parceiros apenas se recorrência.",
    medications: [
      { name: "Metronidazol", dosage: "250mg", quantity: "28", unit: "Comprimido(s)", frequency: "12/12h", duration: "7 dias", instructions: "Tomar 2 comprimidos de uma vez, a cada 12h." },
      { name: "Metronidazol Gel Vaginal", dosage: "100mg/g", quantity: "1", unit: "Bisnaga(s)", frequency: "Noite", duration: "7 dias", instructions: "Opção tópica: 1 aplicador cheio à noite." }
    ]
  },

  // --- HERPES GENITAL ---
  {
    id: 'gineco-herpes',
    name: 'Herpes Genital (Aciclovir)',
    category: 'Ginecologia',
    subcategory: 'IST',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Iniciar o tratamento nas primeiras 72h para melhor eficácia.\n• Evitar relação sexual enquanto houver lesões ativas.",
    medications: [
      { name: "Aciclovir", dosage: "400mg", quantity: "35", unit: "Comprimido(s)", frequency: "8/8h", duration: "7 dias", instructions: "Tomar 1 comprimido a cada 8h." }
    ]
  },

  // --- TRICOMONÍASE ---
  {
    id: 'gineco-tricomoniase',
    name: 'Tricomoníase (Metronidazol)',
    category: 'Ginecologia',
    subcategory: 'Infecção Vaginal',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• OBRIGATÓRIO tratar o parceiro(a) sexual.\n• PROIBIDO álcool durante o tratamento (efeito antabuse).\n• Abstinência sexual por 7 dias.",
    medications: [
      { name: "Metronidazol", dosage: "250mg", quantity: "8", unit: "Comprimido(s)", frequency: "Dose Única", duration: "1 dia", instructions: "Tomar os 8 comprimidos juntos (total 2g) de uma vez." }
    ]
  },

  // --- CONTRACEPÇÃO DE EMERGÊNCIA ---
  {
    id: 'gineco-contracepcao-emergencia',
    name: 'Contracepção de Emergência',
    category: 'Ginecologia',
    subcategory: 'Contracepção',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Tomar o mais rápido possível (ideal < 72h após o ato).\n• Se vomitar em até 2h após tomar, repetir a dose.\n• Pode adiantar ou atrasar a próxima menstruação.",
    medications: [
      { name: "Levonorgestrel", dosage: "0,75mg", quantity: "2", unit: "Comprimido(s)", frequency: "Dose Única", duration: "1 dia", instructions: "Tomar os 2 comprimidos juntos." }
    ]
  },

  // --- DOENÇA INFLAMATÓRIA PÉLVICA (DIP) ---
  {
    id: 'gineco-dip',
    name: 'DIP (Doença Inflamatória Pélvica)',
    category: 'Ginecologia',
    subcategory: 'Infecção Grave',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Repouso absoluto e abstinência sexual.\n• Retornar em 72h OBRIGATORIAMENTE para reavaliação.\n• Parceiros devem ser tratados para Gonorreia e Clamídia.",
    medications: [
      { name: "Ceftriaxona", dosage: "500mg", quantity: "1", unit: "Ampola(s)", frequency: "Dose Única", duration: "", instructions: "Aplicação Intramuscular (IM) na unidade." },
      { name: "Doxiciclina", dosage: "100mg", quantity: "28", unit: "Comprimido(s)", frequency: "12/12h", duration: "14 dias", instructions: "Antibiótico 1." },
      { name: "Metronidazol", dosage: "500mg", quantity: "28", unit: "Comprimido(s)", frequency: "12/12h", duration: "14 dias", instructions: "Antibiótico 2 (Não beber álcool)." }
    ]
  },
 
  // OBSTETRICIA

  {
    id: 'obst-nauseas',
    name: 'Náuseas na Gestação',
    category: 'Obstetrícia',
    subcategory: 'Gestação',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Comer pouco e várias vezes.",
    medications: [
      { name: "Dramin B6", dosage: "Comprimido", quantity: "10", unit: "Comprimido(s)", frequency: "8/8h", duration: "se náusea", instructions: "" },
      { name: "Plasil", dosage: "10mg", quantity: "10", unit: "Comprimido(s)", frequency: "8/8h", duration: "se vômito", instructions: "" }
    ]
  },
  {
    id: 'obst-cistite12',
    name: 'Cistite na Gestante (Cefuroxima)',
    category: 'Obstetrícia',
    subcategory: 'Gestação',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Antibiótico seguro na gestação.",
    medications: [
      { name: "Cefuroxima", dosage: "250mg", quantity: "14", unit: "Comprimido(s)", frequency: "12/12h", duration: "7 dias", instructions: "" }
    ]
  },


// ENDOCRINOLOGIA
  
  {
    id: 'endo-hipotireoidismo',
    name: 'Hipotireoidismo (Levotiroxina)',
    category: 'Endocrinologia',
    subcategory: 'Tireoide',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Jejum absoluto. Esperar 30min para comer.",
    medications: [
      { name: "Levotiroxina", dosage: "25mcg", quantity: "30", unit: "Comprimido(s)", frequency: "1x ao dia", duration: "Uso contínuo", instructions: "" }
    ]
  },

// --- DIABETES TIPO 2 (MONOTERAPIA - INICIAL) ---
  {
    id: 'endo-dm2-metformina1',
    name: 'Diabetes T2 (Metformina)',
    category: 'Endocrinologia',
    subcategory: 'Diabetes',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Tomar junto com as refeições para evitar desconforto gástrico.\n• Dieta pobre em açúcares e farinha branca.\n• Meta de HbA1c < 7%.",
    medications: [
      { name: "Cloridrato de Metformina", dosage: "500mg", quantity: "60", unit: "Comprimido(s)", frequency: "12/12h", duration: "Uso contínuo", instructions: "Tomar no café da manhã e jantar." },
      { name: "Cloridrato de Metformina", dosage: "850mg", quantity: "30", unit: "Comprimido(s)", frequency: "1x ao dia", duration: "Uso contínuo", instructions: "Opção: Tomar após o almoço." }
    ]
  },

  // --- DIABETES TIPO 2 (TERAPIA DUPLA - PREFERENCIAL) ---
  {
    id: 'endo-dm2-gliclazida',
    name: 'Diabetes T2 (Metformina + Gliclazida)',
    category: 'Endocrinologia',
    subcategory: 'Diabetes',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• A Gliclazida MR libera o remédio aos poucos, protegendo mais o paciente.\n• Tomar a Gliclazida sempre pela manhã.\n• Monitorar glicemia de jejum.",
    medications: [
      { name: "Cloridrato de Metformina", dosage: "850mg", quantity: "60", unit: "Comprimido(s)", frequency: "12/12h", duration: "Uso contínuo", instructions: "Tomar junto com as refeições (almoço e jantar)." },
      { name: "Gliclazida MR", dosage: "30mg", quantity: "60", unit: "Comprimido(s)", frequency: "1x ao dia", duration: "Uso contínuo", instructions: "Tomar 1 a 2 comprimidos (30-60mg) no café da manhã." }
    ]
  },

  // --- DIABETES DESCOMPENSADO (TRANSIÇÃO INSULINA) ---
  {
    id: 'endo-diabetes-insulina',
    name: 'Diabetes (Transição Insulina NPH/Regular)',
    category: 'Endocrinologia',
    subcategory: 'Diabetes',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Esquema Basal-Bolus.\n• Dose total: 0,2 a 0,5 U/kg/dia.\n• Rodiziar locais de aplicação (braço, coxa, abdome).",
    medications: [
      { name: "Insulina NPH", dosage: "Frasco", quantity: "1", unit: "Frasco(s)", frequency: "12/12h", duration: "Uso contínuo", instructions: "Aplicar 2/3 da dose pela manhã e 1/3 à noite (Basal)." },
      { name: "Insulina Regular", dosage: "Frasco", quantity: "1", unit: "Frasco(s)", frequency: "Refeições", duration: "Uso contínuo", instructions: "Aplicar 1/3 da dose antes das principais refeições (Bolus)." }
    ]
  },

  // --- HIPOGLICEMIA (RECUPERAÇÃO ORAL) ---
  // Fonte: Guia Prático Pág. 70 [cite: 3989-3993]
  {
    id: 'endo-hipoglicemia-oral',
    name: 'Hipoglicemia Leve (Regra dos 15)',
    category: 'Endocrinologia',
    subcategory: 'Diabetes',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Ingerir 15g de carboidrato rápido.\n• Aguardar 15 minutos e medir novamente.\n• Se < 70mg/dL, repetir.",
    medications: [
      { name: "Glicose 50%", dosage: "Ampola", quantity: "2", unit: "Ampola(s)", frequency: "Se necessário", duration: "", instructions: "Ingerir o conteúdo da ampola ou 1 colher de mel/açúcar." }
    ]
  },


  // --- HIPOTIREOIDISMO (LEVOTIROXINA) ---
  {
    id: 'endo-hipotireoidismo1',
    name: 'Hipotireoidismo (Levotiroxina)',
    category: 'Endocrinologia',
    subcategory: 'Tireoide',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• OBRIGATÓRIO: Tomar em jejum absoluto com água.\n• Aguardar 30 a 60 min para tomar café.\n• Evitar trocar a marca do laboratório.",
    medications: [
      { name: "Levotiroxina Sódica (Puran/Euthyrox)", dosage: "25mcg", quantity: "30", unit: "Comprimido(s)", frequency: "1x ao dia", duration: "Uso contínuo", instructions: "Dose inicial comum. Ajustar conforme TSH." }
    ]
  },

  // --- HIPERTIREOIDISMO (TRATAMENTO ESPECÍFICO) ---
  {
    id: 'endo-hipertireoidismo-metimazol',
    name: 'Hipertireoidismo (Metimazol)',
    category: 'Endocrinologia',
    subcategory: 'Tireoide',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Tratamento para reduzir a produção de hormônio.\n• Monitorar hemograma (risco de baixa imunidade) e função hepática.",
    medications: [
      { name: "Metimazol (Tapazol)", dosage: "10mg", quantity: "30", unit: "Comprimido(s)", frequency: "8/8h", duration: "Uso contínuo", instructions: "Dose inicial: 20 a 30mg/dia. Ajustar com endocrinologista." }
    ]
  },

  // --- HIPERTIREOIDISMO (CONTROLE DE SINTOMAS) ---
  {
    id: 'endo-hipertireoidismo-sintomas',
    name: 'Hipertireoidismo (Propranolol)',
    category: 'Endocrinologia',
    subcategory: 'Tireoide',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Controle de taquicardia e tremores.\n• Usar associado ao Metimazol.",
    medications: [
      { name: "Propranolol", dosage: "40mg", quantity: "30", unit: "Comprimido(s)", frequency: "6/6h", duration: "Uso contínuo", instructions: "Dose usual: 40 a 80mg/dia." }
    ]
  },
  
// ---OFTALMOLOGIA

{
    id: 'oftalmo-conjuntivite-bact',
    name: 'Conjuntivite Bacteriana',
    category: 'Oftalmologia',
    subcategory: 'Infecção',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Higiene e compressas frias.",
    medications: [
      { name: "Tobramicina Colírio", dosage: "Frasco", quantity: "1", unit: "Frasco(s)", frequency: "4/4h", duration: "7 dias", instructions: "" },
      { name: "Lacrifilm", dosage: "Frasco", quantity: "1", unit: "Frasco(s)", frequency: "Livre", duration: "Uso contínuo", instructions: "" }
    ]
  },
  {
    id: 'oftalmo-conjuntivite-alerg',
    name: 'Conjuntivite Alérgica',
    category: 'Oftalmologia',
    subcategory: 'Alergia',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Não coçar os olhos.",
    medications: [
      { name: "Olopatadina 0,1%", dosage: "Frasco", quantity: "1", unit: "Frasco(s)", frequency: "12/12h", duration: "Uso contínuo", instructions: "Antialérgico." },
      { name: "Lacrifilm", dosage: "Frasco", quantity: "1", unit: "Frasco(s)", frequency: "Livre", duration: "Uso contínuo", instructions: "" }
    ]
  },

  // --- INFECTOLOGIA (NOVOS PROTOCOLOS) ---
  {
    id: 'infecto-dengue-hidratacao',
    name: 'Dengue - Grupos A/B (Hidratação)',
    category: 'Infectologia',
    subcategory: 'Arbovirose',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Hidratação: 60 a 80 ml/kg/dia (1/3 de Soro de Reidratação + 2/3 de água/sucos).\n• PROIBIDO usar anti-inflamatórios (AAS, Ibuprofeno, Nimesulida).\n• Retornar se: dor abdominal intensa, vômitos persistentes ou sangramento.",
    medications: [
      { name: "Dipirona", dosage: "1g", quantity: "10", unit: "Comprimido(s)", frequency: "6/6h", duration: "se dor ou febre", instructions: "" },
      { name: "Sais para Reidratação Oral", dosage: "Envelope", quantity: "6", unit: "Envelope(s)", frequency: "Livre", duration: "Uso contínuo", instructions: "Intercalar com água, sucos e chás." },
      { name: "Ondansetrona", dosage: "8mg", quantity: "10", unit: "Comprimido(s)", frequency: "8/8h", duration: "se náusea", instructions: "" }
    ]
  },
  {
    id: 'infecto-sifilis-benzetacil',
    name: 'Sífilis (Benzetacil)',
    category: 'Infectologia',
    subcategory: 'IST',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Dose Única de 2.400.000 UI.\n• Tratar parceiros sexuais.\n• Pedir VDRL de controle em 3 meses.",
    medications: [
      { name: "Penicilina Benzatina (Benzetacil)", dosage: "1.200.000 UI", quantity: "2", unit: "Ampola(s)", frequency: "Dose Única", duration: "", instructions: "Aplicar 1 ampola em cada glúteo (Total 2.400.000 UI)." }
    ]
  },
  {
    id: 'infecto-sifilis-doxi',
    name: 'Sífilis (Opção Oral / Alérgicos)',
    category: 'Infectologia',
    subcategory: 'IST',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Alternativa apenas para alérgicos a penicilina (exceto gestantes).\n• Não tomar com leite ou antiácidos.\n• Usar protetor solar (risco de manchas).",
    medications: [
      { name: "Doxiciclina", dosage: "100mg", quantity: "30", unit: "Comprimido(s)", frequency: "12/12h", duration: "15 dias", instructions: "Tomar com copo cheio de água. Não deitar logo após." }
    ]
  },
  {
    id: 'infecto-pep-hiv',
    name: 'PEP - Profilaxia HIV (28 dias)',
    category: 'Infectologia',
    subcategory: 'Profilaxia',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• INICIAR EM ATÉ 72 HORAS após a exposição (ideal nas primeiras 2h).\n• Tomar todos os dias no mesmo horário sem falhar.\n• Repetir exames após o término.",
    medications: [
      { name: "Tenofovir + Lamivudina (TDF/3TC)", dosage: "300/300mg", quantity: "28", unit: "Comprimido(s)", frequency: "1x ao dia", duration: "28 dias", instructions: "Esquema preferencial (2 em 1)." },
      { name: "Dolutegravir (DTG)", dosage: "50mg", quantity: "28", unit: "Comprimido(s)", frequency: "1x ao dia", duration: "28 dias", instructions: "Tomar junto com o outro comprimido." }
    ]
  },
  {
    id: 'infecto-mordedura',
    name: 'Mordedura de Cão/Gato (Antibiótico)',
    category: 'Infectologia',
    subcategory: 'Profilaxia',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Lavar ferida com água e sabão abundantemente.\n• Verificar Vacina Antitetânica e Antirrábica.\n• Retornar se sinais de infecção (pus, vermelhidão).",
    medications: [
      { name: "Amoxicilina + Clavulanato", dosage: "875mg + 125mg", quantity: "14", unit: "Comprimido(s)", frequency: "12/12h", duration: "5 a 7 dias", instructions: "Profilaxia de infecção." },
      { name: "Dipirona", dosage: "1g", quantity: "1", unit: "Caixa(s)", frequency: "6/6h", duration: "se dor", instructions: "" }
    ]
  },
  {
    id: 'infecto-influenza-adulto',
    name: 'Influenza / Gripe A (Tamiflu)',
    category: 'Infectologia',
    subcategory: 'Infecção Viral',
    isFavorite: true,
    isCustom: false,
    customInstructions: "• Indicado para pacientes de risco ou casos graves.\n• Iniciar nas primeiras 48h de sintomas.\n• Isolamento relativo enquanto houver febre.",
    medications: [
      { name: "Fosfato de Oseltamivir", dosage: "75mg", quantity: "10", unit: "Cápsula(s)", frequency: "12/12h", duration: "5 dias", instructions: "" },
      { name: "Dipirona", dosage: "1g", quantity: "10", unit: "Comprimido(s)", frequency: "6/6h", duration: "se febre", instructions: "" }
    ]
  },
  {
    id: 'infecto-cancro-mole',
    name: 'Cancro Mole (Azitromicina)',
    category: 'Infectologia',
    subcategory: 'IST - Úlcera',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Feridas dolorosas com fundo sujo.\n• Tratar parceiros sexuais.\n• Retornar em 7 dias para reavaliação.",
    medications: [
      { name: "Azitromicina", dosage: "500mg", quantity: "2", unit: "Comprimido(s)", frequency: "Dose Única", duration: "1 dia", instructions: "Tomar os 2 comprimidos (1g) juntos." }
    ]
  },
  {
    id: 'infecto-lgv',
    name: 'Linfogranuloma (LGV)',
    category: 'Infectologia',
    subcategory: 'IST - Úlcera',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Tratamento prolongado (21 dias) é obrigatório para cura.\n• Abstinência sexual até o fim do tratamento.\n• Úlcera indolor com íngua na virilha.",
    medications: [
      { name: "Doxiciclina", dosage: "100mg", quantity: "42", unit: "Comprimido(s)", frequency: "12/12h", duration: "21 dias", instructions: "Tomar com bastante água. Não deitar logo após." }
    ]
  },
  {
    id: 'infecto-donovanose',
    name: 'Donovanose (Doxiciclina)',
    category: 'Infectologia',
    subcategory: 'IST - Úlcera',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Úlcera indolor, vermelha viva e que sangra fácil.\n• Manter tratamento até cicatrização completa das lesões (mínimo 3 semanas).",
    medications: [
      { name: "Doxiciclina", dosage: "100mg", quantity: "42", unit: "Comprimido(s)", frequency: "12/12h", duration: "21 dias", instructions: "Ou até cicatrizar as lesões." }
    ]
  },
  {
    id: 'infecto-herpes-supressao',
    name: 'Herpes Recorrente (Supressão)',
    category: 'Infectologia',
    subcategory: 'Profilaxia',
    isFavorite: false,
    isCustom: false,
    customInstructions: "• Indicado para quem tem mais de 6 episódios por ano.\n• Uso contínuo para evitar que a ferida apareça.\n• Reavaliar após 6 meses.",
    medications: [
      { name: "Aciclovir", dosage: "400mg", quantity: "60", unit: "Comprimido(s)", frequency: "12/12h", duration: "Uso contínuo", instructions: "Tomar de manhã e à noite por 6 meses." }
    ]
  },
];

export const getProtocols = (): MedicalProtocol[] => {
  try {
    const customStored = localStorage.getItem(PROTOCOLS_KEY);
    const customProtocols: MedicalProtocol[] = customStored ? JSON.parse(customStored) : [];
    
    const favsStored = localStorage.getItem(FAVORITES_KEY);
    const favs: string[] = favsStored ? JSON.parse(favsStored) : [];

    // Shadowing Logic: If a custom protocol has the same ID as a default one, use the custom one.
    const customIds = new Set(customProtocols.map(p => p.id));
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
  // Note: If it shadowed a default protocol, the default will reappear after this deletion.
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