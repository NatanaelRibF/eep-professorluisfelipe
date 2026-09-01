'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createStudentExitPass(data: {
  studentId: string;
  type?: string;
  date?: string;
  time: string;
  reason: string;
  authorizedBy: string;
  accompaniedBy?: string;
  guardianContact?: string;
  observation?: string;
}) {
  const session = await auth();
  let operatorId = session?.user?.id;
  if (!operatorId) {
    const admin = await prisma.operator.findFirst({ where: { isActive: true } });
    operatorId = admin?.id;
  }
  if (!operatorId) throw new Error('Operador não autenticado');

  try {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: {
        enrollments: {
          include: { classGroup: true },
        },
      },
    });

    if (!student) {
      return { success: false, error: 'Estudante não encontrado' };
    }

    const passDate = data.date ? new Date(data.date) : new Date();

    const pass = await prisma.studentExitPass.create({
      data: {
        studentId: data.studentId,
        operatorId,
        type: data.type || 'SAIDA_ANTECIPADA',
        date: passDate,
        time: data.time,
        reason: data.reason,
        authorizedBy: data.authorizedBy,
        accompaniedBy: data.accompaniedBy || null,
        guardianContact: data.guardianContact || student.guardianPhone || null,
        observation: data.observation || null,
        status: 'LIBERADO',
      },
      include: {
        student: {
          include: {
            enrollments: {
              include: { classGroup: true },
            },
          },
        },
        operator: true,
      },
    });

    revalidatePath('/liberacao');
    revalidatePath('/alunos');
    revalidatePath(`/alunos/${data.studentId}`);
    return { success: true, pass };
  } catch (error: any) {
    console.error('Error creating exit pass:', error);
    return { success: false, error: error.message || 'Erro ao emitir liberação de aluno' };
  }
}

export async function getStudentExitPasses(params?: {
  classGroupId?: string;
  studentId?: string;
  date?: string;
  status?: string;
  search?: string;
}) {
  try {
    const where: any = {};

    if (params?.status && params.status !== 'todos') {
      where.status = params.status;
    }

    if (params?.date) {
      where.date = new Date(params.date);
    }

    if (params?.studentId) {
      where.studentId = params.studentId;
    }

    if (params?.classGroupId && params.classGroupId !== 'todas') {
      where.student = {
        enrollments: {
          some: { classGroupId: params.classGroupId },
        },
      };
    }

    if (params?.search) {
      where.OR = [
        { student: { name: { contains: params.search, mode: 'insensitive' } } },
        { student: { registrationNumber: { contains: params.search, mode: 'insensitive' } } },
        { reason: { contains: params.search, mode: 'insensitive' } },
        { authorizedBy: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const passes = await prisma.studentExitPass.findMany({
      where,
      include: {
        student: {
          include: {
            enrollments: {
              include: { classGroup: true },
            },
          },
        },
        operator: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return { success: true, passes };
  } catch (error: any) {
    console.error('Error fetching exit passes:', error);
    return { success: false, error: error.message || 'Erro ao buscar liberações' };
  }
}

export async function getExitPassById(id: string) {
  try {
    const pass = await prisma.studentExitPass.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            enrollments: {
              include: { classGroup: true },
            },
          },
        },
        operator: true,
      },
    });

    if (!pass) return { success: false, error: 'Liberação não encontrada' };
    return { success: true, pass };
  } catch (error: any) {
    console.error('Error getting exit pass:', error);
    return { success: false, error: error.message };
  }
}

export async function cancelStudentExitPass(id: string) {
  try {
    await prisma.studentExitPass.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });
    revalidatePath('/liberacao');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
