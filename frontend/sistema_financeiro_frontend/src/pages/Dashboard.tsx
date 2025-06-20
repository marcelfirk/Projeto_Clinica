import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { lancamentoService, pacienteService, contratoService, fornecedorService } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalContratos: 0,
    totalFornecedores: 0,
    totalAReceber: 0,
    totalAPagar: 0,
    lancamentosVencidos: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Busca dados em paralelo para melhor performance
        const [pacientes, contratos, fornecedores, lancamentos] = await Promise.all([
          pacienteService.getAll(),
          contratoService.getAll(),
          fornecedorService.getAll(),
          lancamentoService.getAll()
        ]);
        
        // Calcula estatísticas
        const totalAReceber = lancamentos
          .filter((l: any) => l.tipo === 'a_receber' && l.status === 'pendente')
          .reduce((sum: number, l: any) => sum + parseFloat(l.valor), 0);
          
        const totalAPagar = lancamentos
          .filter((l: any) => l.tipo === 'a_pagar' && l.status === 'pendente')
          .reduce((sum: number, l: any) => sum + parseFloat(l.valor), 0);
          
        const hoje = new Date();
        const lancamentosVencidos = lancamentos.filter((l: any) => {
          const dataVencimento = new Date(l.data_vencimento);
          return l.status === 'pendente' && dataVencimento < hoje;
        }).length;
        
        setStats({
          totalPacientes: pacientes.length,
          totalContratos: contratos.length,
          totalFornecedores: fornecedores.length,
          totalAReceber,
          totalAPagar,
          lancamentosVencidos
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout>
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Bem vindo ao sistema de gestão!</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard geral. Vamos validar quais dados seriam interessantes de aparecerem por aqui  </h2>
        
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total de Pacientes */}
              <div 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => navigate('/pacientes')}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total de Pacientes</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{stats.totalPacientes}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Total de Contratos */}
              <div 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => navigate('/contratos')}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total de Contratos</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{stats.totalContratos}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Total de Fornecedores */}
              <div 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => navigate('/fornecedores')}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total de Fornecedores</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{stats.totalFornecedores}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Total a Receber */}
              <div 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => navigate('/lancamentos')}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-600 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total a Receber</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{formatCurrency(stats.totalAReceber)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Total a Pagar */}
              <div 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => navigate('/lancamentos')}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total a Pagar</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{formatCurrency(stats.totalAPagar)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lançamentos Vencidos */}
              <div 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => navigate('/lancamentos')}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Lançamentos Vencidos</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{stats.lancamentosVencidos}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Ações Rápidas</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={() => navigate('/pacientes/novo')}
                  className="bg-white p-4 rounded-lg shadow flex items-center hover:bg-gray-50"
                >
                  <div className="rounded-md bg-blue-50 p-2 mr-4">
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span>Novo Paciente</span>
                </button>
                
                <button
                  onClick={() => navigate('/contratos/novo')}
                  className="bg-white p-4 rounded-lg shadow flex items-center hover:bg-gray-50"
                >
                  <div className="rounded-md bg-green-50 p-2 mr-4">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span>Novo Contrato</span>
                </button>
                
                <button
                  onClick={() => navigate('/lancamentos/novo')}
                  className="bg-white p-4 rounded-lg shadow flex items-center hover:bg-gray-50"
                >
                  <div className="rounded-md bg-indigo-50 p-2 mr-4">
                    <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span>Novo Lançamento</span>
                </button>
                
                <button
                  onClick={() => navigate('/fornecedores/novo')}
                  className="bg-white p-4 rounded-lg shadow flex items-center hover:bg-gray-50"
                >
                  <div className="rounded-md bg-purple-50 p-2 mr-4">
                    <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span>Novo Fornecedor</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
