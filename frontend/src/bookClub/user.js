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
  }
}));