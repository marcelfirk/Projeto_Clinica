import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  pacienteService, 
  procedimentoService, 
  equipeService, 
  localAtendimentoService, 
  categoriaProcedimentoService, 
  refeicaoService, 
  contratoService, 
  agendamentoService 
} from '../services/api';

interface Paciente {
  id: number;
  nome: string;
}

interface Procedimento {
  id: number;
  nome: string;
}

interface Equipe {
  id: number;
  nome: string;
}

interface LocalAtendimento {
  id: number;
  nome: string;
}

interface CategoriaProcedimento {
  id: number;
  nome: string;
}

interface Refeicao {
  id: number;
  nome: string;
}

interface Contrato {
  id: number;
  identificador: string;
}

const AgendamentoForm: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [locaisAtendimento, setLocaisAtendimento] = useState<LocalAtendimento[]>([]);
  const [categoriasProcedimento, setCategoriasProcedimento] = useState<CategoriaProcedimento[]>([]);
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);

  const [pacienteId, setPacienteId] = useState<string>('');
  const [dataAgendamento, setDataAgendamento] = useState<string>('');
  const [procedimentoId, setProcedimentoId] = useState<string>('');
  const [grauCalvicie, setGrauCalvicie] = useState<string>('');
  const [equipeId, setEquipeId] = useState<string>('');
  const [localAtendimentoId, setLocalAtendimentoId] = useState<string>('');
  const [horarioInicio, setHorarioInicio] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [valorGeralVenda, setValorGeralVenda] = useState<number | ''>('');
  const [valorPago, setValorPago] = useState<number | ''>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('');
  const [contratoId, setContratoId] = useState<string>('');
  const [contratoAssinado, setContratoAssinado] = useState<boolean>(false);
  const [exames, setExames] = useState<boolean>(false);
  const [comunicacaoD7, setComunicacaoD7] = useState<boolean>(false);
  const [comunicacaoD2, setComunicacaoD2] = useState<boolean>(false);
  const [almocoEscolhidoId, setAlmocoEscolhidoId] = useState<string>('');
  const [termoMarcacao, setTermoMarcacao] = useState<boolean>(false);
  const [termoAlta, setTermoAlta] = useState<boolean>(false);
  const [comunicacaoD1, setComunicacaoD1] = useState<boolean>(false);
  const [observacoes, setObservacoes] = useState<string>('');
  const [acompanhante, setAcompanhante] = useState<string>('');
  const [telefoneAcompanhante, setTelefoneAcompanhante] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Carregando dados do agendamento...');
  

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingMessage('Carregando dados iniciais...');

        const [pacientesRes, procedimentosRes, equipesRes, locaisRes, categoriasRes, refeicoesRes, contratosRes] = await Promise.all([
          pacienteService.getAll(),
          procedimentoService.getAll(),
          equipeService.getAll(),
          localAtendimentoService.getAll(),
          categoriaProcedimentoService.getAll(),
          refeicaoService.getAll(),
          contratoService.getAll(),
        ]);
        setPacientes(pacientesRes);
        setProcedimentos(procedimentosRes);
        setEquipes(equipesRes);
        setLocaisAtendimento(locaisRes);
        setCategoriasProcedimento(categoriasRes);
        setRefeicoes(refeicoesRes);
        setContratos(contratosRes);

        if (id) {
          setLoadingMessage('Carregando dados do agendamento...');
          const agendamentoRes = await agendamentoService.getById(parseInt(id));
          const data = agendamentoRes;
          setPacienteId(data.paciente_id.toString());
          setDataAgendamento(data.data_agendamento);
          setProcedimentoId(data.procedimento_id.toString());
          setGrauCalvicie(data.grau_calvicie);
          setEquipeId(data.equipe_id.toString());
          setLocalAtendimentoId(data.local_atendimento_id.toString());
          setHorarioInicio(data.horario_inicio);
          setCategoriaId(data.categoria_id.toString());
          setValorGeralVenda(data.valor_geral_venda);
          setValorPago(data.valor_pago);
          setFormaPagamento(data.forma_pagamento);
          setContratoId(data.contrato_id ? data.contrato_id.toString() : '');
          setContratoAssinado(data.contrato_assinado);
          setExames(data.exames);
          setComunicacaoD7(data.comunicacao_d7);
          setComunicacaoD2(data.comunicacao_d2);
          setAlmocoEscolhidoId(data.almoco_escolhido_id ? data.almoco_escolhido_id.toString() : '');
          setTermoMarcacao(data.termo_marcacao);
          setTermoAlta(data.termo_alta);
          setComunicacaoD1(data.comunicacao_d1);
          setObservacoes(data.observacoes);
          setAcompanhante(data.acompanhante);
          setTelefoneAcompanhante(data.telefone_acompanhante);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados para o formulário de agendamento:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const agendamentoData = {
      paciente_id: parseInt(pacienteId),
      data_agendamento: dataAgendamento,
      procedimento_id: parseInt(procedimentoId),
      grau_calvicie: grauCalvicie,
      equipe_id: parseInt(equipeId),
      local_atendimento_id: parseInt(localAtendimentoId),
      horario_inicio: horarioInicio,
      categoria_id: parseInt(categoriaId),
      valor_geral_venda: valorGeralVenda === '' ? null : valorGeralVenda,
      valor_pago: valorPago === '' ? null : valorPago,
      forma_pagamento: formaPagamento,
      contrato_id: contratoId === '' ? null : parseInt(contratoId),
      contrato_assinado: contratoAssinado,
      exames: exames,
      comunicacao_d7: comunicacaoD7,
      comunicacao_d2: comunicacaoD2,
      almoco_escolhido_id: almocoEscolhidoId === '' ? null : parseInt(almocoEscolhidoId),
      termo_marcacao: termoMarcacao,
      termo_alta: termoAlta,
      comunicacao_d1: comunicacaoD1,
      observacoes: observacoes,
      acompanhante: acompanhante,
      telefone_acompanhante: telefoneAcompanhante,
    };

    try {
      if (id) {
        await agendamentoService.update(parseInt(id), agendamentoData);
      } else {
        await agendamentoService.create(agendamentoData);
      }
      navigate('/agendamentos');
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento. Verifique o console para mais detalhes.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-700 text-lg">{loadingMessage}</p>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">{id ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Paciente */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pacienteId">
              Paciente:
            </label>
            <select
              id="pacienteId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              required
            >
              <option value="">Selecione um paciente</option>
              {pacientes.map(paciente => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Data Agendamento */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dataAgendamento">
              Data Agendamento:
            </label>
            <input
              type="date"
              id="dataAgendamento"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={dataAgendamento}
              onChange={(e) => setDataAgendamento(e.target.value)}
              required
            />
          </div>

          {/* Procedimento */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="procedimentoId">
              Procedimento:
            </label>
            <select
              id="procedimentoId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={procedimentoId}
              onChange={(e) => setProcedimentoId(e.target.value)}
              required
            >
              <option value="">Selecione um procedimento</option>
              {procedimentos.map(proc => (
                <option key={proc.id} value={proc.id}>
                  {proc.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Grau Calvicie */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="grauCalvicie">
              Grau de Calvície:
            </label>
            <input
              type="text"
              id="grauCalvicie"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={grauCalvicie}
              onChange={(e) => setGrauCalvicie(e.target.value)}
            />
          </div>

          {/* Equipe */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="equipeId">
              Equipe Responsável:
            </label>
            <select
              id="equipeId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={equipeId}
              onChange={(e) => setEquipeId(e.target.value)}
              required
            >
              <option value="">Selecione uma equipe</option>
              {equipes.map(equipe => (
                <option key={equipe.id} value={equipe.id}>
                  {equipe.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Local Atendimento */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="localAtendimentoId">
              Local de Atendimento:
            </label>
            <select
              id="localAtendimentoId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={localAtendimentoId}
              onChange={(e) => setLocalAtendimentoId(e.target.value)}
              required
            >
              <option value="">Selecione um local</option>
              {locaisAtendimento.map(local => (
                <option key={local.id} value={local.id}>
                  {local.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Horario Inicio */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="horarioInicio">
              Horário de Início:
            </label>
            <input
              type="time"
              id="horarioInicio"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={horarioInicio}
              onChange={(e) => setHorarioInicio(e.target.value)}
              required
            />
          </div>

          {/* Categoria */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoriaId">
              Categoria:
            </label>
            <select
              id="categoriaId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categoriasProcedimento.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Valor Geral Venda */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="valorGeralVenda">
              Valor Geral da Venda:
            </label>
            <input
              type="number"
              id="valorGeralVenda"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={valorGeralVenda}
              onChange={(e) => setValorGeralVenda(e.target.value === '' ? '' : parseFloat(e.target.value))}
            />
          </div>

          {/* Valor Pago */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="valorPago">
              Valor Pago:
            </label>
            <input
              type="number"
              id="valorPago"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value === '' ? '' : parseFloat(e.target.value))}
            />
          </div>

          {/* Forma Pagamento */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="formaPagamento">
              Forma de Pagamento:
            </label>
            <input
              type="text"
              id="formaPagamento"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
            />
          </div>

          {/* Contrato */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contratoId">
              Contrato:
            </label>
            <select
              id="contratoId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={contratoId}
              onChange={(e) => setContratoId(e.target.value)}
            >
              <option value="">Selecione um contrato</option>
              {contratos.map(contrato => (
                <option key={contrato.id} value={contrato.id}>
                  {contrato.identificador}
                </option>
              ))}
            </select>
          </div>

          {/* Contrato Assinado */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="contratoAssinado"
              className="mr-2 leading-tight"
              checked={contratoAssinado}
              onChange={(e) => setContratoAssinado(e.target.checked)}
            />
            <label className="block text-gray-700 text-sm font-bold" htmlFor="contratoAssinado">
              Contrato Assinado?
            </label>
          </div>

          {/* Exames */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="exames"
              className="mr-2 leading-tight"
              checked={exames}
              onChange={(e) => setExames(e.target.checked)}
            />
            <label className="block text-gray-700 text-sm font-bold" htmlFor="exames">
              Exames?
            </label>
          </div>

          {/* Comunicação D-7 */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="comunicacaoD7"
              className="mr-2 leading-tight"
              checked={comunicacaoD7}
              onChange={(e) => setComunicacaoD7(e.target.checked)}
            />
            <label className="block text-gray-700 text-sm font-bold" htmlFor="comunicacaoD7">
              Comunicação D-7?
            </label>
          </div>

          {/* Comunicação D-2 */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="comunicacaoD2"
              className="mr-2 leading-tight"
              checked={comunicacaoD2}
              onChange={(e) => setComunicacaoD2(e.target.checked)}
            />
            <label className="block text-gray-700 text-sm font-bold" htmlFor="comunicacaoD2">
              Comunicação D-2?
            </label>
          </div>

          {/* Almoço Escolhido */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="almocoEscolhidoId">
              Almoço Escolhido:
            </label>
            <select
              id="almocoEscolhidoId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={almocoEscolhidoId}
              onChange={(e) => setAlmocoEscolhidoId(e.target.value)}
            >
              <option value="">Selecione uma refeição</option>
              {refeicoes.map(refeicao => (
                <option key={refeicao.id} value={refeicao.id}>
                  {refeicao.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Termo de Marcação */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="termoMarcacao"
              className="mr-2 leading-tight"
              checked={termoMarcacao}
              onChange={(e) => setTermoMarcacao(e.target.checked)}
            />
            <label className="block text-gray-700 text-sm font-bold" htmlFor="termoMarcacao">
              Termo de Marcação?
            </label>
          </div>

          {/* Termo de Alta */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="termoAlta"
              className="mr-2 leading-tight"
              checked={termoAlta}
              onChange={(e) => setTermoAlta(e.target.checked)}
            />
            <label className="block text-gray-700 text-sm font-bold" htmlFor="termoAlta">
              Termo de Alta?
            </label>
          </div>

          {/* Comunicação D+1 */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="comunicacaoD1"
              className="mr-2 leading-tight"
              checked={comunicacaoD1}
              onChange={(e) => setComunicacaoD1(e.target.checked)}
            />
            <label className="block text-gray-700 text-sm font-bold" htmlFor="comunicacaoD1">
              Comunicação D+1?
            </label>
          </div>

          {/* Observações */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="observacoes">
              Observações:
            </label>
            <textarea
              id="observacoes"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Acompanhante */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="acompanhante">
              Acompanhante:
            </label>
            <input
              type="text"
              id="acompanhante"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={acompanhante}
              onChange={(e) => setAcompanhante(e.target.value)}
            />
          </div>

          {/* Telefone Acompanhante */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="telefoneAcompanhante">
              Telefone do Acompanhante:
            </label>
            <input
              type="text"
              id="telefoneAcompanhante"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={telefoneAcompanhante}
              onChange={(e) => setTelefoneAcompanhante(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => navigate('/agendamentos')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default AgendamentoForm;
