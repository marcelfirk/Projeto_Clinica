import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { contratoService, pacienteService, agendamentoService } from '../services/api';

const Contratos: React.FC = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contratosData, pacientesData, agendamentosData] = await Promise.all([
          contratoService.getAll(),
          pacienteService.getAll(),
          agendamentoService.getAll()
        ]);
        
        setContratos(contratosData);
        setPacientes(pacientesData);
        setAgendamentos(agendamentosData);
      } catch (err: any) {
        setError('Erro ao carregar contratos. Por favor, tente novamente.');
        console.error('Erro ao carregar contratos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await contratoService.delete(id);
        setContratos(contratos.filter(contrato => contrato.id !== id));
      } catch (err: any) {
        setError('Erro ao excluir contrato. Verifique se não há lançamentos associados.');
        console.error('Erro ao excluir contrato:', err);
      }
    }
  };

  const handleGerarContratoClick = (id: number) => {
    setSelectedContrato(id);
    setShowModal(true);
    setModalError('');
  };

  const handleConfirmGerarContrato = async () => {
    if (!selectedContrato) return;
    
    try {
      setModalLoading(true);
      // Chamada para o novo endpoint de geração de contrato
      await contratoService.gerarClicksign(selectedContrato);
      
      // Fecha o modal e mostra mensagem de sucesso
      setShowModal(false);
      setError(''); // Limpa erros anteriores
      alert('Contrato enviado para assinatura no ClickSign com sucesso!');
      
      // Atualiza a lista de contratos se necessário
      // const updatedContratos = await contratoService.getAll();
      // setContratos(updatedContratos);
    } catch (err: any) {
      setModalError(err.response?.data?.msg || 'Erro ao gerar contrato no ClickSign. Por favor, tente novamente.');
      console.error('Erro ao gerar contrato:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const getPacienteNome = (pacienteId: number) => {
    const paciente = pacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.nome : 'Paciente não encontrado';
  };

  const getAgendamentoInfo = (agendamentoId: number) => {
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    if (!agendamento) return 'Nenhum agendamento';
    
    const data = new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR');
    const procedimento = agendamento.procedimento?.nome || 'Procedimento';
    return `${data} - ${procedimento}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const filteredContratos = contratos.filter(contrato => {
    const pacienteNome = getPacienteNome(contrato.paciente_id).toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      pacienteNome.includes(searchTermLower) ||
      contrato.identificador_contrato.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <Layout>
      <div className="py-6">
        {/* Modal de Confirmação */}
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
                    Confirma geração de contrato no ClickSign?
                  </h3>
                  {modalError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {modalError}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleConfirmGerarContrato}
                    disabled={modalLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {modalLoading ? 'Processando...' : 'Sim'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={modalLoading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Não
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Contratos</h1>
          <button
            onClick={() => navigate('/contratos/novo')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Novo Contrato
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por paciente ou identificador..."
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Carregando contratos...</p>
          </div>
        ) : filteredContratos.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum contrato encontrado com os critérios de busca.' : 'Nenhum contrato cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredContratos.map((contrato) => (
                <li key={contrato.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {contrato.identificador_contrato}
                        </p>
                        <p className="text-sm text-gray-500">
                          Paciente: {getPacienteNome(contrato.paciente_id)}
                        </p>
                        {contrato.agendamento_cirurgico_id && (
                          <p className="text-sm text-gray-500">
                            Agendamento: {getAgendamentoInfo(contrato.agendamento_cirurgico_id)}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/contratos/${contrato.id}`)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleGerarContratoClick(contrato.id)}
                          className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-1 px-3 rounded text-sm"
                        >
                          Gerar Contrato
                        </button>
                        <button
                          onClick={() => handleDelete(contrato.id)}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Sinal: {formatCurrency(contrato.valor_sinal)}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Restante: {formatCurrency(contrato.valor_restante)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contrato.status === 'ativo' ? 'bg-green-100 text-green-800' : 
                          contrato.status === 'cancelado' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {contrato.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contratos;