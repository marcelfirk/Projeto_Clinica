import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { saidaEstoqueService, itemService, agendamentoService } from '../services/api';

const SaidaEstoqueForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<any>({
    agendamento_id: '',
    data_saida: '',
    observacoes: '',
    itens: []
  });

  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agendamentosData, itensData] = await Promise.all([
          agendamentoService.getAll(),
          itemService.getAll()
        ]);
        setAgendamentos(agendamentosData);
        setItens(itensData);

        if (isEditing && id) {
          const saida = await saidaEstoqueService.getById(Number(id));
          setFormData(saida);
        }
      } catch (err) {
        setError('Erro ao carregar dados.');
      }
    };

    fetchData();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItens = [...formData.itens];
    updatedItens[index][field] = value;
    setFormData({ ...formData, itens: updatedItens });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { item_id: '', quantidade: '' }]
    });
  };

  const removeItem = (index: number) => {
    const updatedItens = [...formData.itens];
    updatedItens.splice(index, 1);
    setFormData({ ...formData, itens: updatedItens });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && id) {
        await saidaEstoqueService.update(Number(id), formData);
      } else {
        await saidaEstoqueService.create(formData);
      }
      navigate('/saidas-estoque');
    } catch (err) {
      setError('Erro ao salvar saída de estoque.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">
          {isEditing ? 'Editar Saída de Estoque' : 'Nova Saída de Estoque'}
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Data da Saída</label>
            <input
              type="date"
              value={formData.data_saida}
              onChange={(e) => setFormData({ ...formData, data_saida: e.target.value })}
              required
              className="border rounded w-full px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Agendamento</label>
            <select
              value={formData.agendamento_id}
              onChange={(e) => setFormData({ ...formData, agendamento_id: e.target.value })}
              required
              className="border rounded w-full px-3 py-2"
            >
              <option value="">Selecione...</option>
              {agendamentos.map((agendamento) => (
                <option key={agendamento.id} value={agendamento.id}>
                  {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')} - {agendamento.procedimento_nome} - {agendamento.paciente_nome}
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
                  className="border rounded px-2 py-1 w-1/2"
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
                  placeholder="Quantidade"
                  value={item.quantidade}
                  onChange={(e) => handleItemChange(index, 'quantidade', parseFloat(e.target.value))}
                  required
                  className="border rounded px-2 py-1 w-1/3"
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

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default SaidaEstoqueForm;
