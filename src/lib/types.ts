// --- INTERN TYPES ---
export interface Intern {
  id: string;
  internId: string;
  fullName: string;
  course: string;
  school: string;
  department: string;
  startDate: string;
  endDate: string;
  contactNumber?: string;
  status: 'Active' | 'Inactive' | 'Completed';
  photo?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  internId: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
}

// --- EMPLOYEE TYPES (BAGONG DAGDAG) ---
export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  position: string;
  department: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  photo?: string;
  createdAt: string;
}

export interface EmployeeAttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Sick' | 'Vacation' | 'Emergency' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}