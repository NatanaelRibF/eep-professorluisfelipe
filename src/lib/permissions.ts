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
  MANAGE_PDT: 'manage_pdt',
  MANAGE_INTERNSHIPS: 'manage_internships',
  VIEW_MANAGEMENT: 'view_management',
  MANAGE_PASSES: 'manage_passes',
  MANAGE_BUSCA_ATIVA: 'manage_busca_ativa',
  MANAGE_CALENDAR: 'manage_calendar',
} as const

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Diretor': Object.values(PERMISSIONS),
  'Coordenador': Object.values(PERMISSIONS),
  'Secretário': Object.values(PERMISSIONS),
  'Professor': [
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.MANAGE_RAC,
    PERMISSIONS.MANAGE_OCCURRENCES,
    PERMISSIONS.MANAGE_EQUIPMENT,
    PERMISSIONS.VIEW_EQUIPMENT,
    PERMISSIONS.MANAGE_PDT,
    PERMISSIONS.MANAGE_INTERNSHIPS,
    PERMISSIONS.MANAGE_BUSCA_ATIVA,
    PERMISSIONS.MANAGE_PASSES,
    PERMISSIONS.MANAGE_CALENDAR,
  ],
  'Outros': [
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.MANAGE_OCCURRENCES,
    PERMISSIONS.MANAGE_EQUIPMENT,
    PERMISSIONS.VIEW_EQUIPMENT,
    PERMISSIONS.MANAGE_PASSES,
  ],
}

export type Role = 'Diretor' | 'Coordenador' | 'Secretário' | 'Professor' | 'Outros' | string

export function hasPermission(role: string, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
