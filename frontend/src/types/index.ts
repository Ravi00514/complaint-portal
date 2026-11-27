export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  role?: 'admin' | 'citizen';
  createdAt?: string;
}

export interface Department {
  id: number;
  department_name: string;
  office_name: string;
  officer_name?: string;
  designation?: string;
  phone: string;
  emergency_phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  working_hours: string;
  status: string; // 'Open', 'Closed', 'Emergency Only'
  distance_meters?: number;
  distance_text?: string;
}

export interface ComplaintCategory {
  id: number;
  category_name: string;
  department_name: string;
  icon: string;
  description: string;
}

export interface EmergencyContact {
  id: number;
  department: string;
  phone: string;
  city: string;
  state: string;
}

export interface LocationData {
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
