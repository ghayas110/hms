import { api } from './axios';
import type {
    Appointment,
    CreateAppointmentRequest,
    Prescription,
    MedicalRecord,
    PatientDashboardStats,
    UpdateProfileRequest,
    Patient,
} from './types';

export const patientService = {
    /**
     * Get all appointments for the logged-in patient
     */
    getMyAppointments: async (): Promise<Appointment[]> => {
        const response = await api.get<Appointment[]>('/patients/appointments');
        return response.data;
    },

    /**
     * Create a new appointment
     */
    createAppointment: async (data: CreateAppointmentRequest): Promise<Appointment> => {
        const response = await api.post<Appointment>('/patients/appointments', data);
        return response.data;
    },

    /**
     * Get all prescriptions for the logged-in patient
     */
    getMyPrescriptions: async (): Promise<Prescription[]> => {
        const response = await api.get<Prescription[]>('/patients/prescriptions');
        return response.data;
    },

    /**
     * Cancel an appointment
     */
    cancelAppointment: async (appointmentId: number): Promise<Appointment> => {
        const response = await api.put<Appointment>(`/patients/appointments/${appointmentId}/cancel`);
        return response.data;
    },

    /**
     * Get medical history for the logged-in patient
     */
    getMedicalHistory: async (): Promise<MedicalRecord[]> => {
        const response = await api.get<MedicalRecord[]>('/patients/history');
        return response.data;
    },

    searchByCNIC: async (cnic: string) => {
        const response = await api.get<{ id: number, username: string, name: string, email: string }>(`/patients/search?cnic=${cnic}`);
        return response.data;
    },

    getDashboardStats: async (): Promise<PatientDashboardStats> => {
        const response = await api.get<PatientDashboardStats>('/patients/stats');
        return response.data;
    },

    getProfile: async (): Promise<Patient> => {
        const response = await api.get<Patient>('/patients/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<{ message: string, patient: Patient }> => {
        const response = await api.put<{ message: string, patient: Patient }>('/patients/profile', data);
        return response.data;
    },

    getPatientById: async (id: number): Promise<any> => {
        // returning any or a complex type because the structure includes nested relations (User, Appointments -> Prescriptions)
        const response = await api.get(`/patients/${id}`);
        return response.data;
    }

};
