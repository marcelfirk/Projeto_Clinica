import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { naturezaService } from '../services/api';

interface Natureza {
  id: number;
  nome: string;
  descricao: string;
  data_cadastro: string;
}

const Naturezas: React.FC = () => {
  const [naturezas, setNaturezas] = useState<Natureza[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNaturezas();
  }, []);

  const fetchNaturezas = async () => {
    try {
      const response = await naturezaService.getAll();
      setNaturezas(response);
    } catch (error) {
      console.error('Erro ao buscar naturezas:', error);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/naturezas/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta natureza?')) {
      try {
        await naturezaService.delete(id);
        fetchNaturezas();
      } catch (error) {
        console.error('Erro ao deletar natureza:', error);
        alert('Erro ao deletar natureza. Verifique o console para mais detalhes.');
      }
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Naturezas</h2>
      <button
        onClick={() => navigate('/naturezas/novo')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Nova Natureza
      </button>
      <div className="bg-white p-6 rounded shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {naturezas.map((natureza) => (
              <tr key={natureza.id}>
                <td className="px-6 py-4 whitespace-nowrap">{natureza.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{natureza.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(natureza.id)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(natureza.id)}
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

export default Naturezas;


