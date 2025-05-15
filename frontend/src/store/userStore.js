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

export const userHandler = create((set, get) => ({
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

  updateUser: async (updatedData) => {
    try {
      const { user } = get();
      user._id = user._id || user.id;
      if (user.id) delete user.id;
      if (!user?._id) {
        throw new Error('Usuário não autenticado');
      }
      set({ loading: true, error: null });
      
      // Verifica se está tentando alterar a senha
      if (updatedData.newPassword || updatedData.confirmPassword) {
        // Validação 1: Senha atual é obrigatória
        if (!updatedData.currentPassword) {
          return { 
            success: false, 
            message: "Por favor, informe sua senha atual" 
          };
        }
      
        // Validação 2: Nova senha e confirmação devem ser iguais
        if (updatedData.newPassword !== updatedData.confirmPassword) {
          return {
            success: false,
            message: "A nova senha e a confirmação não coincidem"
          };
        }
      }
      const formData = new FormData();
      
      // Campos básicos
      if (updatedData.name) formData.append('name', updatedData.name);
      if (updatedData.email) formData.append('email', updatedData.email);
      
      // Campos de senha (apenas se houver alteração)
      if (updatedData.currentPassword) formData.append('currentPassword', updatedData.currentPassword);
      if (updatedData.newPassword) formData.append('newPassword', updatedData.newPassword);
      
      // Foto (se houver)
      if (updatedData.photo instanceof File) {
        formData.append('photo', updatedData.photo);
      }
      
      // Chamada API
      const { data } = await api.put(`/users/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const normalizedData = {
        ...data,
        _id: data._id || data.id || user._id
      };

      // Atualizar storage e estado (limpar senhas)
      const updatedUser = { 
        ...user,
        ...normalizedData,
        token: user.token
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
      
      return { success: true, message: "Perfil atualizado com sucesso!" };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

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

  removeClubFromUser: (clubId) => {
    set(state => ({
      user: {
        ...state.user,
        memberClubs: state.user.memberClubs.filter(id => id !== clubId),
        adminClubs: state.user.adminClubs.filter(id => id !== clubId)
      }
    }));
  },

  deleteUser: async (userId) => {
    try {
      set({ loading: true });
      const { data } = await api.delete(`/users/${userId}`);
      
      // Limpa o estado do usuário
      localStorage.removeItem("user");
      set({ user: null });
      
      return { success: true, message: data.message };
      
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  }

}));