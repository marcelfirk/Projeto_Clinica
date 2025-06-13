import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { categoriaProcedimentoService } from '../services/api';

const CategoriaProcedimentoForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      categoriaProcedimentoService.getById(parseInt(id)).then(response => {
        setNome(response.nome);
        setDescricao(response.descricao);
      }).catch(error => {
        console.error('Erro ao buscar categoria de procedimento:', error);
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoriaData = { nome, descricao };
    try {
      if (id) {
        await categoriaProcedimentoService.update(parseInt(id), categoriaData);
      } else {
        await categoriaProcedimentoService.create(categoriaData);
      }
      navigate('/categorias-procedimento');
    } catch (error) {
      console.error('Erro ao salvar categoria de procedimento:', error);
      alert('Erro ao salvar categoria de procedimento. Verifique o console para mais detalhes.');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">{id ? 'Editar Categoria de Procedimento' : 'Nova Categoria de Procedimento'}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nome">
            Nome:
          </label>
          <input
            type="text"
            id="nome"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descricao">
            Descrição:
          </label>
          <textarea
            id="descricao"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => navigate('/categorias-procedimento')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default CategoriaProcedimentoForm;


