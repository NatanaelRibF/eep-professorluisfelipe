'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getBuscaAtivaData(params?: {
  classGroupId?: string;
  riskLevel?: string; // 'TODOS', 'CRITICO', 'MEDIO', 'ALERTA'
  search?: string;
  minAbsences?: number;
}) {
  try {
    const minAbsences = params?.minAbsences ?? 3;
    const whereEnrollment: any = { status: 'ATIVO' };

    if (params?.classGroupId && params.classGroupId !== 'todas') {
      whereEnrollment.classGroupId = params.classGroupId;
    }

    if (params?.search) {
      whereEnrollment.student = {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { registrationNumber: { contains: params.search, mode: 'insensitive' } },
          { guardianName: { contains: params.search, mode: 'insensitive' } },
          { guardianPhone: { contains: params.search, mode: 'insensitive' } },
        ],
      };
    }

    const enrollments = await prisma.enrollment.findMany({
      where: whereEnrollment,
      include: {
        student: {
          include: {
            buscaAtivaActions: {
              orderBy: { createdAt: 'desc' },
              include: { operator: true },
            },
          },
        },
        classGroup: {
          include: {
            grade: true,
            pdtTeacher: true,
          },
        },
        attendances: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { student: { name: 'asc' } },
    });

    // Calculate detailed absence statistics for each student
    const studentsData = enrollments.map((enr) => {
      const allAttendances = enr.attendances || [];
      const totalRecorded = allAttendances.length;
      const absences = allAttendances.filter((a) => a.status === 'AUSENTE');
      const presences = allAttendances.filter((a) => a.status === 'PRESENTE');
      const justified = allAttendances.filter((a) => a.status === 'JUSTIFICADO');
      
      const totalAbsences = absences.length;
      const presenceRate = totalRecorded > 0 ? ((presences.length + justified.length) / totalRecorded) * 100 : 100;
      const absenceRate = totalRecorded > 0 ? (totalAbsences / totalRecorded) * 100 : 0;

      // Calculate recent consecutive absences
      let consecutiveAbsences = 0;
      for (const att of allAttendances) {
        if (att.status === 'AUSENTE') {
          consecutiveAbsences++;
        } else {
          break; // broke the streak
        }
      }

      // Last recorded absence date
      const lastAbsence = absences[0]?.date || null;

      // Risk level classification
      let riskLevel: 'CRITICO' | 'MEDIO' | 'ALERTA' | 'NORMAL' = 'NORMAL';
      if (totalAbsences >= 10 || consecutiveAbsences >= 5 || (totalRecorded >= 15 && presenceRate < 75)) {
        riskLevel = 'CRITICO';
      } else if (totalAbsences >= 5 || consecutiveAbsences >= 3 || (totalRecorded >= 15 && presenceRate < 85)) {
        riskLevel = 'MEDIO';
      } else if (totalAbsences >= 3 || consecutiveAbsences >= 2) {
        riskLevel = 'ALERTA';
      }

      const actions = enr.student.buscaAtivaActions || [];
      const latestAction = actions[0] || null;

      return {
        enrollmentId: enr.id,
        studentId: enr.student.id,
        studentName: enr.student.name,
        registrationNumber: enr.student.registrationNumber,
        photoUrl: enr.student.photoUrl,
        guardianName: enr.student.guardianName || 'Não informado',
        guardianPhone: enr.student.guardianPhone || 'Não informado',
        address: enr.student.address,
        neighborhood: enr.student.neighborhood,
        city: enr.student.city || 'Sobral',
        classGroupId: enr.classGroup.id,
        className: enr.classGroup.name,
        shift: enr.classGroup.shift,
        pdtName: enr.classGroup.pdtTeacher?.name || 'Não atribuído',
        totalRecorded,
        totalAbsences,
        consecutiveAbsences,
        presenceRate: Number(presenceRate.toFixed(1)),
        absenceRate: Number(absenceRate.toFixed(1)),
        lastAbsenceDate: lastAbsence,
        riskLevel,
        actionsCount: actions.length,
        latestAction,
        actionsHistory: actions,
      };
    });

    // Filter by minAbsences and riskLevel if provided
    let filteredStudents = studentsData.filter((s) => s.totalAbsences >= minAbsences || s.riskLevel !== 'NORMAL');

    if (params?.riskLevel && params.riskLevel !== 'TODOS') {
      filteredStudents = filteredStudents.filter((s) => s.riskLevel === params.riskLevel);
    }

    // Sort by urgency: CRITICO first, then most absences
    filteredStudents.sort((a, b) => {
      const riskWeight = { CRITICO: 3, MEDIO: 2, ALERTA: 1, NORMAL: 0 };
      if (riskWeight[b.riskLevel] !== riskWeight[a.riskLevel]) {
        return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
      }
      return b.totalAbsences - a.totalAbsences;
    });

    // Overview Stats
    const stats = {
      totalInRisk: filteredStudents.length,
      criticos: studentsData.filter((s) => s.riskLevel === 'CRITICO').length,
      medios: studentsData.filter((s) => s.riskLevel === 'MEDIO').length,
      alertas: studentsData.filter((s) => s.riskLevel === 'ALERTA').length,
      actionsTaken: studentsData.reduce((acc, s) => acc + s.actionsCount, 0),
    };

    return {
      success: true,
      stats,
      students: filteredStudents,
      allClassesCount: enrollments.length,
    };
  } catch (error: any) {
    console.error('Error fetching busca ativa data:', error);
    return { success: false, error: error.message || 'Erro ao carregar dados de busca ativa' };
  }
}

export async function createBuscaAtivaAction(data: {
  studentId: string;
  contactType: string;
  contactPerson: string;
  phoneUsed?: string;
  summary: string;
  reasonForAbsence?: string;
  returnDate?: string;
  status: string;
}) {
  const session = await auth();
  let operatorId = session?.user?.id;
  if (!operatorId) {
    const admin = await prisma.operator.findFirst({ where: { isActive: true } });
    operatorId = admin?.id;
  }
  if (!operatorId) throw new Error('Operador não autenticado');

  try {
    const action = await prisma.buscaAtivaAction.create({
      data: {
        studentId: data.studentId,
        operatorId,
        contactType: data.contactType || 'WHATSAPP',
        contactPerson: data.contactPerson,
        phoneUsed: data.phoneUsed || null,
        summary: data.summary,
        reasonForAbsence: data.reasonForAbsence || null,
        returnDate: data.returnDate ? new Date(data.returnDate) : null,
        status: data.status || 'EM_ANDAMENTO',
      },
      include: {
        operator: true,
        student: true,
      },
    });

    revalidatePath('/busca-ativa');
    revalidatePath('/gestao');
    revalidatePath(`/alunos/${data.studentId}`);
    return { success: true, action };
  } catch (error: any) {
    console.error('Error creating busca ativa action:', error);
    return { success: false, error: error.message || 'Erro ao registrar ação de busca ativa' };
  }
}

export async function getStudentBuscaAtivaProfile(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            classGroup: { include: { pdtTeacher: true } },
            attendances: { orderBy: { date: 'desc' } },
            racs: { include: { racType: true } },
            occurrences: { include: { occurrenceType: true } },
          },
        },
        buscaAtivaActions: {
          orderBy: { createdAt: 'desc' },
          include: { operator: true },
        },
      },
    });

    if (!student) return { success: false, error: 'Aluno não encontrado' };
    return { success: true, student };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
