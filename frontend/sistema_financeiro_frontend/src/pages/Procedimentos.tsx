import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { procedimentoService } from '../services/api';

interface Procedimento {
  id: number;
  nome: string;
  descricao: string;
  valor_sugerido: number;
  data_cadastro: string;
}

const Procedimentos: React.FC = () => {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProcedimentos();
  }, []);

  const fetchProcedimentos = async () => {
    try {
      const response = await procedimentoService.getAll();
      setProcedimentos(response);
    } catch (error) {
      console.error('Erro ao buscar procedimentos:', error);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/procedimentos/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este procedimento?')) {
      try {
        await procedimentoService.delete(id);
        fetchProcedimentos();
      } catch (error) {
        console.error('Erro ao deletar procedimento:', error);
        alert('Erro ao deletar procedimento. Verifique o console para mais detalhes.');
      }
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Procedimentos</h2>
      <button
        onClick={() => navigate('/procedimentos/novo')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Novo Procedimento
      </button>
      <div className="bg-white p-6 rounded shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Sugerido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {procedimentos.map((procedimento) => (
              <tr key={procedimento.id}>
                <td className="px-6 py-4 whitespace-nowrap">{procedimento.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{procedimento.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap">{procedimento.valor_sugerido}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(procedimento.id)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(procedimento.id)}
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

export default Procedimentos;


