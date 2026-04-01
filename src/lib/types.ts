export interface Intern {
  id: string;
  internId: string;
  fullName: string;
  photo: string;
  school: string;
  course: string;
  contactNumber: string;
  department: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  internId: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
}

export interface Admin {
  username: string;
  token: string;
}
