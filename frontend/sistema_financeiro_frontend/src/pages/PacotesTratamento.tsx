import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { pacoteTratamentoService, tipoTratamentoService, pacienteService } from '../services/api';

const PacotesTratamento: React.FC = () => {
  const navigate = useNavigate();
  const [pacotes, setPacotes] = useState<any[]>([]);
  const [tiposTratamento, setTiposTratamento] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pacotesData, tiposData, pacientesData] = await Promise.all([
          pacoteTratamentoService.getAll(),
          tipoTratamentoService.getAll(),
          pacienteService.getAll()
        ]);
        
        setPacotes(pacotesData);
        setTiposTratamento(tiposData);
        setPacientes(pacientesData);
      } catch (err: any) {
        setError('Erro ao carregar pacotes de tratamento. Por favor, tente novamente.');
        console.error('Erro ao carregar pacotes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este pacote de tratamento?')) {
      try {
        await pacoteTratamentoService.delete(id);
        setPacotes(pacotes.filter(pacote => pacote.id !== id));
      } catch (err: any) {
        setError('Erro ao excluir pacote. Verifique se não há agendamentos ou lançamentos associados.');
        console.error('Erro ao excluir pacote:', err);
      }
    }
  };

  const getPacienteNome = (pacienteId: number) => {
    const paciente = pacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.nome : 'Paciente não encontrado';
  };

  const getTipoTratamentoNome = (tipoId: number) => {
    const tipo = tiposTratamento.find(t => t.id === tipoId);
    return tipo ? tipo.nome : 'Tipo não encontrado';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'concluido':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPacotes = pacotes.filter(pacote => {
    const pacienteNome = getPacienteNome(pacote.paciente_id).toLowerCase();
    const tipoTratamento = getTipoTratamentoNome(pacote.tipo_tratamento_id).toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = (
      pacienteNome.includes(searchTermLower) ||
      tipoTratamento.includes(searchTermLower) ||
      pacote.descricao.toLowerCase().includes(searchTermLower)
    );

    const matchesStatus = filtroStatus === 'todos' || pacote.status_pacote === filtroStatus;

    return matchesSearch && matchesStatus;
  });

  // Lógica de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPacotes = filteredPacotes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPacotes.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Pacotes de Tratamento</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/pacotes-tratamento/pendentes')}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Sessões Pendentes
            </button>
            <button
              onClick={() => navigate('/pacotes-tratamento/novo')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Novo Pacote
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
              placeholder="Buscar por paciente, tipo de tratamento ou descrição..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Carregando pacotes de tratamento...</p>
          </div>
        ) : currentPacotes.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">
              {searchTerm || filtroStatus !== 'todos' ? 'Nenhum pacote encontrado com os critérios de busca.' : 'Nenhum pacote de tratamento cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {currentPacotes.map((pacote) => (
                <li key={pacote.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {pacote.descricao}
                        </p>
                        <p className="text-sm text-gray-500">
                          Paciente: {getPacienteNome(pacote.paciente_id)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tipo: {getTipoTratamentoNome(pacote.tipo_tratamento_id)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/agendamentos-sessao/novo?pacote=${pacote.id}`)}
                          className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-1 px-3 rounded text-sm"
                          disabled={pacote.status_pacote !== 'ativo' || pacote.sessoes_restantes <= 0}
                        >
                          Agendar Sessão
                        </button>
                        <button
                          onClick={() => navigate(`/pacotes-tratamento/${pacote.id}`)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(pacote.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Sessões: {pacote.numero_sessoes_realizadas}/{pacote.numero_sessoes_contratadas}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Valor: {formatCurrency(pacote.valor_total_pacote)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pacote.status_pacote)}`}>
                          {pacote.status_pacote.toUpperCase()}
                        </span>
                        {pacote.sessoes_restantes > 0 && pacote.status_pacote === 'ativo' && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            {pacote.sessoes_restantes} sessões restantes
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${pacote.percentual_concluido}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {pacote.percentual_concluido.toFixed(1)}% concluído
                      </p>
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

export default PacotesTratamento;

