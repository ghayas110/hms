import { api } from './axios';
import {
    Appointment,
    Patient,
    Prescription,
    CreatePrescriptionRequest,
    SavedDiagnosis,
    MedicineGroup,
    TestCategory,
    Doctor
} from './types';

export const doctorService = {
    // Appointment Management
    getAppointments: async () => {
        const response = await api.get<{ today: Appointment[], upcoming: Appointment[], all: Appointment[] }>('/doctor/appointments');
        return response.data;
    },

    getPatientRecords: async (id: number) => {
        const response = await api.get<Patient>(`/doctor/patients/${id}`);
        return response.data;
    },

    getDoctorSlots: async (date: string) => {
        // Only works if logged in as doctor, but maybe useful to have if permissions change
        const response = await api.get<string[]>(`/doctor/slots?date=${date}`);
        return response.data;
    },

    // Prescription Management
    createPrescription: async (data: CreatePrescriptionRequest) => {
        const response = await api.post<Prescription>('/doctor/prescriptions', data);
        return response.data;
    },

    updatePrescription: async (id: number, data: Partial<Prescription>) => {
        const response = await api.put<Prescription>(`/doctor/prescriptions/${id}`, data);
        return response.data;
    },

    deletePrescription: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/doctor/prescriptions/${id}`);
        return response.data;
    },

    // Clinical Management
    addDiagnosis: async (name: string) => {
        const response = await api.post<SavedDiagnosis>('/doctor/diagnosis', { name });
        return response.data;
    },

    getDiagnoses: async () => {
        const response = await api.get<SavedDiagnosis[]>('/doctor/diagnosis');
        return response.data;
    },

    deleteDiagnosis: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/doctor/diagnosis/${id}`);
        return response.data;
    },

    updateDiagnosis: async (id: number, name: string) => {
        const response = await api.put<{ message: string, diagnosis: SavedDiagnosis }>(`/doctor/diagnosis/${id}`, { name });
        return response.data;
    },

    addMedicineGroup: async (name: string, medicines: any[]) => {
        const response = await api.post<MedicineGroup>('/doctor/medicine-group', { name, medicines });
        return response.data;
    },

    getMedicineGroups: async () => {
        const response = await api.get<MedicineGroup[]>('/doctor/medicine-group');
        return response.data;
    },

    getMedicineGroupById: async (id: number | string) => {
        const response = await api.get<MedicineGroup>(`/doctor/medicine-group/${id}`);
        return response.data;
    },

    addTestCategory: async (data: { name: string, code?: string, description?: string, lab_type?: string }) => {
        const response = await api.post<TestCategory>('/doctor/test-category', data);
        return response.data;
    },

    getTestCategories: async () => {
        const response = await api.get<TestCategory[]>('/doctor/test-category');
        return response.data;
    },

    addTestDefinition: async (category_id: number, name: string) => {
        const response = await api.post('/doctor/test-definition', { category_id, name });
        return response.data;
    },

    // Medicine Group Updates
    deleteMedicineGroup: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/doctor/medicine-group/${id}`);
        return response.data;
    },

    updateMedicineGroup: async (id: number, data: Partial<MedicineGroup>) => {
        const response = await api.put<{ message: string, group: MedicineGroup }>(`/doctor/medicine-group/${id}`, data);
        return response.data;
    },

    // Test Category Updates
    deleteTestCategory: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/doctor/test-category/${id}`);
        return response.data;
    },

    updateTestCategory: async (id: number, data: Partial<TestCategory>) => {
        const response = await api.put<{ message: string, category: TestCategory }>(`/doctor/test-category/${id}`, data);
        return response.data;
    }
};
