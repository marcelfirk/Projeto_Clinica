import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { entradaEstoqueService } from '../services/api';

const EntradasEstoque: React.FC = () => {
  const navigate = useNavigate();
  const [entradas, setEntradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entradasData = await entradaEstoqueService.getAll();
        setEntradas(entradasData);
      } catch (err) {
        setError('Erro ao carregar entradas de estoque.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEntradas = entradas.filter((entrada) =>
    entrada.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`; 
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta entrada de estoque?')) {
      try {
        await entradaEstoqueService.delete(id);
        setEntradas(entradas.filter((e) => e.id !== id));
      } catch (err) {
        setError('Erro ao excluir entrada.');
      }
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Entradas de Estoque</h1>
          <button
            onClick={() => navigate('/entradas-estoque/nova')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nova Entrada
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por fornecedor..."
          className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : filteredEntradas.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma entrada encontrada.</p>
        ) : (
          <div className="bg-white shadow rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredEntradas.map((entrada) => (
                <li key={entrada.id} className="p-4">
                  <p className="text-sm font-medium text-gray-900">Fornecedor: {entrada.fornecedor}</p>
                  <p className="text-sm text-gray-500">Data: {formatDate(entrada.data_entrada)}</p>
                  <p className="text-sm text-gray-500">Itens: {entrada.itens.length}</p>

                  {/* 👇 Botões de ação */}
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => navigate(`/entradas-estoque/${entrada.id}`)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-1 px-3 rounded text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(entrada.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded text-sm"
                    >
                      Excluir
                    </button>
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

export default EntradasEstoque;
