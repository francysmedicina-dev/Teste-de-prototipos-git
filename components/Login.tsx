
import React, { useState } from 'react';
import { Stethoscope, ArrowRight, Loader2, AlertCircle, UserX, Eye, EyeOff, Info } from 'lucide-react';
import { login } from '../services/authService';
import { Doctor } from '../types';

interface LoginProps {
  onLoginSuccess: (user: Doctor) => void;
  onSwitchToRegister: () => void;
  onSkipLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister, onSkipLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Login disabled temporarily
    return;
  };

  const handleForgotPassword = () => {
    // Disabled
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-medical-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-6">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Acesse sua conta para gerenciar prescrições.
          </p>
        </div>

        {/* Error Message (Hidden generally as login is disabled, but kept for structure) */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-in slide-in-from-top-2">
             <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
             <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 opacity-60 pointer-events-none select-none">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Endereço de e-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                disabled
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent sm:text-sm bg-gray-100 dark:bg-gray-800 transition-colors cursor-not-allowed"
                placeholder="medico@exemplo.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Senha
                 </label>
                 <button 
                    type="button"
                    disabled
                    className="text-xs font-medium text-gray-400 cursor-not-allowed"
                 >
                    Esqueceu a senha?
                 </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent sm:text-sm bg-gray-100 dark:bg-gray-800 transition-colors pr-10 cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  disabled
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-not-allowed focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Temporary Disabled Message */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3">
             <Info className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
             <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                As funções de login, senha e criação de conta ainda serão adicionadas em breve. No momento, você pode acessar o aplicativo usando o modo de visitante. Lembre-se de que o histórico ficará salvo apenas no seu navegador e não será armazenado no servidor.
             </p>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-medical-600 opacity-50 cursor-not-allowed shadow-none"
            >
              <span className="flex items-center gap-2">
                 Entrar
                 <ArrowRight className="h-4 w-4" />
              </span>
            </button>

             {/* Skip Login Button - ACTIVE */}
            <button
              type="button"
              onClick={onSkipLogin}
              className="w-full flex justify-center py-3 px-4 border-2 border-green-500 dark:border-green-600 text-sm font-bold rounded-lg text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all focus:outline-none shadow-sm hover:shadow-md"
            >
               <span className="flex items-center gap-2">
                  <UserX className="h-5 w-5" />
                  Acessar como Visitante
               </span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed">
            Ainda não tem uma conta?{' '}
            <span
              className="font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed decoration-slice"
            >
              Cadastre-se gratuitamente
            </span>
          </p>
        </div>
      </div>
      
      {/* Simple Footer Signature */}
      <div className="fixed bottom-4 text-center w-full text-xs text-gray-400 dark:text-gray-500">
        &copy; {new Date().getFullYear()} Prescreve AI. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default Login;
