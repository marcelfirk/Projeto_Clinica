import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Home } from 'lucide-react';

type MenuKey = 'cadastros' | 'estoque' | 'tratamentos' | 'agenda' | 'financeiro';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [menus, setMenus] = useState<Record<MenuKey, boolean>>({
    cadastros: false,
    estoque: false,
    tratamentos: false,
    agenda: false,
    financeiro: false
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const toggleMenu = (menu: MenuKey) => {
    setMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const simpleLinks = [
    { path: '/calendario', label: 'Calendário' },
    { path: '/agendamentos', label: 'Agendamentos'}
  ];

  const menuGroups = [
    {
      label: 'Financeiro',
      key: 'financeiro' as MenuKey,
      items: [
        { path: '/lancamentos', label: 'Lançamentos' },
        { path: '/contratos', label: 'Contratos' }
      ]
    },
    {
      label: 'Estoque',
      key: 'estoque' as MenuKey,
      items: [
        { path: '/entradas-estoque', label: 'Entradas' },
        { path: '/saidas-estoque', label: 'Saídas' },
        { path: '/estoque-atual', label: 'Estoque Atual' }
      ]
    },
    {
      label: 'Tratamentos',
      key: 'tratamentos' as MenuKey,
      items: [
        { path: '/pacotes-tratamento', label: 'Pacotes' },
        { path: '/pacotes-tratamento/pendentes', label: 'Sessões Pendentes' }
      ]
    },
    {
      label: 'Cadastros',
      key: 'cadastros' as MenuKey,
      items: [
        { path: '/pacientes', label: 'Pacientes' },
        { path: '/itens', label: 'Itens' },
        { path: '/locais-atendimento', label: 'Locais de Atendimento' },
        { path: '/procedimentos', label: 'Procedimentos' },
        { path: '/equipes', label: 'Equipes' },
        { path: '/categorias-procedimento', label: 'Categorias de Procedimento' },
        { path: '/refeicoes', label: 'Refeições' },
        { path: '/fornecedores', label: 'Fornecedores' },
        { path: '/naturezas', label: 'Naturezas' },
        { path: '/tipo-tratamento', label: 'Tipos de Tratamento' },
        { path: '/usuarios', label: 'Usuários' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-[#07233B] shadow-sm w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                <h1 className="text-white text-xl font-bold ml-2 hidden sm:block">
                  INMECAP
                </h1>
              </div>

              <div className="hidden md:flex md:space-x-4 ml-6">
                <button
                  onClick={() => navigate('/')}
                  className="text-white hover:bg-gray-700 px-3 py-2 rounded-md"
                >
                  <Home size={18} />
                </button>

                {simpleLinks.map(item => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.label}
                  </button>
                ))}

                {menuGroups.map(group => (
                  <div className="relative" key={group.key}>
                    <button
                      onClick={() => toggleMenu(group.key)}
                      className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {group.label}
                    </button>
                    {menus[group.key] && (
                      <div className="absolute mt-2 w-56 bg-white rounded-md shadow-lg z-50">
                        {group.items.map(item => (
                          <button
                            key={item.path}
                            onClick={() => {
                              navigate(item.path);
                              setMenus(prev => ({ ...prev, [group.key]: false }));
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"
                  viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <span className="text-white text-sm">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}
              className="block text-white px-3 py-2 rounded-md"
            >
              <Home size={18} className="inline mr-1" /> Home
            </button>

            {simpleLinks.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                className="block text-white px-3 py-2 rounded-md"
              >
                {item.label}
              </button>
            ))}

            {menuGroups.map(group => (
              <div key={group.key}>
                <button
                  onClick={() => toggleMenu(group.key)}
                  className="w-full text-left text-white px-3 py-2 rounded-md flex justify-between items-center"
                >
                  {group.label}
                  <svg className={`h-4 w-4 transform ${menus[group.key] ? 'rotate-180' : ''}`} fill="currentColor"
                    viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.586l3.71-3.354a.75.75 0 111.02 1.1l-4 3.75a.75.75 0 01-1.02 0l-4-3.75a.75.75 0 01.02-1.06z"
                      clipRule="evenodd" />
                  </svg>
                </button>
                {menus[group.key] && (
                  <div className="pl-4">
                    {group.items.map(item => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMenus(prev => ({ ...prev, [group.key]: false }));
                          setIsMobileMenuOpen(false);
                        }}
                        className="block text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="border-t border-gray-700 pt-4">
              <span className="block text-white px-3 py-2">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-white hover:bg-gray-700"
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Conteúdo */}
      <main className="flex-1">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#07233B] text-white py-4 w-full text-center text-sm">
        © {new Date().getFullYear()} INMECAP - Sistema de Gestão
      </footer>
    </div>
  );
};

export default Layout;
