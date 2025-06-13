import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { categoriaProcedimentoService } from '../services/api';

interface CategoriaProcedimento {
  id: number;
  nome: string;
  descricao: string;
  data_cadastro: string;
}

const CategoriasProcedimento: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaProcedimento[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await categoriaProcedimentoService.getAll();
      setCategorias(response);
    } catch (error) {
      console.error('Erro ao buscar categorias de procedimento:', error);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/categorias-procedimento/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta categoria de procedimento?')) {
      try {
        await categoriaProcedimentoService.delete(id);
        fetchCategorias();
      } catch (error) {
        console.error('Erro ao deletar categoria de procedimento:', error);
        alert('Erro ao deletar categoria de procedimento. Verifique o console para mais detalhes.');
      }
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Categorias de Procedimento</h2>
      <button
        onClick={() => navigate('/categorias-procedimento/novo')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Nova Categoria de Procedimento
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
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td className="px-6 py-4 whitespace-nowrap">{categoria.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{categoria.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(categoria.id)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id)}
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

export default CategoriasProcedimento;


