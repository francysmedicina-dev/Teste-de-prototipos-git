
import React, { useState } from 'react';
import { Stethoscope, UserPlus, Loader2, AlertCircle, ArrowLeft, UserX, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { register } from '../services/authService';
import { Doctor } from '../types';

interface RegisterProps {
  onRegisterSuccess: (user: Doctor, isStudent?: boolean) => void;
  onSwitchToLogin: () => void;
  onSkipLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin, onSkipLogin }) => {
  const [isStudent, setIsStudent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    crm: '',
    specialty: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const newUser: Doctor = {
        name: formData.name,
        crm: isStudent ? "ESTUDANTE" : formData.crm,
        specialty: isStudent ? "Acadêmico de Medicina" : formData.specialty,
        email: formData.email,
        password: formData.password
      };

      const result = register(newUser);
      if (result.success && result.user) {
        onRegisterSuccess(result.user, isStudent);
      } else {
        setError(result.message || "Erro ao criar conta.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors my-4">
        
        {/* Header */}
        <div className="text-center relative">
          <button 
             onClick={onSwitchToLogin}
             className="absolute left-0 top-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
             title="Voltar"
          >
             <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="mx-auto h-12 w-12 bg-medical-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Criar Conta
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Junte-se à plataforma inteligente de prescrição.
          </p>
        </div>

        {/* Student/Doctor Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setIsStudent(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              !isStudent 
                ? 'bg-white dark:bg-gray-600 text-medical-600 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <Stethoscope className="h-4 w-4" /> Sou Médico
          </button>
          <button
            type="button"
            onClick={() => setIsStudent(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              isStudent 
                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <GraduationCap className="h-4 w-4" /> Sou Estudante
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-in slide-in-from-top-2">
             <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
             <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          
          {/* Personal Info */}
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder={isStudent ? "Seu nome" : "Ex: André Souza"}
                />
             </div>
             
             {/* Conditional Fields for Doctors Only */}
             {!isStudent && (
               <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">CRM / UF</label>
                      <input
                          name="crm"
                          type="text"
                          required={!isStudent}
                          value={formData.crm}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="12345-SP"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Especialidade</label>
                      <input
                          name="specialty"
                          type="text"
                          required={!isStudent}
                          value={formData.specialty}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Clínico Geral"
                      />
                  </div>
               </div>
             )}
          </div>

          {/* Account Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
             <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="seu@email.com"
                />
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                <div className="relative">
                  <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pr-10"
                      placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pr-10"
                      placeholder="Repita a senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
             </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`group w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${
                isStudent 
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
                  : 'bg-medical-600 hover:bg-medical-700 focus:ring-medical-500'
              }`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                   {isStudent ? <GraduationCap className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                   {isStudent ? "Acessar Área Acadêmica" : "Cadastrar e Entrar"}
                </span>
              )}
            </button>

            {/* Skip Login Button */}
            <button
              type="button"
              onClick={onSkipLogin}
              className="w-full flex justify-center py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
               Pular login (Acesso Visitante)
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Já possui uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-medical-600 dark:text-medical-400 hover:text-medical-500 hover:underline transition-colors"
            >
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
