import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { pacoteTratamentoService, tipoTratamentoService, pacienteService } from '../services/api';
import Select from 'react-select';

const PacoteTratamentoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    paciente_id: '',
    tipo_tratamento_id: '',
    descricao: '',
    data_inicio_tratamento: '',
    numero_sessoes_contratadas: '',
    valor_total_pacote: '',
    status_pacote: 'ativo',
    observacoes: ''
  });
  
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [tiposTratamento, setTiposTratamento] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showLancamentoModal, setShowLancamentoModal] = useState(false);
  const [pacoteSalvo, setPacoteSalvo] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Busca lista de pacientes e tipos de tratamento
        const [pacientesData, tiposData] = await Promise.all([
          pacienteService.getAll(),
          tipoTratamentoService.getAll()
        ]);
        
        setPacientes(pacientesData);
        setTiposTratamento(tiposData);
        
        // Se estiver editando, busca dados do pacote
        if (isEditing) {
          const pacoteData = await pacoteTratamentoService.getById(Number(id));
          
          setFormData({
            paciente_id: pacoteData.paciente_id.toString(),
            tipo_tratamento_id: pacoteData.tipo_tratamento_id.toString(),
            descricao: pacoteData.descricao,
            data_inicio_tratamento: pacoteData.data_inicio_tratamento,
            numero_sessoes_contratadas: pacoteData.numero_sessoes_contratadas.toString(),
            valor_total_pacote: pacoteData.valor_total_pacote.toString(),
            status_pacote: pacoteData.status_pacote,
            observacoes: pacoteData.observacoes || ''
          });
        } else {
          // Se não estiver editando, verifica se há parâmetros da URL
          const pacienteIdParam = searchParams.get('paciente_id');
          const tipoTratamentoParam = searchParams.get('tipo_tratamento');
          
          if (pacienteIdParam) {
            setFormData(prev => ({ ...prev, paciente_id: pacienteIdParam }));
          }
          if (tipoTratamentoParam) {
            setFormData(prev => ({ ...prev, tipo_tratamento_id: tipoTratamentoParam }));
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTipoTratamentoChange = (selectedOption: any) => {
    const tipoId = selectedOption?.value || '';
    setFormData(prev => ({ ...prev, tipo_tratamento_id: tipoId }));
    
    // Auto-preenche a descrição baseada no tipo selecionado
    if (selectedOption && !isEditing) {
      const pacienteNome = pacientes.find(p => p.id === Number(formData.paciente_id))?.nome || '';
      const descricaoAuto = `Pacote ${formData.numero_sessoes_contratadas || 'X'} Sessões de ${selectedOption.label}${pacienteNome ? ` - ${pacienteNome}` : ''}`;
      setFormData(prev => ({ ...prev, descricao: descricaoAuto }));
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
        tipo_tratamento_id: Number(formData.tipo_tratamento_id),
        numero_sessoes_contratadas: Number(formData.numero_sessoes_contratadas),
        valor_total_pacote: Number(formData.valor_total_pacote)
      };
      
      let pacoteCriado;
      if (isEditing) {
        await pacoteTratamentoService.update(Number(id), dataToSubmit);
        navigate('/pacotes-tratamento');
      } else {
        const response = await pacoteTratamentoService.create(dataToSubmit);
        pacoteCriado = response.pacote_tratamento;
        
        // Se não está editando, mostra o modal para pergunta sobre lançamento
        setPacoteSalvo(pacoteCriado);
        setShowLancamentoModal(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao salvar pacote de tratamento. Verifique os dados e tente novamente.');
      console.error('Erro ao salvar pacote:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCriarLancamento = () => {
    const dataAtual = new Date().toISOString().split('T')[0];
    
    // Navega para o formulário de lançamentos com parâmetros na URL
    const params = new URLSearchParams({
      tipo: 'a_receber',
      pacote_tratamento_id: pacoteSalvo.id.toString(),
      valor: formData.valor_total_pacote,
      data_vencimento: dataAtual,
      observacoes: `Lançamento referente ao pacote de tratamento - ${formData.descricao}`.trim()
    });
    
    navigate(`/lancamentos/novo?${params.toString()}`);
  };

  const handlePularLancamento = () => {
    navigate('/pacotes-tratamento');
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
            {isEditing ? 'Editar Pacote de Tratamento' : 'Novo Pacote de Tratamento'}
          </h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
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
                  onChange={(selectedOption) =>
                    handleSelectChange('paciente_id', selectedOption?.value.toString() || '')
                  }
                  className="mt-1"
                  placeholder="Selecione o paciente..."
                  isClearable
                  required
                />
              </div>
              
              <div>
                <label htmlFor="tipo_tratamento_id" className="block text-sm font-medium text-gray-700">
                  Tipo de Tratamento *
                </label>
                <Select
                  id="tipo_tratamento_id"
                  name="tipo_tratamento_id"
                  options={tiposTratamento.map(t => ({
                    value: t.id,
                    label: t.nome
                  }))}
                  value={tiposTratamento
                    .map(t => ({ value: t.id, label: t.nome }))
                    .find(opt => opt.value === Number(formData.tipo_tratamento_id))}
                  onChange={handleTipoTratamentoChange}
                  className="mt-1"
                  placeholder="Selecione o tipo de tratamento..."
                  isClearable
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                  Descrição do Pacote *
                </label>
                <input
                  type="text"
                  name="descricao"
                  id="descricao"
                  required
                  value={formData.descricao}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Ex: Pacote 6 Sessões de Mesoterapia Capilar"
                />
              </div>
              
              <div>
                <label htmlFor="data_inicio_tratamento" className="block text-sm font-medium text-gray-700">
                  Data de Início do Tratamento *
                </label>
                <input
                  type="date"
                  name="data_inicio_tratamento"
                  id="data_inicio_tratamento"
                  required
                  value={formData.data_inicio_tratamento}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="numero_sessoes_contratadas" className="block text-sm font-medium text-gray-700">
                  Número de Sessões Contratadas *
                </label>
                <input
                  type="number"
                  name="numero_sessoes_contratadas"
                  id="numero_sessoes_contratadas"
                  required
                  min="1"
                  value={formData.numero_sessoes_contratadas}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="valor_total_pacote" className="block text-sm font-medium text-gray-700">
                  Valor Total do Pacote (R$) *
                </label>
                <input
                  type="number"
                  name="valor_total_pacote"
                  id="valor_total_pacote"
                  required
                  step="0.01"
                  min="0"
                  value={formData.valor_total_pacote}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="status_pacote" className="block text-sm font-medium text-gray-700">
                  Status do Pacote *
                </label>
                <select
                  id="status_pacote"
                  name="status_pacote"
                  required
                  value={formData.status_pacote}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="ativo">Ativo</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
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
                onClick={() => navigate('/pacotes-tratamento')}
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

        {/* Modal para pergunta sobre lançamento financeiro */}
        {showLancamentoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h2 className="text-lg font-bold mb-4">Pacote de Tratamento Salvo!</h2>
              <p className="mb-4">
                Deseja criar um lançamento financeiro correspondente a este pacote de tratamento?
              </p>
              <div className="bg-gray-100 p-3 rounded mb-4">
                <p><strong>Paciente:</strong> {pacientes.find(p => p.id == formData.paciente_id)?.nome}</p>
                <p><strong>Valor Total:</strong> R$ {Number(formData.valor_total_pacote).toFixed(2)}</p>
                <p><strong>Descrição:</strong> {formData.descricao}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCriarLancamento}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1"
                >
                  Sim, criar lançamento
                </button>
                <button
                  onClick={handlePularLancamento}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex-1"
                >
                  Não, pular
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PacoteTratamentoForm;

