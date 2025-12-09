import { api } from './axios';
import type {
    TestRequest,
    AddTestResultRequest,
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
};
