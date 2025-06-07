import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { contratoService, pacienteService } from '../services/api';

const ContratoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    paciente_id: '',
    procedimento: '',
    data_procedimento: '',
    local_realizacao: '',
    valor_total: '',
    status: 'ativo'
  });
  
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Busca lista de pacientes
        const pacientesData = await pacienteService.getAll();
        setPacientes(pacientesData);
        
        // Se estiver editando, busca dados do contrato
        if (isEditing) {
          const contratoData = await contratoService.getById(Number(id));
          
          // Formata a data para o formato esperado pelo input type="date"
          const dataProcedimento = contratoData.data_procedimento ? contratoData.data_procedimento.split('T')[0] : '';
          
          setFormData({
            paciente_id: contratoData.paciente_id.toString(),
            procedimento: contratoData.procedimento,
            data_procedimento: dataProcedimento,
            local_realizacao: contratoData.local_realizacao,
            valor_total: contratoData.valor_total.toString(),
            status: contratoData.status
          });
        }
      } catch (err: any) {
        setError('Erro ao carregar dados. Por favor, tente novamente.');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        paciente_id: Number(formData.paciente_id),
        valor_total: Number(formData.valor_total)
      };
      
      if (isEditing) {
        await contratoService.update(Number(id), dataToSubmit);
      } else {
        await contratoService.create(dataToSubmit);
      }
      navigate('/contratos');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao salvar contrato. Verifique os dados e tente novamente.');
      console.error('Erro ao salvar contrato:', err);
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
            {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
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
                <select
                  id="paciente_id"
                  name="paciente_id"
                  required
                  value={formData.paciente_id}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Selecione um paciente</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome} - {paciente.cpf}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="procedimento" className="block text-sm font-medium text-gray-700">
                  Procedimento *
                </label>
                <input
                  type="text"
                  name="procedimento"
                  id="procedimento"
                  required
                  value={formData.procedimento}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="data_procedimento" className="block text-sm font-medium text-gray-700">
                  Data do Procedimento *
                </label>
                <input
                  type="date"
                  name="data_procedimento"
                  id="data_procedimento"
                  required
                  value={formData.data_procedimento}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="local_realizacao" className="block text-sm font-medium text-gray-700">
                  Local de Realização *
                </label>
                <input
                  type="text"
                  name="local_realizacao"
                  id="local_realizacao"
                  required
                  value={formData.local_realizacao}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="valor_total" className="block text-sm font-medium text-gray-700">
                  Valor Total (R$) *
                </label>
                <input
                  type="number"
                  name="valor_total"
                  id="valor_total"
                  required
                  step="0.01"
                  min="0"
                  value={formData.valor_total}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="ativo">Ativo</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/contratos')}
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

export default ContratoForm;
