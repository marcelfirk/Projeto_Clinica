import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { lancamentoService, contratoService, fornecedorService, naturezaService, pacoteTratamentoService } from '../services/api';
import Select from 'react-select';

const LancamentoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    tipo: 'a_receber',
    contrato_id: '',
    pacote_tratamento_id: '', // NOVO CAMPO
    fornecedor_id: '',
    natureza_id: '',
    data_vencimento: '',
    data_pagamento: '',
    valor: '',
    status: 'pendente',
    numero_nota_fiscal: '',
    forma_pagamento: '',
    observacoes: ''
  });
  
  const [contratos, setContratos] = useState<any[]>([]);
  const [pacotesTratamento, setPacotesTratamento] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [naturezas, setNaturezas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preenchidoAutomaticamente, setPreenchidoAutomaticamente] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Busca listas de contratos, pacotes, fornecedores e naturezas
        const [contratosData, pacotesData, fornecedoresData, naturezasData] = await Promise.all([
          contratoService.getAll(),
          pacoteTratamentoService.getAll(),
          fornecedorService.getAll(),
          naturezaService.getAll()
        ]);

        setContratos(contratosData);
        setPacotesTratamento(pacotesData);
        setFornecedores(fornecedoresData);
        setNaturezas(naturezasData);
        
        // Se estiver editando, busca dados do lançamento
        if (isEditing) {
          const lancamentoData = await lancamentoService.getById(Number(id));
          
          setFormData({
            tipo: lancamentoData.tipo,
            contrato_id: lancamentoData.contrato_id?.toString() || '',
            pacote_tratamento_id: lancamentoData.pacote_tratamento_id?.toString() || '',
            fornecedor_id: lancamentoData.fornecedor_id?.toString() || '',
            natureza_id: lancamentoData.natureza_id?.toString() || '',
            data_vencimento: lancamentoData.data_vencimento,
            data_pagamento: lancamentoData.data_pagamento || '',
            valor: lancamentoData.valor.toString(),
            status: lancamentoData.status,
            numero_nota_fiscal: lancamentoData.numero_nota_fiscal || '',
            forma_pagamento: lancamentoData.forma_pagamento || '',
            observacoes: lancamentoData.observacoes || ''
          });
        } else {
          // Se não estiver editando, verifica parâmetros da URL para pré-preenchimento
          const tipoParam = searchParams.get('tipo');
          const contratoIdParam = searchParams.get('contrato_id');
          const pacoteTratamentoIdParam = searchParams.get('pacote_tratamento_id');
          const fornecedorIdParam = searchParams.get('fornecedor_id');
          const valorParam = searchParams.get('valor');
          const dataVencimentoParam = searchParams.get('data_vencimento');
          const observacoesParam = searchParams.get('observacoes');
          
          if (tipoParam || contratoIdParam || pacoteTratamentoIdParam || fornecedorIdParam) {
            setPreenchidoAutomaticamente(true);
            
            setFormData(prev => ({
              ...prev,
              tipo: tipoParam || prev.tipo,
              contrato_id: contratoIdParam || '',
              pacote_tratamento_id: pacoteTratamentoIdParam || '',
              fornecedor_id: fornecedorIdParam || '',
              valor: valorParam || '',
              data_vencimento: dataVencimentoParam || '',
              observacoes: observacoesParam || ''
            }));
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

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoTipo = e.target.value;
    setFormData(prev => ({
      ...prev,
      tipo: novoTipo,
      // Reset campos relacionados quando muda o tipo
      contrato_id: '',
      pacote_tratamento_id: '',
      fornecedor_id: ''
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        contrato_id: formData.contrato_id ? Number(formData.contrato_id) : null,
        pacote_tratamento_id: formData.pacote_tratamento_id ? Number(formData.pacote_tratamento_id) : null,
        fornecedor_id: formData.fornecedor_id ? Number(formData.fornecedor_id) : null,
        natureza_id: Number(formData.natureza_id),
        valor: Number(formData.valor)
      };
      
      if (isEditing) {
        await lancamentoService.update(Number(id), dataToSubmit);
      } else {
        await lancamentoService.create(dataToSubmit);
      }
      
      navigate('/lancamentos');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao salvar lançamento financeiro. Verifique os dados e tente novamente.');
      console.error('Erro ao salvar lançamento:', err);
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
            {isEditing ? 'Editar Lançamento Financeiro' : 'Novo Lançamento Financeiro'}
          </h1>
        </div>
        
        {preenchidoAutomaticamente && !isEditing && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  Os campos foram pré-preenchidos automaticamente. Você pode ajustar os valores antes de salvar.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  value={formData.tipo}
                  onChange={handleTipoChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="a_receber">A Receber</option>
                  <option value="a_pagar">A Pagar</option>
                </select>
              </div>
              
              {/* Campo Contrato - só aparece para "a_receber" */}
              {formData.tipo === 'a_receber' && (
                <div>
                  <label htmlFor="contrato_id" className="block text-sm font-medium text-gray-700">
                    Contrato (para Transplantes)
                  </label>
                  <Select
                    id="contrato_id"
                    name="contrato_id"
                    options={contratos.map(c => ({
                      value: c.id,
                      label: `${c.identificador_contrato} - ${c.paciente_nome}`
                    }))}
                    value={contratos
                      .map(c => ({ value: c.id, label: `${c.identificador_contrato} - ${c.paciente_nome}` }))
                      .find(opt => opt.value === Number(formData.contrato_id))}
                    onChange={(selectedOption) =>
                      handleSelectChange('contrato_id', selectedOption?.value.toString() || '')
                    }
                    className="mt-1"
                    placeholder="Selecione o contrato..."
                    isClearable
                    isDisabled={!!formData.pacote_tratamento_id} // Desabilita se pacote selecionado
                  />
                  {formData.pacote_tratamento_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Desabilitado porque um pacote de tratamento foi selecionado
                    </p>
                  )}
                </div>
              )}

              {/* Campo Pacote de Tratamento - só aparece para "a_receber" */}
              {formData.tipo === 'a_receber' && (
                <div>
                  <label htmlFor="pacote_tratamento_id" className="block text-sm font-medium text-gray-700">
                    Pacote de Tratamento (para Terapias)
                  </label>
                  <Select
                    id="pacote_tratamento_id"
                    name="pacote_tratamento_id"
                    options={pacotesTratamento.map(p => ({
                      value: p.id,
                      label: `${p.descricao} - ${p.paciente_nome}`
                    }))}
                    value={
                      formData.pacote_tratamento_id
                        ? pacotesTratamento
                            .map(p => ({ value: p.id, label: `${p.descricao} - ${p.paciente_nome}` }))
                            .find(opt => opt.value === Number(formData.pacote_tratamento_id)) || null
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange('pacote_tratamento_id', selectedOption?.value.toString() || '')
                    }
                    className="mt-1"
                    placeholder="Selecione o pacote de tratamento..."
                    isClearable
                    isDisabled={!!formData.contrato_id} // Desabilita se contrato selecionado
                  />
                  {formData.contrato_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Desabilitado porque um contrato foi selecionado
                    </p>
                  )}
                </div>
              )}
              
              {/* Campo Fornecedor - só aparece para "a_pagar" */}
              {formData.tipo === 'a_pagar' && (
                <div>
                  <label htmlFor="fornecedor_id" className="block text-sm font-medium text-gray-700">
                    Fornecedor *
                  </label>
                  <Select
                    id="fornecedor_id"
                    name="fornecedor_id"
                    options={fornecedores.map(f => ({
                      value: f.id,
                      label: `${f.nome} - ${f.cnpj || f.cpf}`
                    }))}
                    value={fornecedores
                      .map(f => ({ value: f.id, label: `${f.nome} - ${f.cnpj || f.cpf}` }))
                      .find(opt => opt.value === Number(formData.fornecedor_id))}
                    onChange={(selectedOption) =>
                      handleSelectChange('fornecedor_id', selectedOption?.value.toString() || '')
                    }
                    className="mt-1"
                    placeholder="Selecione o fornecedor..."
                    isClearable
                    required={formData.tipo === 'a_pagar'}
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="natureza_id" className="block text-sm font-medium text-gray-700">
                  Natureza Orçamentária *
                </label>
                <select
                  id="natureza_id"
                  name="natureza_id"
                  required
                  value={formData.natureza_id}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Selecione a natureza...</option>
                  {naturezas.map((natureza) => (
                    <option key={natureza.id} value={natureza.id}>
                      {natureza.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="data_vencimento" className="block text-sm font-medium text-gray-700">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  name="data_vencimento"
                  id="data_vencimento"
                  required
                  value={formData.data_vencimento}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  name="valor"
                  id="valor"
                  required
                  step="0.01"
                  min="0"
                  value={formData.valor}
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
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              
              {formData.status === 'pago' && (
                <div>
                  <label htmlFor="data_pagamento" className="block text-sm font-medium text-gray-700">
                    Data de Pagamento *
                  </label>
                  <input
                    type="date"
                    name="data_pagamento"
                    id="data_pagamento"
                    required={formData.status === 'pago'}
                    value={formData.data_pagamento}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="forma_pagamento" className="block text-sm font-medium text-gray-700">
                  Forma de Pagamento
                </label>
                <input
                  type="text"
                  name="forma_pagamento"
                  id="forma_pagamento"
                  value={formData.forma_pagamento}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Ex: Cartão de Crédito, PIX, Boleto..."
                />
              </div>
              
              <div>
                <label htmlFor="numero_nota_fiscal" className="block text-sm font-medium text-gray-700">
                  Número da Nota Fiscal
                </label>
                <input
                  type="text"
                  name="numero_nota_fiscal"
                  id="numero_nota_fiscal"
                  value={formData.numero_nota_fiscal}
                  onChange={handleChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
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
                onClick={() => navigate('/lancamentos')}
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

export default LancamentoForm;

