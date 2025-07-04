import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  loading: false,

  setAuth: (authStatus, userData) =>
    set({
      isAuthenticated: authStatus,
      user: userData,
    }),

  setLoading: (status) =>
    set({
      loading: status,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),
}));

export default useAuthStore;
