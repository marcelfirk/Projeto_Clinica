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
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
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
