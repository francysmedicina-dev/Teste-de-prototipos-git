export interface Medication {
  id: string;
  name: string;
  dosage: string;
  quantity: string;
  unit: string;
  frequency: string;
  duration: string;
  instructions: string;
  isAiSuggested?: boolean;
}

export interface Patient {
  name: string;
  age: string;
  document: string; // CPF
  address?: string;
  isPregnant?: boolean;
  isPediatric?: boolean;
  pediatricData?: string; // Specific age/weight for pediatrics
}

export interface Doctor {
  name: string;
  crm: string;
  specialty: string;
  email?: string;
  password?: string;
  profileImage?: string; // Base64 string of the profile picture
}

export interface Institution {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
}

export interface CertificateConfig {
  type: 'medical' | 'attendance';
  days: string; // For medical certificate
  period: string; // For attendance declaration (e.g. "das 08:00 às 10:00")
  includeCid: boolean;
  includeCompanion: boolean;
  companionName: string;
  companionDocument: string;
}

export interface PrescriptionState {
  patient: Patient;
  medications: Medication[];
  customInstructions: string; // Personalized patient instructions
  includeCustomInstructions: boolean; // Toggle for printing instructions
  diagnosis: string; // Used for AI context
  cid: string; // Specific ICD code for printing
  includeCid: boolean; // Authorize CID printing on Prescription
  includeAddress: boolean; // Authorize Address printing
  date: string;
  certificate: CertificateConfig; // Configuration for the certificate view
}

export interface SavedPrescription {
  id: string;
  timestamp: number;
  previewText: string;
  state: PrescriptionState;
}

export interface PatientRecord {
  id: string;
  doctorId: string;
  patientName: string;
  patientNameNormalized: string;
  date: string;
  timestamp: number;
  type: 'prescription' | 'certificate' | 'both';
  state: PrescriptionState;
  medicationSummary: string; // e.g. "Amoxicilina, Dipirona"
  diagnosis?: string;
  isFavorite: boolean;
}

export interface AiSuggestionResponse {
  medications: {
    name: string;
    dosage: string;
    quantity: string;
    unit: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
}

export interface AppGuideContent {
  overview: string;
  steps: {
    title: string;
    description: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  tips: string[];
}

export type ProtocolCategory = 
  | 'Cardiologia'
  | 'Pneumologia'
  | 'Gastroenterologia'
  | 'Endocrinologia'
  | 'Infectologia'
  | 'Psiquiatria e Saúde Mental'
  | 'Ortopedia e Reumatologia'
  | 'Neurologia'
  | 'Urologia e Nefro'
  | 'Ginecologia'
  | 'Obstetrícia'
  | 'Dermatologia'
  | 'Otorrinolaringologia'
  | 'Oftalmologia'
  | 'Pediatria'
  | 'Clínica Geral e MFC'
  | 'Hospitalar' // Added specific category for Emergency/Hospital
  | 'Meus Protocolos';

export interface MedicalProtocol {
  id: string;
  name: string;
  category: ProtocolCategory;
  subcategory: string; // e.g., "IVAS", "Gastrite"
  medications: Omit<Medication, 'id'>[];
  customInstructions: string;
  isFavorite: boolean;
  isCustom: boolean; // True if created by user
  reference?: string; // Source/Guideline reference
}

export type CalculatorType = 
  | 'BMI' 
  | 'CockcroftGault' 
  | 'Chadsvasc' 
  | 'HasBled' 
  | 'ChildPugh' 
  | 'WellsDVT' 
  | 'CURB65' 
  | 'MELD';

export interface CalculatorResult {
  id: string;
  type: CalculatorType;
  score: number;
  interpretation: string;
  recommendation: string;
  timestamp: number;
  inputs: any;
}