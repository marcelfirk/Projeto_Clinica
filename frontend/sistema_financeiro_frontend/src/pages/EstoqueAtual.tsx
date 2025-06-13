import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { estoqueAtualService } from '../services/api';

const EstoqueAtual: React.FC = () => {
  const [estoque, setEstoque] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
        try {
        const data = await estoqueAtualService.getAll();
        setEstoque(data);
        } catch (err) {
        setError('Erro ao carregar o estoque atual.');
        } finally {
        setLoading(false);
        }
    };

    fetchData();
    }, []);

  return (
    <Layout>
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Estoque Atual</h1>
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : (
          <div className="bg-white shadow rounded-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade Disponível</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Entradas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Saídas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estoque.map((item) => (
                  <tr key={item.item_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantidade_atual}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_entrada}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_saida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EstoqueAtual;
