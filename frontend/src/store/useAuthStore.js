import { create } from 'zustand';

const useAuthStore = create((set,get) => ({
  isAuthenticated: false,
  user: null,
  loading: false,

  setAuth: (authStatus, userData) =>
    set({
      isAuthenticated: authStatus,
      user: userData,
      // NEW: We'll now store organisation information
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

 // UPDATED: Handle both string and number organisation IDs
 isOrganizationMember: () => {
  const state = get();
  const orgId = state.user?.organisation_id;
  
  if (!orgId) return false;
  
  // If orgId is a number, check if > 1
  // If orgId is a string and not "1", it's an organisation member
  if (typeof orgId === 'number') {
    return orgId > 1;
  } else if (typeof orgId === 'string') {
    return orgId !== '1' && orgId !== '1';
  }
  
  return false;
},

getOrganizationId: () => {
  const state = get();
  return state.user?.organisation_id || '1';
},

isSuperAdmin: () => {
  const state = get();
  return state.user?.role === 'super_admin';
},

hasPermission: (permission) => {
  const state = get();
  return state.user?.permissions?.includes(permission) || false;
}
}));

export default useAuthStore;