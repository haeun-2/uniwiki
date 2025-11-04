export type Role = 'ADMIN' | 'USER' | '';

export const getStoredAuth = () => {
  const accessToken = localStorage.getItem('accessToken');
  const role = (localStorage.getItem('role') || '').toUpperCase() as Role;
  return {
    isLoggedIn: !!accessToken,
    role: role || '',
  };
};

export const isAdmin = () => getStoredAuth().role === 'ADMIN';
