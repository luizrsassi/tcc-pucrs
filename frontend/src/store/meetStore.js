// store/meetStore.js
import { create } from "zustand";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/meets",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const meetHandler = create((set, get) => ({
  meets: [],
  currentMeet: null,
  error: null,
  loading: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalMeets: 0,
  },

  // Criar novo encontro
  createMeet: async (meetData) => {
    try {
      set({ loading: true, error: null });
      
      const { data } = await api.post('/', meetData);
      
      set(state => ({
        meets: [data, ...state.meets]
      }));

      return { 
        success: true, 
        data,
        message: 'Encontro criado com sucesso!' 
      };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Listar encontros com paginação
  listMeets: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      
      const { data } = await api.get('/', {
        params: {
          page: 1,
          limit: 10,
          ...params
        }
      });

      set({
        meets: data.meets,
        pagination: data.pagination
      });

      return { success: true, data: data.meets };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Atualizar encontro
  updateMeet: async (meetId, updates) => {
    try {
      set({ loading: true, error: null });
      
      const { data } = await api.put(`/${meetId}`, updates);
      
      set(state => ({
        meets: state.meets.map(meet => 
          meet._id === meetId ? data : meet
        ),
        currentMeet: data
      }));

      return { 
        success: true, 
        data,
        message: 'Encontro atualizado com sucesso!' 
      };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Excluir encontro
  deleteMeet: async (meetId) => {
    try {
      set({ loading: true, error: null });
      
      await api.delete(`/${meetId}`);
      
      set(state => ({
        meets: state.meets.filter(meet => meet._id !== meetId),
        currentMeet: null
      }));

      return { 
        success: true, 
        message: 'Encontro excluído com sucesso!' 
      };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Adicionar mensagem
  addMessage: async (meetId, text) => {
    try {
      set({ loading: true, error: null });
      
      const { data } = await api.post(`/${meetId}/messages`, { text });
      
      set(state => ({
        currentMeet: {
          ...state.currentMeet,
          discussions: [...state.currentMeet.discussions, data]
        }
      }));

      return { 
        success: true, 
        data,
        message: 'Mensagem adicionada com sucesso!' 
      };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Excluir mensagem
  deleteMessage: async (meetId, messageId) => {
    try {
      set({ loading: true, error: null });
      
      await api.delete(`/${meetId}/messages/${messageId}`);
      
      set(state => ({
        currentMeet: {
          ...state.currentMeet,
          discussions: state.currentMeet.discussions.filter(
            msg => msg._id !== messageId
          ),
          pinnedMessages: state.currentMeet.pinnedMessages.filter(
            id => id !== messageId
          )
        }
      }));

      return { 
        success: true, 
        message: 'Mensagem excluída com sucesso!' 
      };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Fixar mensagem
  pinMessage: async (meetId, messageId) => {
    try {
      set({ loading: true, error: null });
      
      const { data } = await api.post(`/${meetId}/pin/${messageId}`);
      
      set(state => ({
        currentMeet: {
          ...state.currentMeet,
          pinnedMessages: data.pinnedMessages
        }
      }));

      return { 
        success: true, 
        message: 'Mensagem fixada com sucesso!' 
      };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Desafixar mensagem
  unpinMessage: async (meetId, messageId) => {
    try {
      set({ loading: true, error: null });
      
      await api.delete(`/${meetId}/pin/${messageId}`);
      
      set(state => ({
        currentMeet: {
          ...state.currentMeet,
          pinnedMessages: state.currentMeet.pinnedMessages.filter(
            id => id !== messageId
          )
        }
      }));

      return { 
        success: true, 
        message: 'Mensagem desafixada com sucesso!' 
      };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Carregar detalhes de um encontro
  getMeetDetails: async (meetId) => {
    try {
      set({ loading: true, error: null });
      
      const { data } = await api.get(`/${meetId}`, {
        params: {
          populate: 'discussions.user,book,clubId'
        }
      });
      
      set({ currentMeet: data });

      return { 
        success: true, 
        data,
        message: 'Detalhes carregados com sucesso!' 
      };

    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Limpar estado atual
  clearCurrentMeet: () => set({ currentMeet: null }),
  clearError: () => set({ error: null })
}));