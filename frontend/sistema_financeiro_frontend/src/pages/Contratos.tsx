import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { contratoService, pacienteService } from '../services/api';

const Contratos: React.FC = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contratosData, pacientesData] = await Promise.all([
          contratoService.getAll(),
          pacienteService.getAll()
        ]);
        
        setContratos(contratosData);
        setPacientes(pacientesData);
      } catch (err: any) {
        setError('Erro ao carregar contratos. Por favor, tente novamente.');
        console.error('Erro ao carregar contratos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await contratoService.delete(id);
        setContratos(contratos.filter(contrato => contrato.id !== id));
      } catch (err: any) {
        setError('Erro ao excluir contrato. Verifique se não há lançamentos associados.');
        console.error('Erro ao excluir contrato:', err);
      }
    }
  };

  const getPacienteNome = (pacienteId: number) => {
    const paciente = pacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.nome : 'Paciente não encontrado';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const filteredContratos = contratos.filter(contrato => {
    const pacienteNome = getPacienteNome(contrato.paciente_id).toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      pacienteNome.includes(searchTermLower) ||
      contrato.identificador_contrato.toLowerCase().includes(searchTermLower) ||
      contrato.procedimento.toLowerCase().includes(searchTermLower) ||
      contrato.local_realizacao.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <Layout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Contratos</h1>
          <button
            onClick={() => navigate('/contratos/novo')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Novo Contrato
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por paciente, procedimento, local ou identificador..."
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Carregando contratos...</p>
          </div>
        ) : filteredContratos.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum contrato encontrado com os critérios de busca.' : 'Nenhum contrato cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredContratos.map((contrato) => (
                <li key={contrato.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {contrato.procedimento}
                        </p>
                        <p className="text-sm text-gray-500">
                          Paciente: {getPacienteNome(contrato.paciente_id)} | ID: {contrato.identificador_contrato}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/contratos/${contrato.id}`)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(contrato.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(contrato.data_procedimento)}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {contrato.local_realizacao}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatCurrency(contrato.valor_total)}
                        <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${
                          contrato.status === 'ativo' ? 'bg-green-100 text-green-800' : 
                          contrato.status === 'cancelado' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {contrato.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contratos;
