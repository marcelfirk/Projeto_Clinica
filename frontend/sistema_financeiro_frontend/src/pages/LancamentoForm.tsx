import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { lancamentoService, contratoService, fornecedorService, naturezaService } from '../services/api';

const LancamentoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    tipo: 'a_receber',
    contrato_id: '',
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
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [naturezas, setNaturezas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Busca listas de contratos e fornecedores
        const [contratosData, fornecedoresData, naturezasData] = await Promise.all([
          contratoService.getAll(),
          fornecedorService.getAll(),
          naturezaService.getAll() // novo serviço
        ]);

        setContratos(contratosData);
        setFornecedores(fornecedoresData);
        setNaturezas(naturezasData);
        
        // Se estiver editando, busca dados do lançamento
        if (isEditing) {
          const lancamentoData = await lancamentoService.getById(Number(id));
          
          // Formata as datas para o formato esperado pelo input type="date"
          const dataVencimento = lancamentoData.data_vencimento ? lancamentoData.data_vencimento.split('T')[0] : '';
          const dataPagamento = lancamentoData.data_pagamento ? lancamentoData.data_pagamento.split('T')[0] : '';
          
          setFormData({
            tipo: lancamentoData.tipo,
            contrato_id: lancamentoData.contrato_id ? lancamentoData.contrato_id.toString() : '',
            fornecedor_id: lancamentoData.fornecedor_id ? lancamentoData.fornecedor_id.toString() : '',
            natureza_id: lancamentoData.natureza_id ? lancamentoData.natureza_id.toString() : '',
            data_vencimento: dataVencimento,
            data_pagamento: dataPagamento,
            valor: lancamentoData.valor.toString(),
            status: lancamentoData.status,
            forma_pagamento: lancamentoData.forma_pagamento || '',
            numero_nota_fiscal: lancamentoData.numero_nota_fiscal || '',
            observacoes: lancamentoData.observacoes || ''
          });
        } else {
          // Se não estiver editando, verifica se há parâmetros da URL (vindo da entrada de estoque)
          const tipoParam = searchParams.get('tipo');
          const fornecedorIdParam = searchParams.get('fornecedor_id');
          const valorParam = searchParams.get('valor');
          const dataVencimentoParam = searchParams.get('data_vencimento');
          const observacoesParam = searchParams.get('observacoes');
          
          if (tipoParam || fornecedorIdParam || valorParam) {
            setFormData(prev => ({
              ...prev,
              tipo: tipoParam || prev.tipo,
              fornecedor_id: fornecedorIdParam || prev.fornecedor_id,
              valor: valorParam || prev.valor,
              data_vencimento: dataVencimentoParam || prev.data_vencimento,
              observacoes: observacoesParam || prev.observacoes
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
    
    // Lógica especial para tipo de lançamento
    if (name === 'tipo') {
      // Se mudar para "a_receber", limpa fornecedor_id
      // Se mudar para "a_pagar", limpa contrato_id
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(value === 'a_receber' ? { fornecedor_id: '' } : { contrato_id: '' })
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      // Validações específicas
      if (formData.tipo === 'a_receber' && !formData.contrato_id) {
        throw new Error('Lançamentos a receber devem estar vinculados a um contrato');
      }
      
      if (formData.tipo === 'a_pagar' && !formData.fornecedor_id) {
        throw new Error('Lançamentos a pagar devem estar vinculados a um fornecedor');
      }
      
      if (formData.status === 'pago' && !formData.data_pagamento) {
        throw new Error('Lançamentos pagos devem ter data de pagamento');
      }

      if (!formData.natureza_id) {
        throw new Error('Natureza é obrigatória');
      }
      
      const dataToSubmit = {
        ...formData,
        contrato_id: formData.contrato_id ? Number(formData.contrato_id) : null,
        fornecedor_id: formData.fornecedor_id ? Number(formData.fornecedor_id) : null,
        natureza_id: formData.natureza_id ? Number(formData.natureza_id) : null,
        valor: Number(formData.valor)
      };
      
      if (isEditing) {
        await lancamentoService.update(Number(id), dataToSubmit);
      } else {
        await lancamentoService.create(dataToSubmit);
      }
      navigate('/lancamentos');
    } catch (err: any) {
      setError(err.message || err.response?.data?.msg || 'Erro ao salvar lançamento. Verifique os dados e tente novamente.');
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
  
  // Verifica se veio da entrada de estoque
  const veioDaEntradaEstoque = searchParams.get('fornecedor_id') && searchParams.get('valor');
  
  return (
    <Layout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h1>
        </div>
        
        {veioDaEntradaEstoque && !isEditing && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Lançamento baseado na entrada de estoque</p>
            <p className="text-sm">Os campos foram pré-preenchidos com base na entrada de estoque recém-criada. Você pode ajustar os valores conforme necessário.</p>
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
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="a_receber">A Receber</option>
                  <option value="a_pagar">A Pagar</option>
                </select>
              </div>
              
              {formData.tipo === 'a_receber' && (
                <div>
                  <label htmlFor="contrato_id" className="block text-sm font-medium text-gray-700">
                    Contrato *
                  </label>
                  <select
                    id="contrato_id"
                    name="contrato_id"
                    required
                    value={formData.contrato_id}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Selecione um contrato</option>
                    {contratos.map(contrato => (
                      <option key={contrato.id} value={contrato.id}>
                        {contrato.identificador_contrato} - {contrato.paciente} - {contrato.procedimento_nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {formData.tipo === 'a_pagar' && (
                <div>
                  <label htmlFor="fornecedor_id" className="block text-sm font-medium text-gray-700">
                    Fornecedor *
                  </label>
                  <select
                    id="fornecedor_id"
                    name="fornecedor_id"
                    required
                    value={formData.fornecedor_id}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map(fornecedor => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome} - {fornecedor.cpf_cnpj}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
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
              
              <div>
                <label htmlFor="data_pagamento" className="block text-sm font-medium text-gray-700">
                  Data de Pagamento {formData.status === 'pago' && '*'}
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

              <div>
                <label htmlFor="forma_pagamento" className="block text-sm font-medium text-gray-700">
                  Forma de pagamento
                </label>
                <select
                  id="forma_pagamento"
                  name="forma_pagamento"
                  value={formData.forma_pagamento}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="" disabled>Selecione uma opção</option>
                  <option value="boleto">Boleto</option>
                  <option value="cartao-credito">Cartão de crédito</option>
                  <option value="cartao-debito">Cartão de débito</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">Pix</option>
                </select>
              </div>

              <div>
                <label htmlFor="natureza_id" className="block text-sm font-medium text-gray-700">
                  Natureza *
                </label>
                <select
                  id="natureza_id"
                  name="natureza_id"
                  required
                  value={formData.natureza_id}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Selecione uma natureza</option>
                  {naturezas.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.tipo === 'a_pagar' && (
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
              )}
              
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

