import { create } from "zustand";
import axios from "axios";

// Configuração do Axios
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userHandler = create((set) => ({
  user: null,
  error: null,
  loading: false,
  
  // Ações
  registerUser: async (newUser) => {
    try {
      set({ loading: true, error: null });
      
      // Validação
      if (!newUser.name || !newUser.email || !newUser.password) {
        throw new Error("Preencha todos os campos obrigatórios");
      }

      // FormData para upload de arquivo
      const formData = new FormData();
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('password', newUser.password);
      if (newUser.photo) {
        formData.append('photo', newUser.photo);
      }

      // Requisição com Axios
      const { data } = await api.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { 
        success: true, 
        message: "Usuário registrado com sucesso!",
        user: data.user 
      };
      
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  loginUser: async (credentials) => {
    try {
      set({ loading: true, error: null });

      // Validação
      if (!credentials.email || !credentials.password) {
        throw new Error("Preencha todos os campos");
      }

      // Requisição com Axios
      const { data } = await api.post("/users/login", credentials);
      
      // Armazenar token e atualizar estado
      localStorage.setItem("token", data.token);
      set({ user: data.user, error: null });

      return { success: true, message: "Login realizado com sucesso!" };

    } catch (error) {
      const message = error.response?.data?.error || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  logoutUser: async () => {
    try {
      set({ loading: true, error: null });
      
      // Chamar endpoint de logout no backend
      await api.post('/users/logout');
      
      // Limpar dados do client-side
      localStorage.removeItem("token");
      set({ user: null, error: null });
      
      return { success: true, message: 'Logout realizado com sucesso' };
      
    } catch (error) {
      // Mesmo em caso de erro, garantir logout local
      localStorage.removeItem("token");
      set({ user: null });
      
      const message = error.response?.data?.message || error.message;
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },
}));