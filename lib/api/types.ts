// Common Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export type UserRole = 'patient' | 'doctor' | 'cashier' | 'pharmacist' | 'lab_tech';

// User Types
export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface Patient extends User {
    role: 'patient';
    name: string;
    dob: string;
    gender: 'male' | 'female' | 'other';
    contact_info: string;
    address: string;
    blood_type?: string;
    allergies?: string; // Stored as string or JSON? Controller implies simple field.
    medical_history?: string; // Text field for general history
    emergency_contact?: string;
    insurance_provider?: string;
    policy_number?: string;
    group_number?: string;
    User?: User;
    Appointments?: Appointment[];
}

export interface UpdateProfileRequest {
    name?: string;
    dob?: string;
    gender?: 'male' | 'female' | 'other';
    contact_info?: string;
    address?: string;
    blood_type?: string;
    allergies?: string;
    medical_history?: string;
    emergency_contact?: string;
    insurance_provider?: string;
    policy_number?: string;
    group_number?: string;
}

export interface Doctor extends User {
    role: 'doctor';
    specialization: string;
    consultation_fee: number;
    User?: User;
}

export interface Cashier extends User {
    role: 'cashier';
}

export interface Pharmacist extends User {
    role: 'pharmacist';
}

export interface LabTech extends User {
    role: 'lab_tech';
}

// Authentication Types
export interface RegisterPatientRequest {
    username: string;
    email: string;
    password: string;
    role: 'patient';
    name: string;
    dob: string;
    gender: 'male' | 'female' | 'other';
    contact_info: string;
    address: string;
}

export interface RegisterDoctorRequest {
    username: string;
    email: string;
    password: string;
    role: 'doctor';
    specialization: string;
    consultation_fee: number;
    shift_start?: string;
    shift_end?: string;
}

export interface RegisterCashierRequest {
    username: string;
    email: string;
    password: string;
    role: 'cashier';
}

export interface RegisterPharmacistRequest {
    username: string;
    email: string;
    password: string;
    role: 'pharmacist';
}

export interface RegisterLabTechRequest {
    username: string;
    email: string;
    password: string;
    role: 'lab_tech';
}

export type RegisterRequest =
    | RegisterPatientRequest
    | RegisterDoctorRequest
    | RegisterCashierRequest
    | RegisterPharmacistRequest
    | RegisterLabTechRequest;

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User | Patient | Doctor | Cashier | Pharmacist | LabTech;
}

// Appointment Types
export interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'pending' | 'approved';
    notes?: string;
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: Patient;
    Patient?: Patient;
    doctor?: Doctor;
    Doctor?: Doctor;
    prescriptions?: Prescription[];
    Prescriptions?: Prescription[];
}

export interface CreateAppointmentRequest {
    doctor_id: number;
    date: string;
    time: string;
    notes?: string;
}

// Prescription Types
export interface Medicine {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity?: number;
}

export interface Prescription {
    id: number;
    appointment_id: number;
    doctor_id: number;
    patient_id: number;
    medicines: Medicine[];
    complaints?: string;
    findings?: Finding[];
    diagnosis?: string[];
    vitals?: Vitals;
    test_orders?: string[];
    attachments?: string[];
    notes?: string;
    status: 'pending' | 'fulfilled' | 'cancelled';
    created_at: string;
    updated_at: string;
    appointment?: Appointment;
    Appointment?: Appointment; // Backend might return PascalCase
    doctor?: Doctor;
    patient?: Patient;
}

export interface PatientDashboardStats {
    upcomingCount: number;
    nextAppointment: Appointment | null;
    activePrescriptionsCount: number;
    recentVitals: Vitals | null;
    pendingBillsSum: number;
    recentActivity: Appointment[]; // Using Appointment as simple activity log
}

export interface CreatePrescriptionRequest {
    appointment_id: number;
    medicines: Medicine[];
    notes?: string;
}

// Medical History Types
export interface MedicalRecord {
    id: number;
    patient_id: number;
    appointment_id: number;
    diagnosis: string;
    treatment: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    appointment?: Appointment;
}

// Billing Types
// Billing Types
export interface InvoiceService {
    name: string;
    amount: number;
}

export interface Invoice {
    id: number;
    appointment_id: number;
    patient_id: number;
    amount: number;
    services?: InvoiceService[];
    status: 'unpaid' | 'paid' | 'cancelled';
    payment_method?: string; // made optional to match backend allow null
    created_at: string;
    updated_at: string;
    patient?: Patient;
    Patient?: Patient; // Backend may return uppercase
    createdAt?: string;
    updatedAt?: string;
    doctor_name?: string;
    Appointment?: Appointment;
}

export interface CreateInvoiceRequest {
    appointment_id: number;
    patient_id: number;
    services: InvoiceService[];
    payment_method: string;
    amount: number;
}

export interface Payment {
    id: number;
    invoice_id: number;
    amount: number;
    payment_method?: string;
    payment_date: string;
    created_at: string;
    updated_at: string;
}

// Pharmacy Types
export interface InventoryItem {
    id: number;
    medicine_name: string;
    stock: number;
    price: number;
    expiry_date: string;
    category?: string;
    supplier?: string;
    min_stock?: number;
    created_at: string;
    updated_at: string;
}

export interface AddInventoryItemRequest {
    medicine_name: string;
    stock: number;
    price: number;
    expiry_date: string;
    category?: string;
    supplier?: string;
    min_stock?: number;
}

export interface InventoryStats {
    totalItems: number;
    totalStock: number;
    lowStock: number;
    expiringSoon: number;
}

export interface PharmacyDashboardStats {
    prescriptionsToFill: number;
    urgentPrescriptions: number;
    lowStockItems: number;
    totalInventory: number;
    dispensedToday: number;
    recentPrescriptions: Prescription[];
}

// Laboratory Types
export interface TestRequest {
    id: number;
    patient_id: number;
    doctor_id: number;
    test_type: string;
    status: 'pending' | 'in_progress' | 'completed';
    result?: string | unknown; // Supports text or structured JSON
    requested_at?: string; // Backend might not send this or send it as created_at
    completed_at?: string;
    created_at: string;
    updated_at: string;
    patient?: Patient; // camelCase from some serializers
    Patient?: Patient; // PascalCase from Sequelize default
    doctor?: Doctor;
    Doctor?: Doctor;
}

export interface AddTestResultRequest {
    result: string;
    readings?: Record<string, string>;
}

// Clinical Management Types
export interface SavedDiagnosis {
    id: number;
    doctor_id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface MedicineGroup {
    id: number;
    doctor_id: number;
    name: string;
    medicines: Medicine[]; // Stored as JSON
    created_at: string;
    updated_at: string;
}

export interface TestCategory {
    id: number;
    doctor_id: number;
    name: string;
    code?: string;
    description?: string;
    status?: 'active' | 'inactive';
    lab_type?: 'pathology' | 'radiology' | 'other';
    TestDefinitions?: TestDefinition[];
    created_at: string;
    updated_at: string;
}

export interface TestParameter {
    name: string;
    unit?: string;
    normal_range_min?: string; // Changed to string to handle mixed types or just be safe, or number if strictly number. User said "wbc count rbc count" which are usually numbers. But backend has "type". Let's assume number or string. The user backend code says `normal_range_min` and `max`. Let's use string to be flexible or number? 
    // Backend definition: "parameters: { type: DataTypes.JSON, // Array of { name, unit, normal_range_min, normal_range_max, type } }"
    // Let's stick to string for ranges to allow "10-20" or just numbers. Or wait, normal_range_min usually implies a number.
    // Let's use string for now as it is safer for input unless we do validation.
    normal_range_max?: string;
    type?: string;
}

export interface TestDefinition {
    id: number;
    category_id: number;
    name: string;
    parameters?: TestParameter[];
    created_at: string;
    updated_at: string;
}

// Prescription Component Types
export interface Complaint {
    complaint: string;
    duration?: string;
    severity?: string;
}

export interface Finding {
    title: string;
    description: string;
}

export interface Vitals {
    pulse_rate?: string;
    temperature?: string;
    blood_pressure?: string;
    blood_sugar?: string;
    height?: string;
    weight?: string;
}

// Update Prescription to include new fields
export interface CreatePrescriptionRequest {
    appointment_id: number;
    medicines: Medicine[];
    complaints: string; // Text area as per req or structured? Req said "Text area... Free-form input"
    findings: Finding[];
    diagnosis: string[]; // Array of strings (names)
    vitals: Vitals;
    test_orders: string[]; // List of test names
    attachments: string[]; // URLs or paths
    notes?: string;
}

// Update Doctor to include shift
export interface Doctor extends User {
    role: 'doctor';
    specialization: string;
    consultation_fee: number;
    shift_start?: string; // HH:mm:ss
    shift_end?: string;   // HH:mm:ss
    User?: User;
}
