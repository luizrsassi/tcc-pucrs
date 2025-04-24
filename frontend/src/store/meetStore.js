// store/meetStore.js
import { create } from "zustand";
import axios from "axios";

const api = axios.create({
baseURL: "http://localhost:5000/api/meet",
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
    pagination: {
      currentPage: 1,
      totalPages: 1
    },
    loading: false,
    error: null,

    // Criar novo encontro
    createMeet: async (meetData) => {
        try {
        set({ loading: true, error: null });
        
        const { data } = await api.post('/:meetId/post', meetData);
        
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

    getMeetById: async (meetId) => { // Recebe o ID como parâmetro
        try {
        set({ loadingMeet: true, error: null });

        const response = await api.get(`/${meetId}`);

        if (!response.data.success) {
            throw new Error(response.data.message || "Meet não encontrado");
        }

        set({ 
            currentMeet: response.data.data,
            error: null, 
            loadingMeet: false
        });

        return { 
            success: true,
            data: response.data.data,
            message: response.data.message 
        };

        } catch (error) {
        const message = error.response?.data?.message || 
                        error.message || 
                        "Erro ao carregar meet";
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

        const response = await api.get('/list', {
            params: {
            page: params.page || 1,
            limit: params.limit || 9,
            search: params.search || ''
            }
        });
        
        set({
            meets: response.data.data.meets,
            pagination: response.data.data.pagination
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
            
            const formattedUpdates = {
            ...updates,
            datetime: new Date(updates.datetime).toISOString()
            };

            const response = await api.put(`/${meetId}`, formattedUpdates);
            const updatedMeet = response.data.data;
        
            set(state => ({
                meets: state.meets.map(meet => 
                meet._id === meetId ? updatedMeet : meet
            ),
                currentMeet: updatedMeet
            }));
        
            return { 
                success: true, 
                data: updatedMeet,
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

    addMessage: async (meetId, text) => {
        try {
            set({ loading: true, error: null });
            
            // 1. Fazer requisição para a API
            const response = await api.post(`/${meetId}/post`, { text });
            
            // 2. Extrair mensagem da resposta
            const newMessage = response.data.data;
            
            // 3. Atualizar estado otimista
            set(state => ({
                currentMeet: {
                ...state.currentMeet,
                discussions: [...(state.currentMeet?.discussions || []), newMessage]
                }
            }));
        
            return { 
                success: true,
                data: newMessage,
                message: 'Mensagem enviada com sucesso!'
            };
    
        } catch (error) {
            // 4. Tratamento de erros específicos
            let message = 'Erro ao enviar mensagem';
            
            if (error.response) {
                message = error.response.data.message || message;
                
                // Tratar erro de permissão especificamente
                if (error.response.status === 403) {
                message = "Apenas membros podem enviar mensagens";
                }
            }
        
            set({ error: message });
            return { 
                success: false, 
                message,
                errorType: error.response?.status
            };
        
        } finally {
            set({ loading: false });
        }
    },

    // Excluir mensagem
    deleteMessage: async (meetId, messageId) => {
        try {
        set({ loading: true, error: null });
        
        await api.delete(`/${meetId}/post/${messageId}`);
        
        set(state => ({
            currentMeet: {
            ...state.currentMeet,
            discussions: (state.currentMeet?.discussions || []).filter(
                msg => msg._id !== messageId
            ),
            pinnedMessages: (state.currentMeet?.pinnedMessages || []).filter(
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

    // Listar as mensagens de um encontro específico
    getMeetMessages: async (meetId) => {
        try {
            set({ loadingMessages: true, error: null });
            const { data } = await api.get(`/${meetId}/messages`);
            
            // Atualiza o estado com as mensagens e IDs das fixadas
            set(state => ({
                currentMeet: {
                ...state.currentMeet,
                discussions: data.data.messages,
                pinnedMessages: (data.data.messages || [])
                    .filter(msg => msg.isPinned)
                    .map(msg => msg._id)
                },
                loadingMessages: false
            }));

            return { 
                success: true, 
                data: data.data.messages,
                message: 'Mensagens carregadas com sucesso'
            };
            } 
            catch (error) {
                const message = error.response?.data?.message || error.message;
                set({ error: message });
            return { success: false, message };
            }  
            finally {
                set({ loading: false });
            }
    },

    // Limpar estado atual
    clearCurrentMeet: () => set({ currentMeet: null }),
    clearError: () => set({ error: null })
}));