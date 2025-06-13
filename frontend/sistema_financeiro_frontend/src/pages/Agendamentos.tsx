import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { agendamentoService } from '../services/api';
import { FaEdit, FaCheckCircle, FaTrash } from 'react-icons/fa';


interface Agendamento {
  id: number;
  paciente_id: number;
  paciente_nome: string;
  data_agendamento: string;
  procedimento_id: number;
  procedimento_nome: string;
  grau_calvicie: string;
  equipe_id: number;
  equipe_nome: string,
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
  exames: boolean;
  comunicacao_d7: boolean;
  comunicacao_d2: boolean;
  almoco_escolhido_id: number;
  termo_marcacao: boolean;
  termo_alta: boolean;
  comunicacao_d1: boolean;
  observacoes: string;
  acompanhante: string;
  telefone_acompanhante: string;
  data_cadastro: string;
}

const Agendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<number | null>(null);
  const [selectedServico, setSelectedServico] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      const response = await agendamentoService.getAll();
      setAgendamentos(response);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/agendamentos/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      try {
        await agendamentoService.delete(id);
        fetchAgendamentos();
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        alert('Erro ao deletar agendamento. Verifique o console para mais detalhes.');
      }
    }
  };

  const handleRegistrarServico = (id: number) => {
    setSelectedAgendamento(id);
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
      await agendamentoService.registrarServico(selectedAgendamento, selectedServico);
      
      // Atualiza a lista de agendamentos
      const updatedAgendamentos = await agendamentoService.getAll();
      setAgendamentos(updatedAgendamentos);
      
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao registrar serviço');
      console.error('Erro ao registrar serviço:', err);
    } finally {
      setLoading(false);
    }
  };

  const servicosOptions = [
    { value: 'exames', label: 'Exames' },
    { value: 'termo_marcacao', label: 'Termo de Marcação' },
    { value: 'termo_alta', label: 'Termo de Alta' },
    { value: 'comunicacao_d7', label: 'Comunicação D-7' },
    { value: 'comunicacao_d2', label: 'Comunicação D-2' },
    { value: 'comunicacao_d1', label: 'Comunicação D+1' }
  ];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Agendamentos</h2>
      <button
        onClick={() => navigate('/agendamentos/novo')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Novo Agendamento
      </button>

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
                    {servicosOptions.map((option) => (
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

      <div className="bg-white p-6 rounded shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedimento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grau</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Venda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Pago</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Devedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agendamentos.map((agendamento) => (
              <tr key={agendamento.id}>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.id}</td> 
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.paciente_nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.data_agendamento}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.procedimento_nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.grau_calvicie}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.equipe_nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.local_atendimento_nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.horario_inicio}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.categoria_nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.valor_geral_venda}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.valor_pago}</td>
                <td className="px-6 py-4 whitespace-nowrap">{agendamento.saldo_devedor}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(agendamento.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                    title="Editar"
                  >
                    <FaEdit className="inline mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleRegistrarServico(agendamento.id)}
                    className="text-green-600 hover:text-green-900 mr-2"
                    title="Registrar serviço"
                  >
                    <FaCheckCircle className="inline mr-1" />
                    Registrar
                  </button>
                  <button
                    onClick={() => handleDelete(agendamento.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Deletar"
                  >
                    <FaTrash className="inline mr-1" />
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Agendamentos;


