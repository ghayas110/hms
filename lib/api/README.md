# Frontend API Documentation

This document provides comprehensive documentation for the HMS frontend API services.

## Overview

The API layer is organized into modular services for each portal:
- **Authentication** - User registration and login
- **Patient Portal** - Appointments, prescriptions, medical history
- **Doctor Portal** - Appointments, patient records, prescriptions
- **Cashier Portal** - Invoices and payments
- **Pharmacy Portal** - Inventory and prescription fulfillment
- **Laboratory Portal** - Test requests and results

## Configuration

### Environment Variables

Set the API base URL in your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Default: `http://localhost:8000/api`

### Authentication

The API client automatically:
- Adds JWT token to all requests via Authorization header
- Stores token and user data in localStorage on login
- Redirects to login on 401 (Unauthorized) responses
- Handles common error scenarios

## Usage Examples

### Authentication

```typescript
import { authService, type LoginRequest, type RegisterPatientRequest } from '@/lib/api';

// Login
const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: 'john@example.com',
      password: 'password123'
    });
    
    console.log('Logged in user:', response.user);
    console.log('Token:', response.token);
    // Token and user are automatically stored in localStorage
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Register Patient
const handleRegister = async () => {
  try {
    const response = await authService.register({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'patient',
      name: 'John Doe',
      dob: '1990-01-01',
      gender: 'male',
      contact_info: '123-456-7890',
      address: '123 Main St'
    });
    
    console.log('Registered user:', response.user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Check if authenticated
const isLoggedIn = authService.isAuthenticated();

// Get current user
const currentUser = authService.getCurrentUser();

// Logout
authService.logout(); // Clears storage and redirects to /login
```

### Patient Portal

```typescript
import { patientService, type CreateAppointmentRequest } from '@/lib/api';

// Get my appointments
const fetchAppointments = async () => {
  try {
    const appointments = await patientService.getMyAppointments();
    console.log('My appointments:', appointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
  }
};

// Create appointment
const bookAppointment = async () => {
  try {
    const newAppointment = await patientService.createAppointment({
      doctor_id: 1,
      date: '2025-12-05',
      time: '10:00:00',
      notes: 'Regular checkup'
    });
    
    console.log('Appointment created:', newAppointment);
  } catch (error) {
    console.error('Failed to create appointment:', error);
  }
};

// Get prescriptions
const fetchPrescriptions = async () => {
  const prescriptions = await patientService.getMyPrescriptions();
  console.log('My prescriptions:', prescriptions);
};

// Get medical history
const fetchHistory = async () => {
  const history = await patientService.getMedicalHistory();
  console.log('Medical history:', history);
};
```

### Doctor Portal

```typescript
import { doctorService, type CreatePrescriptionRequest } from '@/lib/api';

// Get my appointments
const fetchDoctorAppointments = async () => {
  const appointments = await doctorService.getMyAppointments();
  console.log('Doctor appointments:', appointments);
};

// Get patient records
const fetchPatientRecords = async (patientId: number) => {
  const patient = await doctorService.getPatientRecords(patientId);
  console.log('Patient details:', patient);
};

// Create prescription
const createPrescription = async () => {
  const prescription = await doctorService.createPrescription({
    appointment_id: 1,
    medicines: [
      {
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'Once daily',
        duration: '7 days'
      },
      {
        name: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'Once daily',
        duration: '30 days'
      }
    ],
    notes: 'Take after meals'
  });
  
  console.log('Prescription created:', prescription);
};
```

### Cashier Portal

```typescript
import { billingService, type CreateInvoiceRequest } from '@/lib/api';

// Get all invoices
const fetchInvoices = async () => {
  const invoices = await billingService.getAllInvoices();
  console.log('All invoices:', invoices);
};

// Create invoice
const createInvoice = async () => {
  const invoice = await billingService.createInvoice({
    patient_id: 1,
    amount: 250.00
  });
  
  console.log('Invoice created:', invoice);
};

// Process payment
const processPayment = async (invoiceId: number) => {
  const payment = await billingService.processPayment(invoiceId);
  console.log('Payment processed:', payment);
};
```

### Pharmacy Portal

```typescript
import { pharmacyService, type AddInventoryItemRequest } from '@/lib/api';

// Get inventory
const fetchInventory = async () => {
  const inventory = await pharmacyService.getInventory();
  console.log('Inventory:', inventory);
};

// Add inventory item
const addMedicine = async () => {
  const item = await pharmacyService.addInventoryItem({
    medicine_name: 'Aspirin',
    stock: 500,
    price: 5.99,
    expiry_date: '2026-12-31'
  });
  
  console.log('Item added:', item);
};

// Get prescriptions to fulfill
const fetchPrescriptions = async () => {
  const prescriptions = await pharmacyService.getPrescriptionsToFulfill();
  console.log('Prescriptions to fulfill:', prescriptions);
};
```

### Laboratory Portal

```typescript
import { labService, type AddTestResultRequest } from '@/lib/api';

// Get test requests
const fetchTestRequests = async () => {
  const requests = await labService.getTestRequests();
  console.log('Test requests:', requests);
};

// Add test result
const addResult = async (testId: number) => {
  const updatedTest = await labService.addTestResult(testId, {
    result: 'Blood pressure: 120/80, Cholesterol: Normal'
  });
  
  console.log('Test result added:', updatedTest);
};
```

## React Component Example

Here's a complete example of using the API in a React component:

```typescript
'use client'

import { useState, useEffect } from 'react';
import { patientService, type Appointment } from '@/lib/api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await patientService.getMyAppointments();
      setAppointments(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Appointments</h1>
      {appointments.map(apt => (
        <div key={apt.id}>
          <p>Date: {apt.date}</p>
          <p>Time: {apt.time}</p>
          <p>Status: {apt.status}</p>
        </div>
      ))}
    </div>
  );
}
```

## TypeScript Types

All request and response types are fully typed. Import them from `@/lib/api`:

```typescript
import type {
  // User types
  User, Patient, Doctor, Cashier, Pharmacist, LabTech,
  
  // Auth types
  LoginRequest, RegisterRequest, AuthResponse,
  
  // Patient types
  Appointment, CreateAppointmentRequest,
  Prescription, MedicalRecord,
  
  // Doctor types
  CreatePrescriptionRequest, Medicine,
  
  // Billing types
  Invoice, CreateInvoiceRequest, Payment,
  
  // Pharmacy types
  InventoryItem, AddInventoryItemRequest,
  
  // Lab types
  TestRequest, AddTestResultRequest,
} from '@/lib/api';
```

## Error Handling

The API client includes automatic error handling:

- **401 Unauthorized**: Automatically clears token and redirects to `/login`
- **403 Forbidden**: Logs error to console
- **404 Not Found**: Logs error to console
- **500 Server Error**: Logs error to console

For custom error handling, wrap API calls in try-catch blocks:

```typescript
try {
  const data = await patientService.getMyAppointments();
  // Handle success
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('No response from server');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Patient Portal
- `GET /api/patients/appointments` - Get patient appointments
- `POST /api/patients/appointments` - Create appointment
- `GET /api/patients/prescriptions` - Get patient prescriptions
- `GET /api/patients/history` - Get medical history

### Doctor Portal
- `GET /api/doctors/appointments` - Get doctor appointments
- `GET /api/doctors/patients/:id` - Get patient records
- `POST /api/doctors/prescriptions` - Create prescription

### Cashier Portal
- `GET /api/billing/invoices` - Get all invoices
- `POST /api/billing/create-invoice` - Create invoice
- `POST /api/billing/process-payment/:id` - Process payment

### Pharmacy Portal
- `GET /api/pharmacy/inventory` - Get inventory
- `POST /api/pharmacy/inventory` - Add inventory item
- `GET /api/pharmacy/prescriptions` - Get prescriptions to fulfill

### Laboratory Portal
- `GET /api/lab/requests` - Get test requests
- `POST /api/lab/results/:id` - Add test result

## Notes

- All authenticated endpoints require a valid JWT token
- Tokens are automatically included in requests via the axios interceptor
- The base URL can be configured via `NEXT_PUBLIC_API_URL` environment variable
- All API responses follow consistent typing for better TypeScript support
