import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';

// Importação de páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import PacienteForm from './pages/PacienteForm';
import Contratos from './pages/Contratos';
import ContratoForm from './pages/ContratoForm';
import Fornecedores from './pages/Fornecedores';
import FornecedorForm from './pages/FornecedorForm';
import Lancamentos from './pages/Lancamentos';
import LancamentoForm from './pages/LancamentoForm';
import Itens from './pages/Itens';
import ItensForm from './pages/ItensForms';
import LocaisAtendimento from './pages/LocaisAtendimento';
import LocalAtendimentoForm from './pages/LocalAtendimentoForm';
import Procedimentos from './pages/Procedimentos';
import ProcedimentoForm from './pages/ProcedimentoForm';
import Equipes from './pages/Equipes';
import EquipeForm from './pages/EquipeForm';
import CategoriasProcedimento from './pages/CategoriasProcedimento';
import CategoriaProcedimentoForm from './pages/CategoriaProcedimentoForm';
import Refeicoes from './pages/Refeicoes';
import RefeicaoForm from './pages/RefeicaoForm';
import Agendamentos from './pages/Agendamentos';
import AgendamentoForm from './pages/AgendamentoForm';
import Calendario from './pages/Calendario';
import Naturezas from './pages/Naturezas';
import NaturezaForm from './pages/NaturezaForm';
import EntradasEstoque from './pages/EntradasEstoque';
import NovaEntradaEstoque from './pages/EntradaEstoqueForm'
import SaidasEstoque from './pages/SaidasEstoque';
import SaidaEstoqueForm from './pages/SaidaEstoqueForm';
import EstoqueAtual from './pages/EstoqueAtual';

// Componente para rotas protegidas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rotas protegidas */}
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* Agendamentos */}
        <Route path="/agendamentos" element={
          <PrivateRoute>
            <Agendamentos />
          </PrivateRoute>
        } />
        <Route path="/agendamentos/novo" element={
          <PrivateRoute>
            <AgendamentoForm />
          </PrivateRoute>
        } />
        <Route path="/agendamentos/:id" element={
          <PrivateRoute>
            <AgendamentoForm />
          </PrivateRoute>
        } />

        {/* Pacientes */}
        <Route path="/pacientes" element={
          <PrivateRoute>
            <Pacientes />
          </PrivateRoute>
        } />
        <Route path="/pacientes/novo" element={
          <PrivateRoute>
            <PacienteForm />
          </PrivateRoute>
        } />
        <Route path="/pacientes/:id" element={
          <PrivateRoute>
            <PacienteForm />
          </PrivateRoute>
        } />
        
        {/* Contratos */}
        <Route path="/contratos" element={
          <PrivateRoute>
            <Contratos />
          </PrivateRoute>
        } />
        <Route path="/contratos/novo" element={
          <PrivateRoute>
            <ContratoForm />
          </PrivateRoute>
        } />
        <Route path="/contratos/:id" element={
          <PrivateRoute>
            <ContratoForm />
          </PrivateRoute>
        } />
        
        {/* Fornecedores */}
        <Route path="/fornecedores" element={
          <PrivateRoute>
            <Fornecedores />
          </PrivateRoute>
        } />
        <Route path="/fornecedores/novo" element={
          <PrivateRoute>
            <FornecedorForm />
          </PrivateRoute>
        } />
        <Route path="/fornecedores/:id" element={
          <PrivateRoute>
            <FornecedorForm />
          </PrivateRoute>
        } />
        
        {/* Lançamentos Financeiros */}
        <Route path="/lancamentos" element={
          <PrivateRoute>
            <Lancamentos />
          </PrivateRoute>
        } />
        <Route path="/lancamentos/novo" element={
          <PrivateRoute>
            <LancamentoForm />
          </PrivateRoute>
        } />
        <Route path="/lancamentos/:id" element={
          <PrivateRoute>
            <LancamentoForm />
          </PrivateRoute>
        } />

        {/* Itens */}
        <Route path="/itens" element={
          <PrivateRoute>
            <Itens />
          </PrivateRoute>
        } />
        <Route path="/itens/novo" element={
          <PrivateRoute>
            <ItensForm />
          </PrivateRoute>
        } />
        <Route path="/itens/:id" element={
          <PrivateRoute>
            <ItensForm />
          </PrivateRoute>
        } />

        {/* Locais de Atendimento */}
        <Route path="/locais-atendimento" element={
          <PrivateRoute>
            <LocaisAtendimento />
          </PrivateRoute>
        } />
        <Route path="/locais-atendimento/novo" element={
          <PrivateRoute>
            <LocalAtendimentoForm />
          </PrivateRoute>
        } />
        <Route path="/locais-atendimento/:id" element={
          <PrivateRoute>
            <LocalAtendimentoForm />
          </PrivateRoute>
        } />

        {/* Procedimentos */}
        <Route path="/procedimentos" element={
          <PrivateRoute>
            <Procedimentos />
          </PrivateRoute>
        } />
        <Route path="/procedimentos/novo" element={
          <PrivateRoute>
            <ProcedimentoForm />
          </PrivateRoute>
        } />
        <Route path="/procedimentos/:id" element={
          <PrivateRoute>
            <ProcedimentoForm />
          </PrivateRoute>
        } />

        {/* Equipes */}
        <Route path="/equipes" element={
          <PrivateRoute>
            <Equipes />
          </PrivateRoute>
        } />
        <Route path="/equipes/novo" element={
          <PrivateRoute>
            <EquipeForm />
          </PrivateRoute>
        } />
        <Route path="/equipes/:id" element={
          <PrivateRoute>
            <EquipeForm />
          </PrivateRoute>
        } />

        {/* Categorias de Procedimento */}
        <Route path="/categorias-procedimento" element={
          <PrivateRoute>
            <CategoriasProcedimento />
          </PrivateRoute>
        } />
        <Route path="/categorias-procedimento/novo" element={
          <PrivateRoute>
            <CategoriaProcedimentoForm />
          </PrivateRoute>
        } />
        <Route path="/categorias-procedimento/:id" element={
          <PrivateRoute>
            <CategoriaProcedimentoForm />
          </PrivateRoute>
        } />

        {/* Refeições */}
        <Route path="/refeicoes" element={
          <PrivateRoute>
            <Refeicoes />
          </PrivateRoute>
        } />
        <Route path="/refeicoes/novo" element={
          <PrivateRoute>
            <RefeicaoForm />
          </PrivateRoute>
        } />
        <Route path="/refeicoes/:id" element={
          <PrivateRoute>
            <RefeicaoForm />
          </PrivateRoute>
        } />
        {/* Calendário */}
        <Route path="/calendario" element={
          <PrivateRoute>
            <Calendario />
          </PrivateRoute>
        } />
        {/* Naturezas */}
        <Route path="/naturezas" element={
          <PrivateRoute>
            <Naturezas />
          </PrivateRoute>
        } />
        <Route path="/naturezas/novo" element={
          <PrivateRoute>
            <NaturezaForm />
          </PrivateRoute>
        } />
        <Route path="/naturezas/:id" element={
          <PrivateRoute>
            <NaturezaForm />
          </PrivateRoute>
        } />
        {/* Entradas de Estoque */}
        <Route path="/entradas-estoque" element={
          <PrivateRoute>
            <EntradasEstoque />
          </PrivateRoute>
        } />
        <Route path="/entradas-estoque/nova" element={
          <PrivateRoute>
            <NovaEntradaEstoque />
          </PrivateRoute>
        } />
        <Route path="/entradas-estoque/:id" element={
          <PrivateRoute>
            <NovaEntradaEstoque />
          </PrivateRoute>
        } />
        {/* Saídas de Estoque */}
        <Route path="/saidas-estoque" element={
          <PrivateRoute>
            <SaidasEstoque />
          </PrivateRoute>
        } />
        <Route path="/saidas-estoque/nova" element={
          <PrivateRoute>
            <SaidaEstoqueForm />
          </PrivateRoute>
        } />
        <Route path="/saidas-estoque/:id" element={
          <PrivateRoute>
            <SaidaEstoqueForm />
          </PrivateRoute>
        } />
        {/* Estoque atual */}
        <Route path="/estoque-atual" element={
          <PrivateRoute>
            <EstoqueAtual />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;