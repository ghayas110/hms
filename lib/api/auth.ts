import { api } from './axios';
import type {
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    ApiResponse,
    Doctor,
    Patient,
} from './types';

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const authService = {
    /**
     * Register a new user (patient, doctor, cashier, pharmacist, or lab tech)
     */
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);

        // Store token and user data
        if (response.data.token) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response.data;
    },

    /**
     * Login user
     */
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);

        // Store token and user data
        if (response.data.token) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response.data;
    },

    /**
     * Logout user
     */
    logout: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    },

    /**
     * Get current user from localStorage
     */
    getCurrentUser: () => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('token');
        }
        return false;
    },

    /**
     * Get all doctors with pagination
     */
    getAllDoctors: async (page: number = 1, limit: number = 100): Promise<PaginatedResponse<Doctor>> => {
        const response = await api.get<PaginatedResponse<Doctor>>('/auth/doctors', {
            params: { page, limit }
        });
        return response.data;
    },

    /**
     * Get all patients with pagination
     */
    getAllPatients: async (page: number = 1, limit: number = 100): Promise<PaginatedResponse<Patient>> => {
        const response = await api.get<PaginatedResponse<Patient>>('/auth/patients', {
            params: { page, limit }
        });
        return response.data;
    },

    /**
     * Get doctor by ID
     */
    getDoctorById: async (id: number): Promise<Doctor> => {
        const response = await api.get<Doctor>(`/auth/doctors/${id}`);
        return response.data;
    },

    /**
     * Get patient by ID
     */
    getPatientById: async (id: number): Promise<Patient> => {
        const response = await api.get<Patient>(`/auth/patients/${id}`);
        return response.data;
    },
};
