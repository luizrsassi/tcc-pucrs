// store/clubStore.js
import { create } from "zustand";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/clubs",
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
      console.log(clubData.rules);
      const formData = new FormData();
      formData.append('name', clubData.name);
      formData.append('description', clubData.description);
      formData.append('rules', clubData.rules);
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const { data } = await api.post('/create', formData, {
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
        clubs: data.data.clubs,
        currentPage: data.data.pagination.currentPage,
        totalPages: data.data.pagination.totalPages
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

  // Nova função para reuniões de um clube específico
  listClubMeets: async (clubId, page = 1, search = '', sortBy = 'datetime', sortOrder = 'asc') => {
    try {
      set({ loading: true, error: null });

      const { data } = await api.get(`/${clubId}/meets`, {
        params: {
          page,
          search,
          sortBy,
          sortOrder
        }
      });

      set({ 
        clubMeets: data.data.meets,
        currentPage: data.data.pagination.currentPage,
        totalPages: data.data.pagination.totalPages
      });

      return { 
        success: true, 
        data: data.data,
        message: data.message 
      };

    } catch (error) {
        const message = error.response?.data?.message || error.message;
        set({ error: message });
      return { 
        success: false, 
        message,
        errorCode: error.response?.status 
      };
    } finally {
        set({ loading: false });
    }
  },

  // Ação para atualizar clube
  updateClub: async (clubId, updateData, bannerFile) => {
    try {
      set({ loading: true, error: null });
      
      const formData = new FormData();
      
      // Adiciona campos textuais
      if (updateData.name) formData.append('name', updateData.name);
      if (updateData.description) formData.append('description', updateData.description);
      
      // Adiciona regras como array
      if (updateData.rules) {
        updateData.rules.forEach((rule, index) => {
          formData.append(`rules[${index}]`, rule);
        });
      }
      
      // Adiciona arquivo de banner se existir
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }
  
      const { data } = await api.put(`/update/${clubId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      set(state => ({
        clubs: state.clubs.map(club => 
          club._id === clubId ? data.data : club
        ),
        currentClub: data.data
      }));
  
      return { 
        success: true, 
        data: data.data,
        message: data.message 
      };
      
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      let errorCode = null;
      
      // Tratamento específico de erros
      if (error.response) {
        errorCode = error.response.status;
        switch (errorCode) {
          case 403:
            message = 'Você não tem permissão para editar este clube';
            break;
          case 404:
            message = 'Clube não encontrado';
            break;
        }
      }
      
      set({ error: message });
      return { 
        success: false, 
        message,
        errorCode 
      };
    } finally {
      set({ loading: false });
    }
  },

  // Ação para deletar clube
  deleteClub: async (clubId) => {
    try {
      set({ loading: true, error: null });
      const response = await api.delete(`/delete/${clubId}`);
      
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Erro ao excluir clube');
      
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Ação para adicionar membro
  addMember: async (clubId, memberId) => {
    try {
      set({ loading: true });
      const { data } = await api.patch(`/${clubId}/members`, { memberId });
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    } finally {
      set({ loading: false });
    }
  },

  getClubById: async (clubId) => {
    try {
        set({ loading: true });
        const response = await api.get(`${clubId}`);
        set({ currentClub: response.data.data });
        return response.data;
      } catch (error) {
        set({ error: error.message });
        throw error;
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