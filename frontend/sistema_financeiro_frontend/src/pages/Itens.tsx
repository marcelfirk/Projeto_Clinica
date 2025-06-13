import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { itemService } from '../services/api';

interface Item {
  id: number;
  nome: string;
  descricao: string;
  quantidade_estoque: number;
  data_cadastro: string;
}

const Itens: React.FC = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItens();
  }, []);

  const fetchItens = async () => {
    try {
      const response = await itemService.getAll();
      setItens(response);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/itens/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este item?')) {
      try {
        await itemService.delete(id);
        fetchItens();
      } catch (error) {
        console.error('Erro ao deletar item:', error);
        alert('Erro ao deletar item. Verifique o console para mais detalhes.');
      }
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Itens</h2>
      <button
        onClick={() => navigate('/itens/novo')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Novo Item
      </button>
      <div className="bg-white p-6 rounded shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade em Estoque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {itens.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.quantidade_estoque}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded text-sm"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Itens;


