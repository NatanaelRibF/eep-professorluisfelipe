import { z } from 'zod'

export const studentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  registrationNumber: z.string().min(1, 'Matrícula é obrigatória'),
  birthDate: z.date().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
})

export const operatorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  roleId: z.string().min(1, 'Função é obrigatória'),
})

export const attendanceSchema = z.object({
  enrollmentId: z.string().min(1, 'Matrícula é obrigatória'),
  subjectId: z.string().min(1, 'Disciplina é obrigatória'),
  date: z.date(),
  status: z.enum(['PRESENTE', 'AUSENTE', 'JUSTIFICADO']),
  observation: z.string().optional(),
})

export const racSchema = z.object({
  enrollmentId: z.string().min(1, 'Matrícula é obrigatória'),
  racTypeId: z.string().min(1, 'Tipo de RAC é obrigatório'),
  date: z.date(),
  description: z.string().optional(),
})

export const occurrenceSchema = z.object({
  enrollmentId: z.string().min(1, 'Matrícula é obrigatória'),
  occurrenceTypeId: z.string().min(1, 'Tipo de ocorrência é obrigatório'),
  date: z.date(),
  description: z.string().optional(),
  actionTaken: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type StudentFormData = z.infer<typeof studentSchema>
export type OperatorFormData = z.infer<typeof operatorSchema>
export type AttendanceFormData = z.infer<typeof attendanceSchema>
export type RacFormData = z.infer<typeof racSchema>
export type OccurrenceFormData = z.infer<typeof occurrenceSchema>
export type LoginFormData = z.infer<typeof loginSchema>
