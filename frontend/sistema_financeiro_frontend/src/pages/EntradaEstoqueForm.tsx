import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { entradaEstoqueService, itemService, fornecedorService } from '../services/api';

const EntradaEstoqueForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [itens, setItens] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fornecedor_id: '',
    data_entrada: '',
    observacoes: '',
    itens: [] as any[]
  });
  const [novoItem, setNovoItem] = useState({ item_id: '', quantidade: '', valor_unitario: '' });
  const [itensSelecionados, setItensSelecionados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itensData, fornecedoresData] = await Promise.all([
          itemService.getAll(),
          fornecedorService.getAll()
        ]);

        setItens(itensData);
        setFornecedores(fornecedoresData);

        if (isEditing) {
          const entradaData = await entradaEstoqueService.getById(Number(id));
          setFormData({
            fornecedor_id: entradaData.fornecedor_id,
            data_entrada: entradaData.data_entrada,
            observacoes: entradaData.observacoes || '',
            itens: entradaData.itens || []
          });
          setItensSelecionados(entradaData.itens || []);
        }
      } catch (err) {
        setError('Erro ao carregar dados.');
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNovoItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNovoItem({ ...novoItem, [e.target.name]: e.target.value });
  };

  const adicionarItem = () => {
    if (!novoItem.item_id || !novoItem.quantidade) return;
    setItensSelecionados([...itensSelecionados, novoItem]);
    setNovoItem({ item_id: '', quantidade: '', valor_unitario: '' });
  };

  const removerItem = (index: number) => {
    const novosItens = [...itensSelecionados];
    novosItens.splice(index, 1);
    setItensSelecionados(novosItens);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      itens: itensSelecionados
    };

    try {
      if (isEditing) {
        await entradaEstoqueService.update(Number(id), payload);
      } else {
        await entradaEstoqueService.create(payload);
      }
      navigate('/entradas-estoque');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao registrar entrada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          {isEditing ? 'Editar Entrada de Estoque' : 'Nova Entrada de Estoque'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-2xl mx-auto">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Fornecedor</label>
            <select
              name="fornecedor_id"
              value={formData.fornecedor_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map(fornecedor => (
                <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Data de Entrada</label>
            <input
              type="date"
              name="data_entrada"
              value={formData.data_entrada}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Observações</label>
            <input
              type="text"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <hr className="my-6" />

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Item</label>
            <select
              name="item_id"
              value={novoItem.item_id}
              onChange={handleNovoItemChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecione um item</option>
              {itens.map(item => (
                <option key={item.id} value={item.id}>{item.nome}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Quantidade</label>
            <input
              type="number"
              name="quantidade"
              value={novoItem.quantidade}
              onChange={handleNovoItemChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Valor Unitário</label>
            <input
              type="number"
              name="valor_unitario"
              value={novoItem.valor_unitario}
              onChange={handleNovoItemChange}
              step="0.01"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="mb-6 text-right">
            <button
              type="button"
              onClick={adicionarItem}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Adicionar Item
            </button>
          </div>

          {itensSelecionados.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Itens da Entrada</h2>
              <ul className="divide-y divide-gray-200">
                {itensSelecionados.map((item, index) => (
                  <li key={index} className="flex justify-between items-center py-2">
                    <span>
                      {itens.find(i => i.id === Number(item.item_id))?.nome || 'Item'} -
                      {item.quantidade} und x R$ {item.valor_unitario}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Entrada'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EntradaEstoqueForm;
