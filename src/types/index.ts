export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
}

export interface StudentWithEnrollment {
  id: string;
  name: string;
  registrationNumber: string;
  birthDate?: Date | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  address?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  enrollments: {
    id: string;
    classGroup: {
      id: string;
      name: string;
      grade: {
        id: string;
        name: string;
      };
    };
  }[];
}

export interface AttendanceWithDetails {
  id: string;
  date: Date;
  status: string;
  observation?: string | null;
  enrollment: {
    id: string;
    student: {
      id: string;
      name: string;
    };
  };
  subject: {
    id: string;
    name: string;
  };
  operator: {
    id: string;
    name: string;
  };
}

export interface RACWithDetails {
  id: string;
  date: Date;
  description?: string | null;
  enrollment: {
    id: string;
    student: {
      id: string;
      name: string;
    };
  };
  racType: {
    id: string;
    name: string;
  };
  operator: {
    id: string;
    name: string;
  };
}

export interface OccurrenceWithDetails {
  id: string;
  date: Date;
  description?: string | null;
  actionTaken?: string | null;
  enrollment: {
    id: string;
    student: {
      id: string;
      name: string;
    };
  };
  occurrenceType: {
    id: string;
    name: string;
  };
  operator: {
    id: string;
    name: string;
  };
}

export interface DashboardStats {
  totalStudents: number;
  attendanceRate: number;
  racsThisMonth: number;
  occurrencesThisMonth: number;
}

export interface AttendanceRecord {
  enrollmentId: string;
  studentName: string;
  status: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO';
  observation?: string;
}
