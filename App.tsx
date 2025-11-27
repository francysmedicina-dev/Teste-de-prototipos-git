
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import CertificateGenerator from './components/CertificateGenerator';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PatientRecords from './components/PatientRecords';
import SupportWidget from './components/SupportWidget';
import HospitalMode from './components/HospitalMode'; 
import SoapGenerator from './components/SoapGenerator'; // Import SOAP Generator
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { PrescriptionState, Doctor, SavedPrescription, Institution } from './types';
import { savePrescriptionToHistory, getHeaderImage, getHeaderSettings, getCurrentInstitution, savePatientRecord } from './services/storageService';
import { getSession, logout } from './services/authService';

// Mock Doctor Data for Guest Mode Initial State
const MOCK_DOCTOR: Doctor = {
  name: "Visitante (Exemplo)",
  crm: "00000-UF",
  specialty: "Clínica Médica"
};

const INITIAL_STATE: PrescriptionState = {
  patient: {
    name: "",
    age: "",
    document: "",
    address: "",
    isPregnant: false,
    isPediatric: false,
    pediatricData: "",
  },
  medications: [],
  customInstructions: "",
  includeCustomInstructions: true,
  diagnosis: "",
  cid: "",
  includeCid: false,
  includeAddress: false,
  date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  certificate: {
    type: 'medical',
    days: '1',
    period: '',
    includeCid: false,
    includeCompanion: false,
    companionName: '',
    companionDocument: ''
  }
};

function App() {
  // Authentication State
  const [user, setUser] = useState<Doctor | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // Guest Mode Editable State
  const [guestDoctor, setGuestDoctor] = useState<Doctor>(MOCK_DOCTOR);

  // App State
  const [state, setState] = useState<PrescriptionState>(INITIAL_STATE);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Added 'soap' to viewMode type
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'certificate' | 'profile' | 'records' | 'soap'>('editor');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHospitalModeOpen, setIsHospitalModeOpen] = useState(false);
  
  // Global Settings State
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [hideTextHeader, setHideTextHeader] = useState(false);
  const [institution, setInstitution] = useState<Institution>({ id: '', name: '', address: '', city: '', state: '', phone: '' });

  // Initial Load & Session Check
  useEffect(() => {
    // Dark Mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load stored settings
    setHeaderImage(getHeaderImage());
    setHideTextHeader(getHeaderSettings());
    setInstitution(getCurrentInstitution());

    // Check Auth Session
    const sessionUser = getSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
  }, [isDarkMode]);

  // --- Auth Handlers ---

  const handleLoginSuccess = (loggedInUser: Doctor) => {
    setUser(loggedInUser);
    setIsGuest(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsGuest(false);
    setAuthView('login');
    // Reset guest doctor to default
    setGuestDoctor(MOCK_DOCTOR);
    // Optional: Reset app state
    setState(INITIAL_STATE);
    setViewMode('editor');
  };

  const handleSkipLogin = () => {
    setIsGuest(true);
    setUser(null);
  };
  
  const handleProfileUpdate = (updatedUser: Doctor) => {
    setUser(updatedUser);
  };

  // --- App Logic ---

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSaveHistory = () => {
    if (!state.diagnosis && state.medications.length === 0) {
      alert("Preencha o diagnóstico ou medicamentos antes de salvar.");
      return;
    }
    savePrescriptionToHistory(state);
    alert("Modelo salvo no histórico com sucesso!");
  };

  const handleLoadHistory = (saved: SavedPrescription) => {
    if (confirm("Carregar este modelo substituirá os dados atuais. Deseja continuar?")) {
      const today = new Date().toISOString().split('T')[0];
      setState({
        ...saved.state,
        date: today
      });
      setIsHistoryOpen(false);
      setViewMode('editor');
    }
  };

  const handleLoadRecord = (recordState: PrescriptionState) => {
    setState(recordState);
    if (recordState.medications.length > 0) {
       setViewMode('preview');
    } else {
       setViewMode('certificate');
    }
  };
  
  const handleAutoSave = (type: 'prescription' | 'certificate') => {
    if (user) {
      // Auto-save for logged users
      const doctorId = user.email || user.crm;
      savePatientRecord(state, doctorId, type);
    }
  };

  const handleSaveAndExit = () => {
    // 1. Save current record
    const type = viewMode === 'certificate' ? 'certificate' : 'prescription';
    handleAutoSave(type);

    // 2. Reset State to Initial (Clear form for next patient)
    const today = new Date().toISOString().split('T')[0];
    setState({
      ...INITIAL_STATE,
      date: today
    });

    // 3. Navigate back to Editor
    setViewMode('editor');
  };

  const renderContent = () => {
    // Determine effective doctor profile: User (if logged in) OR Guest Editable Doctor (if guest)
    const activeDoctor = user || guestDoctor;

    switch (viewMode) {
      case 'editor':
        return (
          <div className="h-full max-w-4xl mx-auto animate-in fade-in duration-300">
            <Editor 
              state={state} 
              setState={setState} 
              onPreview={() => setViewMode('preview')} 
              onCertificate={() => setViewMode('certificate')}
              onSave={handleSaveHistory}
              // Guest Mode Props
              isGuest={isGuest}
              guestDoctor={guestDoctor}
              onUpdateGuestDoctor={setGuestDoctor}
            />
          </div>
        );
      case 'preview':
        return (
          <div className="h-full animate-in fade-in duration-300">
             <Preview 
              state={state} 
              setState={setState}
              doctor={activeDoctor} 
              institution={institution}
              onBack={() => setViewMode('editor')} 
              customHeaderImage={headerImage}
              hideTextHeader={hideTextHeader}
              onAutoSave={() => handleAutoSave('prescription')}
              onSaveAndExit={handleSaveAndExit}
             />
          </div>
        );
      case 'certificate':
        return (
          <div className="h-full animate-in fade-in duration-300">
            <CertificateGenerator
              state={state}
              setState={setState}
              doctor={activeDoctor}
              institution={institution}
              onBack={() => setViewMode('editor')}
              customHeaderImage={headerImage}
              hideTextHeader={hideTextHeader}
              onAutoSave={() => handleAutoSave('certificate')}
              onSaveAndExit={handleSaveAndExit}
            />
          </div>
        );
      case 'profile':
        return (
          <div className="h-full animate-in fade-in duration-300">
             {user ? (
               <Profile 
                 user={user} 
                 onUpdateUser={handleProfileUpdate} 
                 onBack={() => setViewMode('editor')} 
               />
             ) : (
                <div className="text-center p-10">
                   <p>Acesso de visitante não permite edição de perfil.</p>
                   <button onClick={() => setViewMode('editor')} className="mt-4 text-blue-600 hover:underline">Voltar</button>
                </div>
             )}
          </div>
        );
      case 'records':
        return (
           <div className="h-full animate-in fade-in duration-300">
              <PatientRecords 
                 doctor={activeDoctor} 
                 onLoadRecord={handleLoadRecord} 
                 onBack={() => setViewMode('editor')}
              />
           </div>
        );
      case 'soap':
        return (
          <div className="h-full animate-in fade-in duration-300">
            <SoapGenerator />
          </div>
        );
      default:
        return null;
    }
  };

  // --- Conditional Rendering: Auth vs Main App ---

  if (!user && !isGuest) {
    return authView === 'login' ? (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onSwitchToRegister={() => setAuthView('register')} 
        onSkipLogin={handleSkipLogin}
      />
    ) : (
      <Register 
        onRegisterSuccess={handleLoginSuccess} 
        onSwitchToLogin={() => setAuthView('login')}
        onSkipLogin={handleSkipLogin}
      />
    );
  }

  // Main Application View
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Header 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        onOpenRecords={() => setViewMode('records')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setViewMode('profile')}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenHospitalMode={() => setIsHospitalModeOpen(true)}
        onOpenSoap={() => setViewMode('soap')} // Connect Handler
        onLogout={handleLogout}
        user={user} 
      />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Important Disclaimer Banner */}
        <DisclaimerBanner />

        <div className="h-[calc(100vh-140px)] min-h-[600px]">
          {renderContent()}
        </div>
      </main>

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onLoad={handleLoadHistory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentImage={headerImage}
        onUpdateImage={setHeaderImage}
        hideTextHeader={hideTextHeader}
        onUpdateHideTextHeader={setHideTextHeader}
        institution={institution}
        onUpdateInstitution={setInstitution}
      />

      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        isGuest={isGuest}
        onNavigate={(view) => {
           // Type assertion needed if view can be string, but here we expect literal
           if (view === 'editor' || view === 'profile') {
             setViewMode(view);
           }
           setIsHelpOpen(false);
        }}
      />

      {/* Hospital / Emergency Mode Modal */}
      <HospitalMode 
        isOpen={isHospitalModeOpen}
        onClose={() => setIsHospitalModeOpen(false)}
      />

      <SupportWidget />
    </div>
  );
}

export default App;
