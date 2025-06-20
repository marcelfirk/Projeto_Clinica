import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { agendamentoCirurgicoService, agendamentoSessaoService } from '../services/api';
import { FaEdit, FaCheckCircle, FaTrash, FaCalendarAlt, FaUserMd, FaClock } from 'react-icons/fa';

interface AgendamentoCirurgico {
  id: number;
  paciente_id: number;
  paciente_nome: string;
  data_agendamento: string;
  procedimento_id: number;
  procedimento_nome: string;
  grau_calvicie: string;
  equipe_id: number;
  equipe_nome: string;
  local_atendimento_id: number;
  local_atendimento_nome: string;
  horario_inicio: string;
  categoria_id: number;
  categoria_nome: string;
  valor_geral_venda: number;
  valor_pago: number;
  saldo_devedor: number;
  forma_pagamento: string;
  contrato_id: number;
  contrato_assinado: boolean;
  status_cirurgia: string;
  observacoes: string;
  acompanhante: string;
  telefone_acompanhante: string;
  data_criacao: string;
}

interface AgendamentoSessao {
  id: number;
  paciente_id: number;
  paciente_nome: string;
  pacote_tratamento_id: number;
  pacote_descricao: string;
  tipo_tratamento_nome: string;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  local_atendimento_id: number;
  local_atendimento_nome: string;
  profissional_id: number;
  status_sessao: string;
  numero_sessao: number;
  observacoes: string;
  data_criacao: string;
}

const AgendamentosUnificados: React.FC = () => {
  const [agendamentosCirurgicos, setAgendamentosCirurgicos] = useState<AgendamentoCirurgico[]>([]);
  const [agendamentosSessao, setAgendamentosSessao] = useState<AgendamentoSessao[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<{id: number, tipo: 'cirurgico' | 'sessao'} | null>(null);
  const [selectedServico, setSelectedServico] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // todos, cirurgicos, sessoes
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      const [cirurgicosData, sessoesData] = await Promise.all([
        agendamentoCirurgicoService.getAll(),
        agendamentoSessaoService.getAll()
      ]);
      
      setAgendamentosCirurgicos(cirurgicosData);
      setAgendamentosSessao(sessoesData);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number, tipo: 'cirurgico' | 'sessao') => {
    if (tipo === 'cirurgico') {
      navigate(`/agendamentos-cirurgicos/${id}`);
    } else {
      navigate(`/agendamentos-sessao/${id}`);
    }
  };

  const handleDelete = async (id: number, tipo: 'cirurgico' | 'sessao') => {
    if (window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      try {
        if (tipo === 'cirurgico') {
          await agendamentoCirurgicoService.delete(id);
        } else {
          await agendamentoSessaoService.delete(id);
        }
        fetchAgendamentos();
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        alert('Erro ao deletar agendamento. Verifique o console para mais detalhes.');
      }
    }
  };

  const handleRegistrarServico = (id: number, tipo: 'cirurgico' | 'sessao') => {
    setSelectedAgendamento({id, tipo});
    setShowModal(true);
    setSelectedServico('');
    setError('');
  };

  const handleConfirmServico = async () => {
    if (!selectedAgendamento || !selectedServico) {
      setError('Selecione um serviço para registrar');
      return;
    }

    try {
      setLoading(true);
      if (selectedAgendamento.tipo === 'cirurgico') {
        await agendamentoCirurgicoService.registrarServico(selectedAgendamento.id, selectedServico);
      } else {
        // Para sessões, pode ser marcar como realizada ou outro serviço específico
        if (selectedServico === 'marcar_realizada') {
          await agendamentoSessaoService.marcarRealizada(selectedAgendamento.id);
        }
      }
      
      fetchAgendamentos();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao registrar serviço');
      console.error('Erro ao registrar serviço:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
      case 'agendado':
        return 'bg-blue-100 text-blue-800';
      case 'realizada':
      case 'realizado':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'remarcada':
      case 'remarcado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const servicosOptions = [
    { value: 'exames', label: 'Exames' },
    { value: 'termo_marcacao', label: 'Termo de Marcação' },
    { value: 'termo_alta', label: 'Termo de Alta' },
    { value: 'comunicacao_d7', label: 'Comunicação D-7' },
    { value: 'comunicacao_d2', label: 'Comunicação D-2' },
    { value: 'comunicacao_d1', label: 'Comunicação D+1' },
    { value: 'marcar_realizada', label: 'Marcar como Realizada' }
  ];

  // Combina e filtra agendamentos
  const agendamentosUnificados = [
    ...agendamentosCirurgicos.map(ag => ({
      ...ag,
      tipo: 'cirurgico' as const,
      tipo_display: 'Cirurgia',
      procedimento_display: ag.procedimento_nome,
      status_display: ag.status_cirurgia,
      valor_display: ag.valor_geral_venda
    })),
    ...agendamentosSessao.map(ag => ({
      ...ag,
      tipo: 'sessao' as const,
      tipo_display: 'Sessão',
      procedimento_display: `${ag.tipo_tratamento_nome} (${ag.numero_sessao}ª sessão)`,
      status_display: ag.status_sessao,
      valor_display: null
    }))
  ].filter(ag => {
    // Filtro por tipo
    if (filtroTipo === 'cirurgicos' && ag.tipo !== 'cirurgico') return false;
    if (filtroTipo === 'sessoes' && ag.tipo !== 'sessao') return false;
    
    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        ag.paciente_nome.toLowerCase().includes(searchLower) ||
        ag.procedimento_display.toLowerCase().includes(searchLower) ||
        ag.local_atendimento_nome.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }).sort((a, b) => {
    // Ordena por data de agendamento (mais recente primeiro)
    return new Date(b.data_agendamento).getTime() - new Date(a.data_agendamento).getTime();
  });

  // Lógica de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgendamentos = agendamentosUnificados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(agendamentosUnificados.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Agendamentos</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/agendamentos-cirurgicos/novo')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Nova Cirurgia
            </button>
            <button
              onClick={() => navigate('/agendamentos-sessao/novo')}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Nova Sessão
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4 flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por paciente, procedimento ou local..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos os Tipos</option>
              <option value="cirurgicos">Cirurgias</option>
              <option value="sessoes">Sessões</option>
            </select>
          </div>
        </div>

        {/* Modal de Registro de Serviço */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Registrar Serviço
                  </h3>
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Selecione o serviço:
                    </label>
                    <select
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={selectedServico}
                      onChange={(e) => setSelectedServico(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Selecione...</option>
                      {servicosOptions
                        .filter(option => {
                          // Filtra opções baseado no tipo de agendamento
                          if (selectedAgendamento?.tipo === 'sessao') {
                            return ['marcar_realizada'].includes(option.value);
                          }
                          return !['marcar_realizada'].includes(option.value);
                        })
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleConfirmServico}
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {loading ? 'Registrando...' : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Carregando agendamentos...</p>
          </div>
        ) : currentAgendamentos.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">
              {searchTerm || filtroTipo !== 'todos' ? 'Nenhum agendamento encontrado com os critérios de busca.' : 'Nenhum agendamento cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {currentAgendamentos.map((agendamento) => (
                <li key={`${agendamento.tipo}-${agendamento.id}`}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            agendamento.tipo === 'cirurgico' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {agendamento.tipo_display}
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            {agendamento.paciente_nome}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {agendamento.procedimento_display}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            {formatDate(agendamento.data_agendamento)}
                          </span>
                          <span className="flex items-center">
                            <FaClock className="mr-1" />
                            {agendamento.horario_inicio}
                          </span>
                          <span>
                            {agendamento.local_atendimento_nome}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(agendamento.id, agendamento.tipo)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                          title="Editar"
                        >
                          <FaEdit className="inline mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleRegistrarServico(agendamento.id, agendamento.tipo)}
                          className="text-green-600 hover:text-green-900 mr-2"
                          title="Registrar serviço"
                        >
                          <FaCheckCircle className="inline mr-1" />
                          Registrar
                        </button>
                        <button
                          onClick={() => handleDelete(agendamento.id, agendamento.tipo)}
                          className="text-red-600 hover:text-red-900"
                          title="Deletar"
                        >
                          <FaTrash className="inline mr-1" />
                          Deletar
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {agendamento.valor_display && (
                          <span className="text-sm text-gray-500">
                            Valor: R$ {agendamento.valor_display.toFixed(2)}
                          </span>
                        )}
                        {agendamento.tipo === 'sessao' && (
                          <span className="text-sm text-gray-500">
                            Pacote: {(agendamento as any).pacote_descricao}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agendamento.status_display)}`}>
                        {agendamento.status_display.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50"
            >
              Anterior
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`py-2 px-4 font-bold rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AgendamentosUnificados;

