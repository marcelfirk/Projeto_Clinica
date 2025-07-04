import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { tipoTratamentoService } from '../services/api';

const TipoTratamentoForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duracao_sessao_minutos, setDuracao] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      tipoTratamentoService.getById(parseInt(id)).then(response => {
        setNome(response.nome);
        setDescricao(response.descricao);
        setDuracao(response.duracao_sessao_minutos);
      }).catch(error => {
        console.error('Erro ao buscar tipo de tratamento:', error);
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tipoTratamentoData = { nome, descricao, duracao_sessao_minutos};
    try {
      if (id) {
        await tipoTratamentoService.update(parseInt(id), tipoTratamentoData);
      } else {
        await tipoTratamentoService.create(tipoTratamentoData);
      }
      navigate('/tipo-tratamento');
    } catch (error) {
      console.error('Erro ao salvar tipo de tratamento:', error);
      alert('Erro ao salvar tipo de tratamento. Verifique o console para mais detalhes.');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">{id ? 'Editar Tipo de Tratamento' : 'Novo Tipo de Tratamento'}</h2>
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
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duracao_sessao_minutos">
            Duração em minutos:
          </label>
          <textarea
            id="duracao_sessao_minutos"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={duracao_sessao_minutos}
            onChange={(e) => setDuracao(e.target.value)}
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
            onClick={() => navigate('/tipo-tratamento')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default TipoTratamentoForm;


