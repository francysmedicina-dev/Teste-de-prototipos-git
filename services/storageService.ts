
import { PrescriptionState, SavedPrescription, Institution, PatientRecord } from "../types";
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'prescriber_ai_history';
const PATIENT_RECORDS_KEY = 'prescriber_ai_patient_records';
const HEADER_IMAGE_KEY = 'prescriber_ai_header_image';
const HIDE_TEXT_HEADER_KEY = 'prescriber_ai_hide_text_header';
const SAVED_INSTITUTIONS_KEY = 'prescriber_ai_saved_institutions';
const CURRENT_INSTITUTION_KEY = 'prescriber_ai_current_institution';

// --- History Management (Templates) ---

export const savePrescriptionToHistory = (state: PrescriptionState): SavedPrescription => {
  const history = getHistory();
  
  const diagnosisText = state.diagnosis || 'Prescrição Geral / Sem Diagnóstico';
  const patientRef = state.patient.name ? `(Ref: ${state.patient.name})` : '';

  const newEntry: SavedPrescription = {
    id: uuidv4(),
    timestamp: Date.now(),
    previewText: `${diagnosisText} ${patientRef}`.trim(),
    state: state
  };

  const updatedHistory = [newEntry, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return newEntry;
};

export const getHistory = (): SavedPrescription[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading history", error);
    return [];
  }
};

export const deleteFromHistory = (id: string): SavedPrescription[] => {
  const history = getHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return updatedHistory;
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// --- Patient Records Management (The "Prescrições" Tab) ---

const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const savePatientRecord = (state: PrescriptionState, doctorId: string, type: 'prescription' | 'certificate' | 'both'): void => {
  const records = getAllPatientRecords();
  
  const medicationSummary = state.medications.map(m => m.name).join(', ');

  const newRecord: PatientRecord = {
    id: uuidv4(),
    doctorId,
    patientName: state.patient.name || 'Paciente Sem Nome',
    patientNameNormalized: normalizeText(state.patient.name || 'Paciente Sem Nome'),
    date: state.date,
    timestamp: Date.now(),
    type,
    state,
    medicationSummary,
    diagnosis: state.diagnosis,
    isFavorite: false
  };

  // Prevent exact duplicates (spamming save/print)
  // Check if a record exists for same patient, same date, same type, same med summary within last 5 minutes
  const isDuplicate = records.some(r => 
    r.doctorId === doctorId &&
    r.patientName === newRecord.patientName &&
    r.date === newRecord.date &&
    r.type === type &&
    r.medicationSummary === medicationSummary &&
    (Date.now() - r.timestamp) < 5 * 60 * 1000 // 5 minutes window
  );

  if (!isDuplicate) {
    const updatedRecords = [newRecord, ...records];
    localStorage.setItem(PATIENT_RECORDS_KEY, JSON.stringify(updatedRecords));
  }
};

const getAllPatientRecords = (): PatientRecord[] => {
  try {
    const stored = localStorage.getItem(PATIENT_RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export const getDoctorPatientRecords = (doctorId: string): PatientRecord[] => {
  const all = getAllPatientRecords();
  return all.filter(r => r.doctorId === doctorId);
};

export const toggleRecordFavorite = (id: string): PatientRecord[] => {
  const records = getAllPatientRecords();
  const updated = records.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r);
  localStorage.setItem(PATIENT_RECORDS_KEY, JSON.stringify(updated));
  return updated; // Return full list, filtering happens in component
};

export const deleteRecord = (id: string): PatientRecord[] => {
  const records = getAllPatientRecords();
  const updated = records.filter(r => r.id !== id);
  localStorage.setItem(PATIENT_RECORDS_KEY, JSON.stringify(updated));
  return updated;
};


// --- Custom Header Management ---

export const saveHeaderImage = (base64Image: string): void => {
  try {
    localStorage.setItem(HEADER_IMAGE_KEY, base64Image);
  } catch (e) {
    console.error("Error saving image (likely too large)", e);
    alert("Erro ao salvar imagem. O arquivo pode ser muito grande para o armazenamento local.");
  }
};

export const getHeaderImage = (): string | null => {
  return localStorage.getItem(HEADER_IMAGE_KEY);
};

export const removeHeaderImage = (): void => {
  localStorage.removeItem(HEADER_IMAGE_KEY);
};

export const saveHeaderSettings = (hideText: boolean): void => {
  localStorage.setItem(HIDE_TEXT_HEADER_KEY, JSON.stringify(hideText));
};

export const getHeaderSettings = (): boolean => {
  const val = localStorage.getItem(HIDE_TEXT_HEADER_KEY);
  return val ? JSON.parse(val) : false;
};

// --- Institution Management ---

export const getSavedInstitutions = (): Institution[] => {
  try {
    const stored = localStorage.getItem(SAVED_INSTITUTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export const saveInstitutionsList = (list: Institution[]): void => {
  localStorage.setItem(SAVED_INSTITUTIONS_KEY, JSON.stringify(list));
};

export const getCurrentInstitution = (): Institution => {
  try {
    const stored = localStorage.getItem(CURRENT_INSTITUTION_KEY);
    return stored ? JSON.parse(stored) : { id: '', name: '', address: '', city: '', state: '', phone: '' };
  } catch (error) {
    return { id: '', name: '', address: '', city: '', state: '', phone: '' };
  }
};

export const saveCurrentInstitution = (inst: Institution): void => {
  localStorage.setItem(CURRENT_INSTITUTION_KEY, JSON.stringify(inst));
};
