import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { equipeService } from '../services/api';

interface Equipe {
  id: number;
  nome: string;
  descricao: string;
  data_cadastro: string;
}

const Equipes: React.FC = () => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    try {
      const response = await equipeService.getAll();
      setEquipes(response);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
   }
  };

  const handleEdit = (id: number) => {
    navigate(`/equipes/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta equipe?')) {
      try {
        await equipeService.delete(id);
        fetchEquipes();
      } catch (error) {
        console.error('Erro ao deletar equipe:', error);
        alert('Erro ao deletar equipe. Verifique o console para mais detalhes.');
      }
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Equipes</h2>
      <button
        onClick={() => navigate('/equipes/novo')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Nova Equipe
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
            {equipes.map((equipe) => (
              <tr key={equipe.id}>
                <td className="px-6 py-4 whitespace-nowrap">{equipe.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{equipe.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(equipe.id)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(equipe.id)}
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

export default Equipes;


