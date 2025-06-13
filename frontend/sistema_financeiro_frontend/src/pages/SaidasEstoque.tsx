import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { saidaEstoqueService } from '../services/api';

const SaidasEstoque: React.FC = () => {
  const navigate = useNavigate();
  const [saidas, setSaidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const saidasData = await saidaEstoqueService.getAll();
        setSaidas(saidasData);
      } catch (err) {
        setError('Erro ao carregar saídas de estoque.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir esta saída?')) {
      try {
        await saidaEstoqueService.delete(id);
        setSaidas(saidas.filter(s => s.id !== id));
      } catch {
        setError('Erro ao excluir a saída.');
      }
    }
  };

  const filteredSaidas = saidas.filter((s) =>
    String(s.agendamento_id).includes(searchTerm)
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Saídas de Estoque</h1>
          <button
            onClick={() => navigate('/saidas-estoque/nova')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nova Saída
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por responsável..."
          className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : filteredSaidas.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma saída encontrada.</p>
        ) : (
          <div className="bg-white shadow rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredSaidas.map((saida) => (
                <li key={saida.id} className="p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                        Agendamento: {saida.agendamento_id || 'Não informado'}
                    </p>
                    <p className="text-sm text-gray-500">Data: {formatDate(saida.data_saida)}</p>
                    <p className="text-sm text-gray-500">Itens: {saida.itens.length}</p>

                    <div className="flex space-x-2 mt-2">
                        <button
                        onClick={() => navigate(`/saidas-estoque/${saida.id}`)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-1 px-3 rounded text-sm"
                        >
                        Editar
                        </button>
                        <button
                        onClick={() => handleDelete(saida.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded text-sm"
                        >
                        Excluir
                        </button>
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

export default SaidasEstoque;
