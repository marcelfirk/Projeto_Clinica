import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { localAtendimentoService } from '../services/api';

interface LocalAtendimento {
  id: number;
  nome: string;
  endereco: string;
  data_cadastro: string;
}

const LocaisAtendimento: React.FC = () => {
  const [locais, setLocais] = useState<LocalAtendimento[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocais();
  }, []);

  const fetchLocais = async () => {
    try {
      const response = await localAtendimentoService.getAll();
      setLocais(response);
    } catch (error) {
      console.error('Erro ao buscar locais de atendimento:', error);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/locais-atendimento/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este local de atendimento?')) {
      try {
        await localAtendimentoService.delete(id);
        fetchLocais();
      } catch (error) {
        console.error('Erro ao deletar local de atendimento:', error);
        alert('Erro ao deletar local de atendimento. Verifique o console para mais detalhes.');
      }
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Locais de Atendimento</h2>
      <button
        onClick={() => navigate('/locais-atendimento/novo')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Novo Local de Atendimento
      </button>
      <div className="bg-white p-6 rounded shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locais.map((local) => (
              <tr key={local.id}>
                <td className="px-6 py-4 whitespace-nowrap">{local.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{local.endereco}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(local.id)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(local.id)}
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

export default LocaisAtendimento;


