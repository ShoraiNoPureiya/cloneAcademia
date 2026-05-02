import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5227';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('academia.token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('academia.token');
      window.dispatchEvent(new Event('academia:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error) {
  if (error?.response?.status === 401) {
    return 'Sua sessao expirou. Entre novamente para continuar.';
  }

  const validationErrors = error?.response?.data?.errors;

  if (validationErrors) {
    return Object.values(validationErrors).flat().join(' ');
  }

  return (
    error?.response?.data?.detail ||
    error?.response?.data?.title ||
    error?.message ||
    'Nao foi possivel concluir a acao.'
  );
}
