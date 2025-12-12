import { api } from './axios';
import type {
    InventoryItem,
    AddInventoryItemRequest,
    InventoryStats,
    Prescription,
    PharmacyDashboardStats,
    Invoice,
    Patient,
} from './types';

export const pharmacyService = {
    /**
     * Get all inventory items
     */
    getInventory: async (search?: string): Promise<InventoryItem[]> => {
        const response = await api.get<InventoryItem[]>('/pharmacy/inventory', { params: { search } });
        return response.data;
    },

    /**
     * Add a new inventory item
     */
    addInventoryItem: async (data: AddInventoryItemRequest): Promise<{ message: string, item: InventoryItem }> => {
        const response = await api.post<{ message: string, item: InventoryItem }>('/pharmacy/inventory', data);
        return response.data;
    },

    /**
     * Update an inventory item
     */
    updateInventoryItem: async (id: number, data: AddInventoryItemRequest): Promise<{ message: string, item: InventoryItem }> => {
        const response = await api.put<{ message: string, item: InventoryItem }>(`/pharmacy/inventory/${id}`, data);
        return response.data;
    },

    /**
     * Delete an inventory item
     */
    deleteInventoryItem: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/pharmacy/inventory/${id}`);
        return response.data;
    },

    /**
     * Get inventory stats
     */
    getInventoryStats: async (): Promise<InventoryStats> => {
        const response = await api.get<InventoryStats>('/pharmacy/inventory/stats');
        return response.data;
    },

    /**
     * Get prescriptions to fulfill
     */
    getPrescriptionsToFulfill: async (): Promise<Prescription[]> => {
        const response = await api.get<Prescription[]>('/pharmacy/prescriptions');
        return response.data;
    },

    /**
     * Dispense a prescription
     */
    dispensePrescription: async (id: number): Promise<{ message: string, prescription: Prescription, invoice: Invoice }> => {
        const response = await api.post<{ message: string, prescription: Prescription, invoice: Invoice }>(`/pharmacy/prescriptions/${id}/dispense`);
        return response.data;
    },
    getPatientById: async (id: number): Promise<Patient> => {
        // returning any or a complex type because the structure includes nested relations (User, Appointments -> Prescriptions)
        const response = await api.get<Patient>(`/pharmacy/patients/${id}`);
        console.log(response.data)
        return response.data;
    },

    /**
     * Get dashboard stats
     */
    getDashboardStats: async (): Promise<PharmacyDashboardStats> => {
        const response = await api.get<PharmacyDashboardStats>('/pharmacy/stats');
        return response.data;
    }
};
