// API Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface DeleteProductResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  isDeleted: boolean;
  deletedOn: string;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  BiometricUnlock: undefined;
};

export type MainTabParamList = {
  AllProducts: undefined;
  SpecificCategory: undefined;
  SignOut: undefined;
};

// Redux Types
export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  superAdminUsername: string;
}

export interface LockState {
  isLocked: boolean;
  lastActivityTime: number;
}

// Storage Keys
export enum StorageKeys {
  AUTH_TOKEN = 'auth_token',
  USER = 'user',
  SUPERADMIN_USERNAME = 'superadmin_username',
}
