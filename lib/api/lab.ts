import { api } from './axios';
import type {
    TestRequest,
    AddTestResultRequest,
    TestCategory,
    TestDefinition,
} from './types';

export const labService = {
    /**
     * Get all test requests for the lab
     */
    getTestRequests: async (): Promise<TestRequest[]> => {
        const response = await api.get<TestRequest[]>('/lab/requests');
        return response.data;
    },

    /**
     * Add test result for a specific test request
     */
    addTestResult: async (testId: number, data: AddTestResultRequest): Promise<TestRequest> => {
        const response = await api.post<TestRequest>(`/lab/results/${testId}`, data);
        return response.data;
    },

    async getCompletedResults(): Promise<TestRequest[]> {
        const response = await api.get<TestRequest[]>('/lab/results');
        return response.data;
    },

    async getResultById(id: number): Promise<TestRequest> {
        const response = await api.get<TestRequest>(`/lab/results/${id}`);
        return response.data;
    },

    // Test Management
    getTestCategories: async (): Promise<TestCategory[]> => {
        const response = await api.get<TestCategory[]>('/lab/test-category');
        return response.data;
    },

    addTestCategory: async (data: Partial<TestCategory>): Promise<TestCategory> => {
        const response = await api.post<TestCategory>('/lab/test-category', data);
        return response.data;
    },

    updateTestCategory: async (id: number, data: Partial<TestCategory>): Promise<TestCategory> => {
        const response = await api.put<TestCategory>(`/lab/test-category/${id}`, data);
        return response.data;
    },

    deleteTestCategory: async (id: number): Promise<void> => {
        await api.delete(`/lab/test-category/${id}`);
    },

    addTestDefinition: async (categoryId: number, name: string, parameters: any[]): Promise<TestDefinition> => {
        const response = await api.post<TestDefinition>('/lab/test-definition', { category_id: categoryId, name, parameters });
        return response.data;
    },

    getTestDefinitions: async (categoryId?: number): Promise<TestDefinition[]> => {
        const response = await api.get<TestDefinition[]>('/lab/test-definition', { params: { category_id: categoryId } });
        return response.data;
    },

    updateTestDefinition: async (id: number, data: Partial<TestDefinition>): Promise<TestDefinition> => {
        const response = await api.put<TestDefinition>(`/lab/test-definition/${id}`, data);
        return response.data;
    },

    deleteTestDefinition: async (id: number): Promise<void> => {
        await api.delete(`/lab/test-definition/${id}`);
    },
};
