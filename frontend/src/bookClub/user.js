import { create } from "zustand";

export const userHandler = create((set) => ({
  user: {},
  error: null,
  loading: false,
  
  setUser: (user) => set({ user }),
  
  registerUser: async (newUser) => {
    try {
      set({ loading: true, error: null });
      
      if (!newUser.name || !newUser.email || !newUser.password) {
        throw new Error("Preencha todos os campos obrigatórios");
      }

      const formData = new FormData();
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('password', newUser.password);
      if (newUser.photo) {
        formData.append('photo', newUser.photo);
      }

      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro no registro');
      }

      return { 
        success: true, 
        message: "Usuário registrado com sucesso!",
        user: data 
      };
      
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    } finally {
      set({ loading: false });
    }
  },
  loginUser: async (credentials) => {
    try {
      set({ loading: true, error: null });
      
      if (!credentials.email || !credentials.password) {
        throw new Error("Preencha todos os campos");
      }

      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Credenciais inválidas');

      // Atualiza estado e armazena token
      localStorage.setItem('token', data.token);
      set({ 
        user: data.user, 
        token: data.token,
        error: null 
      });

      return { success: true, message: "Login realizado com sucesso!" };

    } catch (error) {
      set({ error: error.message });
      return { success: false, message: error.message };
    } finally {
      set({ loading: false });
    }
  },
}));