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
      </Routes>
    </Router>
  );
}

export default App;
