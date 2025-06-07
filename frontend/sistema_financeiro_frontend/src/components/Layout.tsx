import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

// Componente de layout que será usado em todas as páginas autenticadas
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegação superior */}
      <nav className="bg-[#07233B] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/logo.png" // ajuste o caminho da imagem conforme necessário
                alt="Logo"
                className="h-10 w-auto"
              />
              <h1 className="text-white text-xl font-bold">INMECAP - Sistema de Gestão</h1>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8 ml-10">
                <a 
                  href="/"
                  onClick={(e) => { e.preventDefault(); navigate('/'); }}
                  className="text-white hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-base font-medium"
                >
                  Dashboard
                </a>
                <a 
                  href="/pacientes"
                  onClick={(e) => { e.preventDefault(); navigate('/pacientes'); }}
                  className="text-white hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-base font-medium"
                >
                  Pacientes
                </a>
                <a 
                  href="/contratos"
                  onClick={(e) => { e.preventDefault(); navigate('/contratos'); }}
                  className="text-white hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-base font-medium"
                >
                  Contratos
                </a>
                <a 
                  href="/fornecedores"
                  onClick={(e) => { e.preventDefault(); navigate('/fornecedores'); }}
                  className="text-white hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-base font-medium"
                >
                  Fornecedores
                </a>
                <a 
                  href="/lancamentos"
                  onClick={(e) => { e.preventDefault(); navigate('/lancamentos'); }}
                  className="text-white hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-base font-medium"
                >
                  Lançamentos
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-white">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
export default Layout;
