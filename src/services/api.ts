import axios, { AxiosInstance, AxiosError } from 'axios';
import { LoginRequest, LoginResponse, User, ProductsResponse, DeleteProductResponse } from '@/types';
import { StorageUtils, StorageKeys } from '@/utils/storage';

const API_BASE_URL = 'https://dummyjson.com';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = StorageUtils.getString(StorageKeys.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      StorageUtils.delete(StorageKeys.AUTH_TOKEN);
      StorageUtils.delete(StorageKeys.USER);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAllProducts: async (limit = 30, skip = 0): Promise<ProductsResponse> => {
    const response = await apiClient.get<ProductsResponse>(`/products?limit=${limit}&skip=${skip}`);
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/products/categories');
    return response.data;
  },

  getProductsByCategory: async (category: string, limit = 30, skip = 0): Promise<ProductsResponse> => {
    const response = await apiClient.get<ProductsResponse>(
      `/products/category/${category}?limit=${limit}&skip=${skip}`
    );
    return response.data;
  },

  deleteProduct: async (id: number): Promise<DeleteProductResponse> => {
    const response = await apiClient.delete<DeleteProductResponse>(`/products/${id}`);
    return response.data;
  },
};

export { StorageKeys };
