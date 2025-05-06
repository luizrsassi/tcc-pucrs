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
  user: JSON.parse(localStorage.getItem("user")) || null,
  error: null,
  loading: true,

  initializeUser: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token");
      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (savedUser) set({ user: savedUser });
      
      if (!token) {
        set({ loading: false });
        return;
      }

      const response = await api.get("/users/profile");
      const userData = response.data.data;

      localStorage.setItem("user", JSON.stringify(userData));

      set({ user: userData, loading: false });
      
    } catch (error) {
      console.error("Erro na inicialização:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, loading: false });
    }
  },

  fetchUserProfile: async () => {
    try {
      set({ loadingUser: true, error: null });
      
      const response = await api.get("users/profile");
      const userData = response.data.data;
  
      // Atualiza localStorage e estado
      localStorage.setItem("user", JSON.stringify(userData));
      set({ user: userData, loadingUser: false });
  
      return { 
        success: true, 
        data: userData,
        message: 'Perfil atualizado com sucesso' 
      };
  
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message, loadingUser: false });
      return { 
        success: false, 
        message: message || 'Erro ao buscar perfil' 
      };
    }
  },
  
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

      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user });

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

  // ========== NOVO MÉTODO ========== //
  updateUser: async (updatedData) => {
    try {
      set({ loading: true });
      
      const formData = new FormData();
      if (updatedData.name) formData.append('name', updatedData.name);
      if (updatedData.photo) formData.append('photo', updatedData.photo);
      
      const { data } = await api.patch("/profile", formData);
      
      // Atualiza localStorage
      localStorage.setItem("user", JSON.stringify(data));
      set({ user: data });
      
      return { success: true, message: "Perfil atualizado!" };
      
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // loginUser: async (credentials) => {
  //   try {
  //     set({ loading: true, error: null });

  //     // Validação
  //     if (!credentials.email || !credentials.password) {
  //       throw new Error("Preencha todos os campos");
  //     }

  //     // Requisição com Axios
  //     const { data } = await api.post("/users/login", credentials);
      
  //     // Armazenar token e atualizar estado
  //     localStorage.setItem("token", data.token);
  //     set({ user: data.user, error: null });

  //     return { success: true, message: "Login realizado com sucesso!" };

  //   } catch (error) {
  //     const message = error.response?.data?.error || error.message;
  //     set({ error: message });
  //     return { success: false, message };
  //   } finally {
  //     set({ loading: false });
  //   }
  // },
  // ========== MÉTODOS MODIFICADOS ========== //
  loginUser: async (credentials) => {
    try {
      set({ loading: true, error: null });

      const { data } = await api.post("/users/login", credentials);
    
      // Armazena dados no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Novo
      
      set({ user: data.user, error: null });
      return { success: true, message: "Login realizado com sucesso!" };

    } catch (error) {
      // ... (existente)
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