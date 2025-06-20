import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { lancamentoService, contratoService, fornecedorService, boletoService } from '../services/api';

const Lancamentos: React.FC = () => {
  const navigate = useNavigate();
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [servico, setServico] = useState('');
  const [descricaoServico, setDescricaoServico] = useState('');
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState<any>(null);
  const [boletos, setBoletos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lancamentosData, contratosData, fornecedoresData, boletosData] = await Promise.all([
          lancamentoService.getAll(),
          contratoService.getAll(),
          fornecedorService.getAll(),
          boletoService.getAll()
        ]);
        
        setLancamentos(lancamentosData);
        setContratos(contratosData);
        setFornecedores(fornecedoresData);
        setBoletos(boletosData);
      } catch (err: any) {
        setError('Erro ao carregar lançamentos. Por favor, tente novamente.');
        console.error('Erro ao carregar lançamentos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    const getPacienteNome = (lancamento: any) => {
    if (lancamento.paciente_nome) {
      return lancamento.paciente_nome;
    }
    
    const contrato = contratos.find(c => c.id === lancamento.contrato_id);
    if (contrato && contrato.paciente) {
      return contrato.paciente;
    }

    return 'N/A';
  };

  const openModal = (lancamento: any) => {
    setLancamentoSelecionado(lancamento);
    setShowModal(true);
  };

  const handleExibirBoleto = (lancamentoId: number) => {
    const boleto = getBoletoByLancamento(lancamentoId);
    if (boleto && boleto.link_pdf) {
      window.open(boleto.link_pdf, '_blank');
    } else {
      alert('Boleto não encontrado.');
    }
  };

  const getBoletoByLancamento = (lancamentoId: number) => {
    return boletos.find(b => b.lancamento_id === lancamentoId);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      try {
        await lancamentoService.delete(id);
        setLancamentos(lancamentos.filter(lancamento => lancamento.id !== id));
      } catch (err: any) {
        setError('Erro ao excluir lançamento.');
        console.error('Erro ao excluir lançamento:', err);
      }
    }
  };

  const getContratoIdentificador = (contratoId: number) => {
    const contrato = contratos.find(c => c.id === contratoId);
    return contrato ? contrato.paciente_nome : 'N/A';
  };

  const getFornecedorNome = (fornecedorId: number) => {
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    return fornecedor ? fornecedor.nome : 'N/A';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

  const handleEmitirBoleto = async () => {
    if (!servico || !descricaoServico) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      await boletoService.emitir({
        lancamento_id: lancamentoSelecionado.id,
        servico: servico,
        descricao_servico: descricaoServico},
      );
      alert('Boleto emitido com sucesso!');
      setShowModal(false);
      setServico('');
      setDescricaoServico('');
    } catch (error) {
      console.error('Erro ao emitir boleto:', error);
      alert('Erro ao emitir boleto.');
    }
  };


  const filteredLancamentos = lancamentos.filter(lancamento => {
    // Filtro por tipo
    if (filtroTipo !== 'todos' && lancamento.tipo !== filtroTipo) {
      return false;
    }
    
    // Filtro por status
    if (filtroStatus !== 'todos' && lancamento.status !== filtroStatus) {
      return false;
    }
    
    // Filtro por termo de busca
    const searchTermLower = searchTerm.toLowerCase();
    
    // Busca em contrato
    const pacienteMatch = lancamento.paciente_nome && 
      lancamento.paciente_nome.toLowerCase().includes(searchTermLower);
    
    // Busca em fornecedor
    const fornecedorMatch = lancamento.fornecedor_id && 
      getFornecedorNome(lancamento.fornecedor_id).toLowerCase().includes(searchTermLower);
    
    // Busca em número de nota fiscal
    const notaFiscalMatch = lancamento.numero_nota_fiscal && 
      lancamento.numero_nota_fiscal.toLowerCase().includes(searchTermLower);
    
    return pacienteMatch || fornecedorMatch || notaFiscalMatch || 
    (searchTerm === '' || searchTermLower === '');
    });

  const totalAReceber = filteredLancamentos
    .filter(l => l.tipo === 'a_receber' && l.status === 'pendente')
    .reduce((sum, l) => sum + parseFloat(l.valor), 0);
    
  const totalAPagar = filteredLancamentos
    .filter(l => l.tipo === 'a_pagar' && l.status === 'pendente')
    .reduce((sum, l) => sum + parseFloat(l.valor), 0);

  return (
    <Layout>
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Emitir Boleto</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Serviço
            </label>
            <input
              type="text"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              className="border rounded w-full py-2 px-3"
              placeholder="Ex: Cirurgia plástica"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Serviço
            </label>
            <input
              type="text"
              value={descricaoServico}
              onChange={(e) => setDescricaoServico(e.target.value)}
              className="border rounded w-full py-2 px-3"
              placeholder="Ex: Cirurgia de pálpebra superior"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={handleEmitirBoleto}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
      )}

      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Lançamentos Financeiros</h1>
          <button
            onClick={() => navigate('/lancamentos/novo')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Novo Lançamento
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por paciente, fornecedor ou nota fiscal..."
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="a_receber">A Receber</option>
                <option value="a_pagar">A Pagar</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">Total a Receber (pendente)</p>
              <p className="text-2xl font-bold text-green-800">{formatCurrency(totalAReceber)}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700">Total a Pagar (pendente)</p>
              <p className="text-2xl font-bold text-red-800">{formatCurrency(totalAPagar)}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Carregando lançamentos...</p>
          </div>
        ) : filteredLancamentos.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">
              Nenhum lançamento encontrado com os critérios selecionados.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredLancamentos.map((lancamento) => (
                <li key={lancamento.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lancamento.tipo === 'a_receber' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {lancamento.tipo === 'a_receber' ? 'A RECEBER' : 'A PAGAR'}
                          </span>
                          <p className="ml-2 text-sm font-medium text-gray-900">
                            {formatCurrency(lancamento.valor)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {lancamento.tipo === 'a_receber' 
                            ? `Paciente: ${getPacienteNome(lancamento)}`
                            : `Fornecedor: ${getFornecedorNome(lancamento.fornecedor_id)}`
                          }
                          {lancamento.numero_nota_fiscal && ` | NF: ${lancamento.numero_nota_fiscal}`}
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/lancamentos/${lancamento.id}`)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(lancamento.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded text-sm"
                        >
                          Excluir
                        </button>                
                        {lancamento.tipo === 'a_receber' && lancamento.status === 'pendente' && (
                          getBoletoByLancamento(lancamento.id) ? (
                            <button
                              onClick={() => handleExibirBoleto(lancamento.id)}
                              className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold py-1 px-3 rounded text-sm"
                            >
                              Exibir Boleto
                            </button>
                          ) : (
                            <button
                              onClick={() => openModal(lancamento)}
                              className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-1 px-3 rounded text-sm"
                            >
                              Emitir Boleto
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Vencimento: {formatDate(lancamento.data_vencimento)}
                        </p>
                        {lancamento.data_pagamento && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pagamento: {formatDate(lancamento.data_pagamento)}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          lancamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
                          lancamento.status === 'pago' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {lancamento.status.toUpperCase()}
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

export default Lancamentos;
