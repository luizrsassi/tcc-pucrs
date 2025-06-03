import { create } from "zustand";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/books",
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

export const bookHandler = create((set, get) => ({
  books: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
    hasNextPage: false
  },
  loadingBooks: false,
  error: null,

  listBooks: async (params = {}) => {
    try {
      set({ loadingBooks: true, error: null });
      
      const response = await api.get("/list", {
        params: {
          page: params.page || 1,
          limit: params.limit || 9,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          author: params.author,
          userId: params.userId
        }
      });

      if (!response.data.success) throw new Error(response.data.message);

      set({
        books: response.data.data.books,
        pagination: response.data.data.pagination,
        loadingBooks: false
      });

      return { 
        success: true, 
        data: response.data.data,
        message: response.data.message 
      };

    } catch (error) {
      let message = 'Erro ao carregar livros';
      if (error.response) {
        message = error.response.data.message || message;
        if (error.response.data.details) {
          message += `: ${error.response.data.details}`;
        }
      }
      
      set({ 
        error: message,
        loadingBooks: false 
      });
      
      return { 
        success: false, 
        message,
        status: error.response?.status || 500
      };
    }
  },

  searchBooks: async (searchTerm) => {
    return get().listBooks({
      search: searchTerm,
      limit: 1000,
      sortBy: 'title',
      sortOrder: 'asc'
    });
  },

  getBookById: async (bookId) => {
    try {

      const response = await api.get(`/${bookId}`);
      
      if (!response.data.success) throw new Error(response.data.message);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  },

  clearBooks: () => set({ 
    books: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalBooks: 0,
      hasNextPage: false
    }
  })
}));