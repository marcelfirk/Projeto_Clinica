import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEstoqueOpen, setIsEstoqueOpen] = useState(false);
  
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

  const toggleCadastros = () => {
    setIsCadastrosOpen(!isCadastrosOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Barra de navegação superior - agora com largura total */}
      <nav className="bg-[#07233B] shadow-sm w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16"> {/* Ajuste de padding para telas grandes */}
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Logo e título - ajuste para telas grandes */}
              <div className="flex-shrink-0 flex items-center">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-10 w-auto"
                />
                <h1 className="text-white text-xl font-bold ml-2 hidden sm:block">INMECAP - Sistema de Gestão</h1>
              </div>

              {/* Menu desktop - ajustado para usar melhor o espaço */}
              <div className="hidden md:ml-6 md:flex md:space-x-2 lg:space-x-4">
                {[
                  { path: '/', label: 'Dashboard' },
                  { path: '/agendamentos', label: 'Agendamentos' },
                  { path: '/contratos', label: 'Contratos' },
                  { path: '/lancamentos', label: 'Lançamentos' },
                  { path: '/calendario', label: 'Calendário' },
                ].map((item) => (
                  <a 
                    key={item.path}
                    href={item.path}
                    onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                    className="text-white hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.label}
                  </a>
                ))}
                {/* Dropdown de Estoque */}
                <div className="relative">
                  <button
                    onClick={() => setIsEstoqueOpen((prev) => !prev)}
                    className="text-white hover:bg-gray-700 hover:text-white inline-flex items-center px-3 py-2 rounded-md text-sm font-medium focus:outline-none"
                  >
                    Estoque
                    <svg
                      className="ml-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {isEstoqueOpen && (
                    <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                      {[
                        { path: '/entradas-estoque', label: 'Entrada de Estoque' },
                        { path: '/saidas-estoque', label: 'Saída de Estoque' },
                        { path: '/estoque-atual', label: 'Estoque Atual' }
                      ].map((item) => (
                        <a
                          key={item.path}
                          href={item.path}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(item.path);
                            setIsEstoqueOpen(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {/* Dropdown de Cadastros - mais compacto */}
                <div className="relative">
                  <button
                    onClick={toggleCadastros}
                    className="text-white hover:bg-gray-700 hover:text-white inline-flex items-center px-3 py-2 rounded-md text-sm font-medium focus:outline-none"
                  >
                    Cadastros
                    <svg
                      className="ml-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {isCadastrosOpen && (
                    <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      {[
                        { path: '/pacientes', label: 'Pacientes' },
                        { path: '/itens', label: 'Itens' },
                        { path: '/locais-atendimento', label: 'Locais de Atendimento' },
                        { path: '/procedimentos', label: 'Procedimentos' },
                        { path: '/equipes', label: 'Equipes' },
                        { path: '/categorias-procedimento', label: 'Categorias de Procedimento' },
                        { path: '/refeicoes', label: 'Refeições' },
                        { path: '/fornecedores', label: 'Fornecedores' },
                        { path: '/naturezas', label: 'Naturezas' }
                      ].map((item) => (
                        <a
                          key={item.path}
                          href={item.path}
                          onClick={(e) => { e.preventDefault(); navigate(item.path); setIsCadastrosOpen(false); }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Perfil e logout (desktop) - mais compacto */}
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-white text-sm truncate max-w-xs">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm whitespace-nowrap"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {[
                { path: '/', label: 'Dashboard' },
                { path: '/agendamentos', label: 'Agendamentos' },
                { path: '/contratos', label: 'Contratos' },
                { path: '/lancamentos', label: 'Lançamentos' },
                { path: '/calendario', label: 'Calendário' },
              ].map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => { e.preventDefault(); navigate(item.path); setIsMobileMenuOpen(false); }}
                  className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                >
                  {item.label}
                </a>
              ))}

              {/* Dropdown Estoque mobile */}
              <div>
                <button
                  onClick={() => setIsEstoqueOpen((prev) => !prev)}
                  className="text-white hover:bg-gray-700 w-full text-left px-3 py-2 rounded-md text-base font-medium flex justify-between items-center"
                >
                  Estoque
                  <svg
                    className={`ml-1 h-4 w-4 transform ${isEstoqueOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isEstoqueOpen && (
                  <div className="pl-4">
                    {[
                      { path: '/entradas-estoque', label: 'Entrada de Estoque' },
                      { path: '/saidas-estoque', label: 'Saída de Estoque' },
                      { path: '/estoque-atual', label: 'Estoque Atual' }
                    ].map((item) => (
                      <a
                        key={item.path}
                        href={item.path}
                        onClick={(e) => { e.preventDefault(); navigate(item.path); setIsMobileMenuOpen(false); }}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown Cadastros mobile */}
              <div>
                <button
                  onClick={toggleCadastros}
                  className="text-white hover:bg-gray-700 w-full text-left px-3 py-2 rounded-md text-base font-medium flex justify-between items-center"
                >
                  Cadastros
                  <svg
                    className={`ml-1 h-4 w-4 transform ${isCadastrosOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isCadastrosOpen && (
                  <div className="pl-4">
                    {[
                      { path: '/pacientes', label: 'Pacientes' },
                      { path: '/itens', label: 'Itens' },
                      { path: '/locais-atendimento', label: 'Locais de Atendimento' },
                      { path: '/procedimentos', label: 'Procedimentos' },
                      { path: '/equipes', label: 'Equipes' },
                      { path: '/categorias-procedimento', label: 'Categorias de Procedimento' },
                      { path: '/refeicoes', label: 'Refeições' },
                      { path: '/fornecedores', label: 'Fornecedores' },
                      { path: '/naturezas', label: 'Naturezas' }
                    ].map((item) => (
                      <a
                        key={item.path}
                        href={item.path}
                        onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Perfil e logout (mobile) */}
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="text-base font-medium text-white truncate">{user?.name}</div>
              </div>
              <div className="mt-3 px-2">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Conteúdo principal - agora com largura mais adaptável */}
      <main className="flex-1">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full max-w-[1800px]"> {/* Aumentei o max-width */}
          {/* Container com altura flexível */}
          <div className="min-h-[calc(100vh-12rem)] w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Rodapé ajustado */}
      <footer className="bg-[#07233B] text-white py-4 w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 text-center text-sm">
          © {new Date().getFullYear()} INMECAP - Sistema de Gestão
        </div>
      </footer>
    </div>
  );
}

export default Layout;