import { create } from 'zustand'

export const useAuth = create((set)=> ({
  user: null,
  token: localStorage.getItem('token'),
  login(u, t){ localStorage.setItem('token', t); set({ user:u, token:t }); },
  logout(){ localStorage.removeItem('token'); set({ user:null, token:null }); }
}))
