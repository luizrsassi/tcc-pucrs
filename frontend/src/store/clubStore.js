// store/clubStore.js
import { create } from "zustand";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/clubs", // Endpoint base para clubes
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

export const clubHandler = create((set, get) => ({
  clubs: [],
  currentClub: null,
  error: null,
  loading: false,
  currentPage: 1,
  totalPages: 1,

  // Ação para criar novo clube
  createClub: async (clubData, bannerFile) => {
    try {
      set({ loading: true, error: null });
      
      const formData = new FormData();
      formData.append('name', clubData.name);
      formData.append('description', clubData.description);
      formData.append('rules', clubData.rules);
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const { data } = await api.post('/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      set(state => ({
        clubs: [data.club, ...state.clubs]
      }));

      return { 
        success: true, 
        data: data.club,
        message: 'Clube criado com sucesso!' 
      };
      
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Ação para listar clubes com paginação
  listClubs: async (page = 1, search = '', sortBy = 'createdAt', sortOrder = 'desc') => {
    try {
      set({ loading: true, error: null });
      
      const { data } = await api.get('/', {
        params: {
          page,
          search,
          sortBy,
          sortOrder
        }
      });

      set({ 
        clubs: data.clubs,
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages
      });

      return { success: true, data: data.clubs };
      
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Ação para atualizar clube
  updateClub: async (clubId, updateData, bannerFile) => {
    try {
      set({ loading: true, error: null });
      
      const formData = new FormData();
      if (updateData.name) formData.append('name', updateData.name);
      if (updateData.description) formData.append('description', updateData.description);
      if (updateData.rules) formData.append('rules', updateData.rules);
      if (bannerFile) formData.append('banner', bannerFile);

      const { data } = await api.put(`/${clubId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      set(state => ({
        clubs: state.clubs.map(club => 
          club._id === clubId ? data.club : club
        ),
        currentClub: data.club
      }));

      return { 
        success: true, 
        data: data.club,
        message: 'Clube atualizado com sucesso!' 
      };
      
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Ação para deletar clube
  deleteClub: async (clubId) => {
    try {
      set({ loading: true, error: null });
      
      await api.delete(`/${clubId}`);

      set(state => ({
        clubs: state.clubs.filter(club => club._id !== clubId),
        currentClub: null
      }));

      return { 
        success: true, 
        message: 'Clube excluído com sucesso!' 
      };
      
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Ação para adicionar membro
  addMember: async (clubId, memberId) => {
    try {
      set({ loading: true, error: null });
      
      const { data } = await api.post(`/${clubId}/members`, { memberId });

      set(state => ({
        clubs: state.clubs.map(club => 
          club._id === clubId ? data.club : club
        ),
        currentClub: data.club
      }));

      return { 
        success: true, 
        data: data.club,
        message: 'Membro adicionado com sucesso!' 
      };
      
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Ação para remover membro
  removeMember: async (clubId, memberId) => {
    try {
      set({ loading: true, error: null });
      
      const { data } = await api.delete(`/${clubId}/members/${memberId}`);

      set(state => ({
        clubs: state.clubs.map(club => 
          club._id === clubId ? data.club : club
        ),
        currentClub: data.club
      }));

      return { 
        success: true, 
        data: data.club,
        message: 'Membro removido com sucesso!' 
      };
      
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  // Ação para limpar erros
  clearError: () => set({ error: null })
}));