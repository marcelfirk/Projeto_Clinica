import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { entradaEstoqueService, itemService, fornecedorService } from '../services/api';

const EntradaEstoqueForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<any>({
    fornecedor_id: '',
    data_entrada: '',
    observacoes: '',
    itens: []
  });

  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fornecedores, setFornecedores]  = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showLancamentoModal, setShowLancamentoModal] = useState(false);
  const [entradaSalva, setEntradaSalva] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itensData, fornecedoresData] = await Promise.all([
          itemService.getAll(),
          fornecedorService.getAll()
        ]);
        setItens(itensData);
        setFornecedores(fornecedoresData);

        if (isEditing) {
          const data = await entradaEstoqueService.getById(Number(id));
          setFormData({
            data: data.data,
            itens: data.itens.map((item: any) => ({
              item_id: item.item_id.toString(),
              quantidade: item.quantidade.toString(),
              valor_unitario: item.valor_unitario.toString()
            }))
          });
        }
      } catch (err) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

   const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItens = [...formData.itens];
    updatedItens[index][field] = value;
    setFormData({ ...formData, itens: updatedItens });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { item_id: '', quantidade: '', valor_unitario: '' }]
    });
  };

  const removeItem = (index: number) => {
    const updatedItens = [...formData.itens];
    updatedItens.splice(index, 1);
    setFormData({ ...formData, itens: updatedItens });
  };

  const calcularValorTotal = () => {
    return formData.itens.reduce((total: number, item: any) => {
      const quantidade = parseFloat(item.quantidade) || 0;
      const valorUnitario = parseFloat(item.valor_unitario) || 0;
      return total + (quantidade * valorUnitario);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let entradaCriada;
      if (isEditing) {
        entradaCriada = await entradaEstoqueService.update(Number(id), formData);
      } else {
        entradaCriada = await entradaEstoqueService.create(formData);
      }
      
      // Se não está editando, mostra o modal para pergunta sobre lançamento
      if (!isEditing) {
        setEntradaSalva(entradaCriada);
        setShowLancamentoModal(true);
      } else {
        navigate('/entradas-estoque');
      }
    } catch (err) {
      setError('Erro ao salvar entrada de estoque');
    } finally {
      setSaving(false);
    }
  };

  const handleCriarLancamento = () => {
    const valorTotal = calcularValorTotal();
    const dataAtual = new Date().toISOString().split('T')[0];
    
    // Navega para o formulário de lançamentos com parâmetros na URL
    const params = new URLSearchParams({
      tipo: 'a_pagar',
      fornecedor_id: formData.fornecedor_id,
      valor: valorTotal.toString(),
      data_vencimento: dataAtual,
      observacoes: `Lançamento referente à entrada de estoque - ${formData.observacoes || ''}`.trim()
    });
    
    navigate(`/lancamentos/novo?${params.toString()}`);
  };

  const handlePularLancamento = () => {
    navigate('/entradas-estoque');
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">
        {isEditing ? 'Editar Entrada de Estoque' : 'Nova Entrada de Estoque'}
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Data</label>
          <input
            type="date"
            name="data"
            value={formData.data_entrada}
            onChange={(e) => setFormData({ ...formData, data_entrada: e.target.value })}
            required
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div>
            <label className="block mb-1 font-medium">Fornecedor</label>
            <select
              value={formData.fornecedor_id}
              onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
              required
              className="border rounded w-full px-3 py-2"
            >
              <option value="">Selecione...</option>
              {fornecedores.map((fornecedor) => (
                <option key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="border rounded w-full px-3 py-2"
              rows={3}
            />
          </div>
              

        <div>
          <label className="block mb-2 font-medium">Itens</label>
          {formData.itens.map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <select
                value={item.item_id}
                onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}
                required
                className="border rounded px-2 py-1 w-1/3"
              >
                <option value="">Item</option>
                {itens.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.nome}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qtd"
                value={item.quantidade}
                onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                required
                className="border rounded px-2 py-1 w-1/4"
              />

              <input
                type="number"
                placeholder="Valor Unitário"
                step="0.01"
                value={item.valor_unitario}
                onChange={(e) => handleItemChange(index, 'valor_unitario', e.target.value)}
                required
                className="border rounded px-2 py-1 w-1/4"
              />

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
          >
            Adicionar Item
          </button>
        </div>

        {formData.itens.length > 0 && (
          <div className="bg-gray-100 p-3 rounded">
            <strong>Valor Total: R$ {calcularValorTotal().toFixed(2)}</strong>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      {/* Modal para pergunta sobre lançamento financeiro */}
      {showLancamentoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Entrada de Estoque Salva!</h2>
            <p className="mb-4">
              Deseja criar um lançamento financeiro correspondente a esta entrada de estoque?
            </p>
            <div className="bg-gray-100 p-3 rounded mb-4">
              <p><strong>Fornecedor:</strong> {fornecedores.find(f => f.id == formData.fornecedor_id)?.nome}</p>
              <p><strong>Valor Total:</strong> R$ {calcularValorTotal().toFixed(2)}</p>
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
    </Layout>
  );
};

export default EntradaEstoqueForm;

