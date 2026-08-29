export const PERMISSIONS = {
  MANAGE_STUDENTS: 'manage_students',
  MANAGE_ATTENDANCE: 'manage_attendance',
  MANAGE_RAC: 'manage_rac',
  MANAGE_OCCURRENCES: 'manage_occurrences',
  MANAGE_OPERATORS: 'manage_operators',
  MANAGE_CLASSES: 'manage_classes',
  MANAGE_SUBJECTS: 'manage_subjects',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_REPORTS: 'view_reports',
  MANAGE_EQUIPMENT: 'manage_equipment',
  VIEW_EQUIPMENT: 'view_equipment',
} as const

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Diretor': Object.values(PERMISSIONS),
  'Coordenador': [
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.MANAGE_RAC,
    PERMISSIONS.MANAGE_OCCURRENCES,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.MANAGE_SUBJECTS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_EQUIPMENT,
    PERMISSIONS.VIEW_EQUIPMENT,
  ],
  'Secretário': [
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_RAC,
    PERMISSIONS.MANAGE_OCCURRENCES,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_EQUIPMENT,
    PERMISSIONS.VIEW_EQUIPMENT,
  ],
  'Professor': [
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.MANAGE_RAC,
    PERMISSIONS.MANAGE_OCCURRENCES,
    PERMISSIONS.MANAGE_EQUIPMENT,
    PERMISSIONS.VIEW_EQUIPMENT,
  ],
  'Outros': [
    PERMISSIONS.MANAGE_OCCURRENCES,
    PERMISSIONS.MANAGE_EQUIPMENT,
    PERMISSIONS.VIEW_EQUIPMENT,
  ],
}

export type Role = 'Diretor' | 'Coordenador' | 'Secretário' | 'Professor' | 'Outros' | string

export function hasPermission(role: string, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
