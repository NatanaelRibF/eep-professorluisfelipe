'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createOccurrence(data: {
  enrollmentId: string;
  occurrenceTypeId: string;
  date: string;
  description?: string;
  actionTaken?: string;
}) {
  const session = await auth();
  let operatorId = session?.user?.id;
  if (!operatorId) {
    const admin = await prisma.operator.findFirst({ where: { isActive: true } });
    operatorId = admin?.id;
  }
  if (!operatorId) throw new Error('Operador não encontrado');

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: data.enrollmentId },
    });

    if (!enrollment) throw new Error('Matrícula não encontrada');

    const occurrence = await prisma.occurrence.create({
      data: {
        enrollmentId: data.enrollmentId,
        occurrenceTypeId: data.occurrenceTypeId,
        date: new Date(data.date),
        description: data.description,
        actionTaken: data.actionTaken,
        operatorId,
      },
    });

    revalidatePath('/ocorrencias');
    revalidatePath('/');
    return { success: true, occurrence };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao criar ocorrência');
  }
}

export async function getOccurrences(params?: {
  classGroupId?: string;
  occurrenceTypeId?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const where: any = {};

  if (params?.classGroupId && params.classGroupId !== 'todas') {
    where.enrollment = { classGroupId: params.classGroupId };
  }
  if (params?.occurrenceTypeId && params.occurrenceTypeId !== 'todos') {
    where.occurrenceTypeId = params.occurrenceTypeId;
  }
  if (params?.severity && params.severity !== 'todas') {
    where.occurrenceType = { severity: params.severity };
  }
  if (params?.startDate || params?.endDate) {
    where.date = {};
    if (params?.startDate) {
      where.date.gte = new Date(`${params.startDate}T00:00:00.000Z`);
    }
    if (params?.endDate) {
      where.date.lte = new Date(`${params.endDate}T23:59:59.999Z`);
    }
  }

  const [occurrences, total] = await Promise.all([
    prisma.occurrence.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        enrollment: {
          include: { student: true, classGroup: true },
        },
        occurrenceType: true,
        operator: true,
      },
      orderBy: { date: 'desc' },
    }),
    prisma.occurrence.count({ where }),
  ]);

  return { occurrences, total, pages: Math.ceil(total / pageSize) };
}

export async function getStudentOccurrences(studentId: string) {
  return await prisma.occurrence.findMany({
    where: { enrollment: { studentId } },
    include: { occurrenceType: true, operator: true },
    orderBy: { date: 'desc' },
  });
}
