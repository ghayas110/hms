import { api } from './axios';
import type {
    Invoice,
    CreateInvoiceRequest,
    Payment,
    Appointment,
} from './types';

export const billingService = {
    /**
     * Get all invoices (for cashier) with optional search and pagination
     */
    getAllInvoices: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ data: Invoice[]; total: number; page: number; limit: number; totalPages: number }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);

        const response = await api.get<any>(`/billing/invoices?${queryParams.toString()}`); // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log(response.data, "getAllInvoices");

        // Handle both paginated and non-paginated responses
        if (response.data.data && Array.isArray(response.data.data)) {
            return response.data;
        }
        // Fallback for non-paginated response
        return {
            data: Array.isArray(response.data) ? response.data : [],
            total: Array.isArray(response.data) ? response.data.length : 0,
            page: params?.page || 1,
            limit: params?.limit || 10,
            totalPages: 1
        };
    },

    getAppointments: async () => {
        const response = await api.get<Appointment[]>('/billing/appointments');
        console.log(response.data, "getAppointments");
        return response.data;
    },

    /**
     * Create a new invoice
     */
    createInvoice: async (data: CreateInvoiceRequest): Promise<Invoice> => {
        const response = await api.post<Invoice>('/billing/create-invoice', data);
        return response.data;
    },

    /**
     * Process payment for an invoice
     */
    processPayment: async (invoiceId: number, paymentMethod: string, amount: number): Promise<Payment> => {
        const response = await api.post<Payment>(`/billing/process-payment/${invoiceId}`, {
            payment_method: paymentMethod,
            amount: amount
        });
        return response.data;
    },

    /**
     * Download invoice PDF
     */
    downloadInvoicePDF: async (invoiceId: number): Promise<Blob> => {
        const response = await api.get(`/billing/invoices/${invoiceId}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
