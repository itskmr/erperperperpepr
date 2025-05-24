import { atom, selector } from "recoil";

// Types for attendance management
export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  recordedBy: string;
  timestamp: string;
}

export interface AttendanceFilter {
  date?: string;
  classId?: string;
  studentId?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
}

// Atoms for attendance management
export const attendanceRecordsState = atom<AttendanceRecord[]>({
  key: "attendanceRecords",
  default: []
});

export const attendanceFilterState = atom<AttendanceFilter>({
  key: "attendanceFilter",
  default: {
    date: new Date().toISOString().split('T')[0] // Default to today's date
  }
});

export const selectedClassState = atom<string | null>({
  key: "selectedClass",
  default: null
});

export const attendanceSubmissionState = atom<'idle' | 'submitting' | 'success' | 'error'>({
  key: "attendanceSubmission",
  default: 'idle'
});

export const attendanceErrorState = atom<string | null>({
  key: "attendanceError",
  default: null
});

// Selectors for computed values
export const filteredAttendanceRecordsSelector = selector({
  key: "filteredAttendanceRecords",
  get: ({ get }) => {
    const records = get(attendanceRecordsState);
    const filter = get(attendanceFilterState);
    
    return records.filter(record => {
      if (filter.date && record.date !== filter.date) return false;
      if (filter.classId && record.classId !== filter.classId) return false;
      if (filter.studentId && record.studentId !== filter.studentId) return false;
      if (filter.status && record.status !== filter.status) return false;
      
      return true;
    });
  }
});

export const attendanceStatsSelector = selector({
  key: "attendanceStats",
  get: ({ get }) => {
    const records = get(filteredAttendanceRecordsSelector);
    
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    
    const presentPercent = total > 0 ? (present / total) * 100 : 0;
    
    return {
      total,
      present,
      absent,
      late,
      excused,
      presentPercent
    };
  }
});