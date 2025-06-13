import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { localAtendimentoService } from '../services/api';

const LocalAtendimentoForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      localAtendimentoService.getById(parseInt(id)).then(response => {
        setNome(response.nome);
        setEndereco(response.endereco);
      }).catch(error => {
        console.error('Erro ao buscar local de atendimento:', error);
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const localData = { nome, endereco };
    try {
      if (id) {
        await localAtendimentoService.update(parseInt(id), localData);
      } else {
        await localAtendimentoService.create(localData);
      }
      navigate('/locais-atendimento');
    } catch (error) {
      console.error('Erro ao salvar local de atendimento:', error);
      alert('Erro ao salvar local de atendimento. Verifique o console para mais detalhes.');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">{id ? 'Editar Local de Atendimento' : 'Novo Local de Atendimento'}</h2>
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endereco">
            Endereço:
          </label>
          <textarea
            id="endereco"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
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
            onClick={() => navigate('/locais-atendimento')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default LocalAtendimentoForm;


