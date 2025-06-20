import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para incluir token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirecionar para login em caso de token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Serviços de autenticação
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },
  
  register: async (name: string, email: string, password: string, role: string) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getAll: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  }
};

// Serviços para pacientes
export const pacienteService = {
  getAll: async () => {
    const response = await api.get('/pacientes');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },
  
  create: async (paciente: any) => {
    console.log(paciente);
    const response = await api.post('/pacientes/', paciente);
    return response.data;
  },
  
  update: async (id: number, paciente: any) => {
    const response = await api.put(`/pacientes/${id}`, paciente);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/pacientes/${id}`);
    return response.data;
  }
};

// Serviços para contratos
export const contratoService = {
  getAll: async () => {
    const response = await api.get('/contratos');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/contratos/${id}`);
    return response.data;
  },
  
  getByPaciente: async (pacienteId: number) => {
    const response = await api.get(`/contratos/paciente/${pacienteId}`);
    return response.data;
  },
  
  create: async (contrato: any) => {
    const response = await api.post('/contratos', contrato);
    return response.data;
  },
  
  update: async (id: number, contrato: any) => {
    const response = await api.put(`/contratos/${id}`, contrato);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/contratos/${id}`);
    return response.data;
  },

  gerarClicksign: async (id: number) => {
    const response = await api.post(`/contratos/${id}/gerar-clicksign`);
    return response.data;
  }
};

// Serviços para fornecedores
export const fornecedorService = {
  getAll: async () => {
    const response = await api.get('/fornecedores');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/fornecedores/${id}`);
    return response.data;
  },
  
  create: async (fornecedor: any) => {
    const response = await api.post('/fornecedores', fornecedor);
    return response.data;
  },
  
  update: async (id: number, fornecedor: any) => {
    const response = await api.put(`/fornecedores/${id}`, fornecedor);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/fornecedores/${id}`);
    return response.data;
  }
};

// Serviços para lançamentos financeiros
export const lancamentoService = {
  getAll: async () => {
    const response = await api.get('/lancamentos');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/lancamentos/${id}`);
    return response.data;
  },
  
  getByContrato: async (contratoId: number) => {
    const response = await api.get(`/lancamentos/contrato/${contratoId}`);
    return response.data;
  },
  
  getByFornecedor: async (fornecedorId: number) => {
    const response = await api.get(`/lancamentos/fornecedor/${fornecedorId}`);
    return response.data;
  },
  
  create: async (lancamento: any) => {
    const response = await api.post('/lancamentos', lancamento);
    return response.data;
  },
  
  update: async (id: number, lancamento: any) => {
    const response = await api.put(`/lancamentos/${id}`, lancamento);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/lancamentos/${id}`);
    return response.data;
  }
};

// Serviços para Itens
export const itemService = {
  getAll: async () => {
    const response = await api.get('/itens');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/itens/${id}`);
    return response.data;
  },
  
  create: async (item: any) => {
    const response = await api.post('/itens', item);
    return response.data;
  },
  
  update: async (id: number, item: any) => {
    const response = await api.put(`/itens/${id}`, item);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/itens/${id}`);
    return response.data;
  }
};

// Serviços para Locais de Atendimento
export const localAtendimentoService = {
  getAll: async () => {
    const response = await api.get('/locais_atendimento');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/locais_atendimento/${id}`);
    return response.data;
  },
  
  create: async (local: any) => {
    const response = await api.post('/locais_atendimento', local);
    return response.data;
  },
  
  update: async (id: number, local: any) => {
    const response = await api.put(`/locais_atendimento/${id}`, local);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/locais_atendimento/${id}`);
    return response.data;
  }
};

// Serviços para Procedimentos
export const procedimentoService = {
  getAll: async () => {
    const response = await api.get('/procedimentos');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/procedimentos/${id}`);
    return response.data;
  },
  
  create: async (procedimento: any) => {
    const response = await api.post('/procedimentos', procedimento);
    return response.data;
  },
  
  update: async (id: number, procedimento: any) => {
    const response = await api.put(`/procedimentos/${id}`, procedimento);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/procedimentos/${id}`);
    return response.data;
  }
};

// Serviços para Equipes
export const equipeService = {
  getAll: async () => {
    const response = await api.get('/equipes');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/equipes/${id}`);
    return response.data;
  },
  
  create: async (equipe: any) => {
    const response = await api.post('/equipes', equipe);
    return response.data;
  },
  
  update: async (id: number, equipe: any) => {
    const response = await api.put(`/equipes/${id}`, equipe);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/equipes/${id}`);
    return response.data;
  }
};

// Serviços para Categorias de Procedimento
export const categoriaProcedimentoService = {
  getAll: async () => {
    const response = await api.get('/categorias_procedimento');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/categorias_procedimento/${id}`);
    return response.data;
  },
  
  create: async (categoria: any) => {
    const response = await api.post('/categorias_procedimento', categoria);
    return response.data;
  },
  
  update: async (id: number, categoria: any) => {
    const response = await api.put(`/categorias_procedimento/${id}`, categoria);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/categorias_procedimento/${id}`);
    return response.data;
  }
};

// Serviços para Refeições
export const refeicaoService = {
  getAll: async () => {
    const response = await api.get('/refeicoes');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/refeicoes/${id}`);
    return response.data;
  },
  
  create: async (refeicao: any) => {
    const response = await api.post('/refeicoes', refeicao);
    return response.data;
  },
  
  update: async (id: number, refeicao: any) => {
    const response = await api.put(`/refeicoes/${id}`, refeicao);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/refeicoes/${id}`);
    return response.data;
  }
};

// Serviços para Agendamentos
export const agendamentoService = {
  getAll: async () => {
    const response = await api.get('/agendamentos-cirurgicos');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/agendamentos-cirurgicos/${id}`);
    return response.data;
  },
  
  create: async (agendamento: any) => {
    const response = await api.post('/agendamentos-cirurgicos', agendamento);
    return response.data;
  },
  
  update: async (id: number, agendamento: any) => {
    const response = await api.put(`/agendamentos-cirurgicos/${id}`, agendamento);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/agendamentos-cirurgicos/${id}`);
    return response.data;
  },

  registrarServico: async (id: number, servico: string) => {
  const response = await api.post(`/agendamentos-cirurgicos/${id}/registrar-servico`, { servico });
  return response.data;
  },

  getByPeriodo: async (start: string, end: string) => {
    const response = await api.get('/agendamentos/por-periodo', {
      params: { start, end }
    });
    return response.data;
  }
};

// Serviços para Naturezas
export const naturezaService = {
  getAll: async () => {
    const response = await api.get('/naturezas');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/naturezas/${id}`);
    return response.data;
  },
  
  create: async (natureza: any) => {
    const response = await api.post('/naturezas', natureza);
    return response.data;
  },
  
  update: async (id: number, natureza: any) => {
    const response = await api.put(`/naturezas/${id}`, natureza);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/naturezas/${id}`);
    return response.data;
  }
  }

  // Serviços para Entradas de Estoque
export const entradaEstoqueService = {
  getAll: async () => {
    const response = await api.get('/entradas_estoque');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/entradas_estoque/${id}`);
    return response.data;
  },

  create: async (entrada: any) => {
    const response = await api.post('/entradas_estoque', entrada);
    return response.data;
  },

  update: async (id: number, entrada: any) => {
    const response = await api.put(`/entradas_estoque/${id}`, entrada);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/entradas_estoque/${id}`);
    return response.data;
  }
}


// Serviços para Consumos de Estoque
export const consumoEstoqueService = {
  getAll: async () => {
    const response = await api.get('/consumos_estoque');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/consumos_estoque/${id}`);
    return response.data;
  },

  create: async (consumo: any) => {
    const response = await api.post('/consumos_estoque', consumo);
    return response.data;
  },

  update: async (id: number, consumo: any) => {
    const response = await api.put(`/consumos_estoque/${id}`, consumo);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/consumos_estoque/${id}`);
    return response.data;
  }
};

// Serviços para Saídas de Estoque
export const saidaEstoqueService = {
  getAll: async () => {
    const response = await api.get('/saidas_estoque');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/saidas_estoque/${id}`);
    return response.data;
  },

  create: async (saida: any) => {
    const response = await api.post('/saidas_estoque', saida);
    return response.data;
  },

  update: async (id: number, saida: any) => {
    const response = await api.put(`/saidas_estoque/${id}`, saida);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/saidas_estoque/${id}`);
    return response.data;
  }
};

// Serviços para Estoque Atual
export const estoqueAtualService = {
  getAll: async () => {
    const response = await api.get('/estoque_atual'); // <-- corrigido aqui
    return response.data;
  }
};

// Tipo Tratamento
export const tipoTratamentoService = {
  getAll: async () => {
    const response = await api.get('/tipos-tratamento');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/tipos-tratamento/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/tipos-tratamento', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/tipos-tratamento/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/tipos-tratamento/${id}`);
    return response.data;
  }
};

// Serviço para PacoteTratamento
export const pacoteTratamentoService = {
  getAll: async () => {
    const response = await api.get('/pacotes-tratamento');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/pacotes-tratamento/${id}`);
    return response.data;
  },

  getByPaciente: async (pacienteId: number) => {
    const response = await api.get(`/pacotes-tratamento/paciente/${pacienteId}`);
    return response.data;
  },

  getPendentes: async () => {
    const response = await api.get('/pacotes-tratamento/pendentes');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/pacotes-tratamento', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/pacotes-tratamento/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/pacotes-tratamento/${id}`);
    return response.data;
  },

  incrementarSessao: async (id: number) => {
    const response = await api.post(`/pacotes-tratamento/${id}/incrementar-sessao`);
    return response.data;
  }
};


// Serviço para AgendamentoSessao
export const agendamentoSessaoService = {
  getAll: async () => {
    const response = await api.get('/agendamentos-sessao');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/agendamentos-sessao/${id}`);
    return response.data;
  },

  getByPaciente: async (pacienteId: number) => {
    const response = await api.get(`/agendamentos-sessao/paciente/${pacienteId}`);
    return response.data;
  },

  getByPacote: async (pacoteId: number) => {
    const response = await api.get(`/agendamentos-sessao/pacote/${pacoteId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/agendamentos-sessao', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/agendamentos-sessao/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/agendamentos-sessao/${id}`);
    return response.data;
  },

  marcarRealizada: async (id: number) => {
    const response = await api.post(`/agendamentos-sessao/${id}/marcar-realizada`);
    return response.data;
  }
};


// Agendamento Cirurgico
export const agendamentoCirurgicoService = {
  getAll: async () => {
    const response = await api.get('/agendamentos-cirurgicos');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/agendamentos-cirurgicos/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/agendamentos-cirurgicos', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/agendamentos-cirurgicos/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/agendamentos-cirurgicos/${id}`);
    return response.data;
  },

  registrarServico: async (id: number, servico: string) => {
    const response = await api.post(`/agendamentos-cirurgicos/${id}/registrar-servico`, { servico });
    return response.data;
  }
};

export const boletoService = {
  emitir: async (data: any) => {
    const response = await api.post('/boletos/emitir', data);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/boletos/${id}`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/boletos');
    return response.data;
  }
};