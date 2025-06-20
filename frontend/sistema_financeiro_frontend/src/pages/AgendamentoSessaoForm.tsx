import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { agendamentoSessaoService, pacoteTratamentoService, pacienteService, localAtendimentoService } from '../services/api';
import Select from 'react-select';

const AgendamentoSessaoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    paciente_id: '',
    pacote_tratamento_id: '',
    data_agendamento: '',
    horario_inicio: '',
    horario_fim: '',
    local_atendimento_id: '',
    profissional_id: '',
    status_sessao: 'agendada',
    observacoes: ''
  });
  
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [pacotesTratamento, setPacotesTratamento] = useState<any[]>([]);
  const [locaisAtendimento, setLocaisAtendimento] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pacoteSelecionado, setPacoteSelecionado] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Busca dados básicos
        const [pacientesData, locaisData] = await Promise.all([
          pacienteService.getAll(),
          localAtendimentoService.getAll()
        ]);
        
        setPacientes(pacientesData);
        setLocaisAtendimento(locaisData);
        
        // Se estiver editando, busca dados do agendamento
        if (isEditing) {
          const agendamentoData = await agendamentoSessaoService.getById(Number(id));
          
          setFormData({
            paciente_id: agendamentoData.paciente_id.toString(),
            pacote_tratamento_id: agendamentoData.pacote_tratamento_id.toString(),
            data_agendamento: agendamentoData.data_agendamento,
            horario_inicio: agendamentoData.horario_inicio,
            horario_fim: agendamentoData.horario_fim || '',
            local_atendimento_id: agendamentoData.local_atendimento_id.toString(),
            profissional_id: agendamentoData.profissional_id?.toString() || '',
            status_sessao: agendamentoData.status_sessao,
            observacoes: agendamentoData.observacoes || ''
          });
          
          // Busca pacotes do paciente
          const pacotesData = await pacoteTratamentoService.getByPaciente(agendamentoData.paciente_id);
          setPacotesTratamento(pacotesData);
          
          // Define o pacote selecionado
          const pacote = pacotesData.find((p: any) => p.id === agendamentoData.pacote_tratamento_id);
          setPacoteSelecionado(pacote);
        } else {
          // Se não estiver editando, verifica parâmetros da URL
          const pacoteParam = searchParams.get('pacote');
          const pacienteParam = searchParams.get('paciente');
          
          if (pacoteParam) {
            // Busca dados do pacote específico
            const pacoteData = await pacoteTratamentoService.getById(Number(pacoteParam));
            setPacoteSelecionado(pacoteData);
            
            setFormData(prev => ({
              ...prev,
              paciente_id: pacoteData.paciente_id.toString(),
              pacote_tratamento_id: pacoteParam
            }));
            
            // Busca pacotes do paciente
            const pacotesData = await pacoteTratamentoService.getByPaciente(pacoteData.paciente_id);
            setPacotesTratamento(pacotesData);
          } else if (pacienteParam) {
            setFormData(prev => ({ ...prev, paciente_id: pacienteParam }));
            
            // Busca pacotes do paciente
            const pacotesData = await pacoteTratamentoService.getByPaciente(Number(pacienteParam));
            setPacotesTratamento(pacotesData);
          }
        }
      } catch (err: any) {
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing, searchParams]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePacienteChange = async (selectedOption: any) => {
    const pacienteId = selectedOption?.value || '';
    setFormData(prev => ({ 
      ...prev, 
      paciente_id: pacienteId,
      pacote_tratamento_id: '' // Reset pacote quando muda paciente
    }));
    setPacoteSelecionado(null);
    
    if (pacienteId) {
      try {
        // Busca pacotes do paciente selecionado
        const pacotesData = await pacoteTratamentoService.getByPaciente(Number(pacienteId));
        setPacotesTratamento(pacotesData.filter((p: any) => p.status_pacote === 'ativo' && p.sessoes_restantes > 0));
      } catch (err) {
        console.error('Erro ao buscar pacotes do paciente:', err);
        setPacotesTratamento([]);
      }
    } else {
      setPacotesTratamento([]);
    }
  };

  const handlePacoteChange = (selectedOption: any) => {
    const pacoteId = selectedOption?.value || '';
    setFormData(prev => ({ ...prev, pacote_tratamento_id: pacoteId }));
    
    if (pacoteId) {
      const pacote = pacotesTratamento.find((p: any) => p.id === Number(pacoteId));
      setPacoteSelecionado(pacote);
    } else {
      setPacoteSelecionado(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        paciente_id: Number(formData.paciente_id),
        pacote_tratamento_id: Number(formData.pacote_tratamento_id),
        local_atendimento_id: Number(formData.local_atendimento_id),
        profissional_id: formData.profissional_id ? Number(formData.profissional_id) : null
      };
      
      if (isEditing) {
        await agendamentoSessaoService.update(Number(id), dataToSubmit);
      } else {
        await agendamentoSessaoService.create(dataToSubmit);
      }
      
      navigate('/agendamentos');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao salvar agendamento de sessão. Verifique os dados e tente novamente.');
      console.error('Erro ao salvar agendamento:', err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="text-center py-10">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Editar Agendamento de Sessão' : 'Novo Agendamento de Sessão'}
          </h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {pacoteSelecionado && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Informações do Pacote</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Descrição:</span>
                <p className="text-blue-700">{pacoteSelecionado.descricao}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Sessões:</span>
                <p className="text-blue-700">
                  {pacoteSelecionado.numero_sessoes_realizadas}/{pacoteSelecionado.numero_sessoes_contratadas}
                  {pacoteSelecionado.sessoes_restantes > 0 && (
                    <span className="text-green-600 ml-2">
                      ({pacoteSelecionado.sessoes_restantes} restantes)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Tipo:</span>
                <p className="text-blue-700">{pacoteSelecionado.tipo_tratamento_nome}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="paciente_id" className="block text-sm font-medium text-gray-700">
                  Paciente *
                </label>
                <Select
                  id="paciente_id"
                  name="paciente_id"
                  options={pacientes.map(p => ({
                    value: p.id,
                    label: `${p.nome} - ${p.cpf}`
                  }))}
                  value={pacientes
                    .map(p => ({ value: p.id, label: `${p.nome} - ${p.cpf}` }))
                    .find(opt => opt.value === Number(formData.paciente_id))}
                  onChange={handlePacienteChange}
                  className="mt-1"
                  placeholder="Selecione o paciente..."
                  isClearable
                  required
                  isDisabled={isEditing} // Não permite alterar paciente na edição
                />
              </div>
              
              <div>
                <label htmlFor="pacote_tratamento_id" className="block text-sm font-medium text-gray-700">
                  Pacote de Tratamento *
                </label>
                <Select
                  id="pacote_tratamento_id"
                  name="pacote_tratamento_id"
                  options={pacotesTratamento.map(p => ({
                    value: p.id,
                    label: `${p.descricao} (${p.sessoes_restantes} sessões restantes)`
                  }))}
                  value={pacotesTratamento
                    .map(p => ({ value: p.id, label: `${p.descricao} (${p.sessoes_restantes} sessões restantes)` }))
                    .find(opt => opt.value === Number(formData.pacote_tratamento_id))}
                  onChange={handlePacoteChange}
                  className="mt-1"
                  placeholder="Selecione o pacote de tratamento..."
                  isClearable
                  required
                  isDisabled={!formData.paciente_id || isEditing} // Só habilita se paciente selecionado
                />
              </div>
              
              <div>
                <label htmlFor="data_agendamento" className="block text-sm font-medium text-gray-700">
                  Data do Agendamento *
                </label>
                <input
                  type="date"
                  name="data_agendamento"
                  id="data_agendamento"
                  required
                  value={formData.data_agendamento}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="horario_inicio" className="block text-sm font-medium text-gray-700">
                  Horário de Início *
                </label>
                <input
                  type="time"
                  name="horario_inicio"
                  id="horario_inicio"
                  required
                  value={formData.horario_inicio}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="horario_fim" className="block text-sm font-medium text-gray-700">
                  Horário de Fim
                </label>
                <input
                  type="time"
                  name="horario_fim"
                  id="horario_fim"
                  value={formData.horario_fim}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="local_atendimento_id" className="block text-sm font-medium text-gray-700">
                  Local de Atendimento *
                </label>
                <select
                  id="local_atendimento_id"
                  name="local_atendimento_id"
                  required
                  value={formData.local_atendimento_id}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Selecione o local...</option>
                  {locaisAtendimento.map((local) => (
                    <option key={local.id} value={local.id}>
                      {local.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status_sessao" className="block text-sm font-medium text-gray-700">
                  Status da Sessão *
                </label>
                <select
                  id="status_sessao"
                  name="status_sessao"
                  required
                  value={formData.status_sessao}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="remarcada">Remarcada</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  id="observacoes"
                  rows={3}
                  value={formData.observacoes}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/agendamentos')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-500 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AgendamentoSessaoForm;

