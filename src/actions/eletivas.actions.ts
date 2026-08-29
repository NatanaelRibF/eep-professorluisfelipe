'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getElectives(params?: { semester?: number; year?: number }) {
  try {
    const where: any = {};
    if (params?.semester) where.semester = params.semester;
    if (params?.year) where.year = params.year;

    return await prisma.electiveSubject.findMany({
      where,
      include: {
        operator: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error in getElectives:', error);
    return [];
  }
}

export async function getElectiveById(id: string) {
  try {
    return await prisma.electiveSubject.findUnique({
      where: { id },
      include: {
        operator: true,
        enrollments: {
          include: {
            student: {
              include: {
                enrollments: { include: { classGroup: true } },
              },
            },
          },
          orderBy: { enrolledAt: 'asc' },
        },
      },
    });
  } catch (error) {
    console.error('Error in getElectiveById:', error);
    return null;
  }
}

export async function createElective(data: {
  name: string;
  themeArea: string;
  description: string;
  goals?: string;
  operatorId: string;
  maxCapacity: number;
  semester: number;
  year: number;
  roomLocation?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Não autorizado');

    const elective = await prisma.electiveSubject.create({
      data: {
        name: data.name,
        themeArea: data.themeArea,
        description: data.description,
        goals: data.goals || null,
        operatorId: data.operatorId,
        maxCapacity: Number(data.maxCapacity) || 35,
        semester: Number(data.semester) || 1,
        year: Number(data.year) || 2026,
        roomLocation: data.roomLocation || null,
        isActive: true,
      },
    });

    revalidatePath('/eletivas');
    return { success: true, elective };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao criar disciplina eletiva' };
  }
}

export async function toggleElectiveStatus(id: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Não autorizado');

    const elective = await prisma.electiveSubject.findUnique({ where: { id } });
    if (!elective) throw new Error('Eletiva não encontrada');

    const updated = await prisma.electiveSubject.update({
      where: { id },
      data: { isActive: !elective.isActive },
    });

    revalidatePath('/eletivas');
    return { success: true, elective: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao alterar status' };
  }
}

export async function enrollStudentInElective(studentId: string, electiveId: string) {
  try {
    const elective = await prisma.electiveSubject.findUnique({
      where: { id: electiveId },
      include: { _count: { select: { enrollments: true } } },
    });

    if (!elective) throw new Error('Eletiva não encontrada');
    if (elective._count.enrollments >= elective.maxCapacity) {
      throw new Error('As vagas para esta eletiva já foram esgotadas!');
    }

    const enrollment = await prisma.electiveEnrollment.upsert({
      where: { studentId_electiveId: { studentId, electiveId } },
      update: { status: 'MATRICULADO' },
      create: {
        studentId,
        electiveId,
        status: 'MATRICULADO',
      },
    });

    revalidatePath('/eletivas');
    revalidatePath(`/eletivas/${electiveId}`);
    return { success: true, enrollment };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao matricular aluno na eletiva' };
  }
}

export async function removeStudentFromElective(studentId: string, electiveId: string) {
  try {
    await prisma.electiveEnrollment.delete({
      where: { studentId_electiveId: { studentId, electiveId } },
    });

    revalidatePath('/eletivas');
    revalidatePath(`/eletivas/${electiveId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao remover matrícula da eletiva' };
  }
}
