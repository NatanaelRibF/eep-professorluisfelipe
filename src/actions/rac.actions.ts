'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createRAC(data: { enrollmentId: string, racTypeId: string, date: string, description?: string }) {
  const session = await auth();
  let operatorId = session?.user?.id;
  if (!operatorId) {
    const admin = await prisma.operator.findFirst({ where: { isActive: true } });
    operatorId = admin?.id;
  }
  if (!operatorId) throw new Error('Operador não encontrado');

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: data.enrollmentId }
    });

    if (!enrollment) throw new Error('Matrícula não encontrada');

    const rac = await prisma.rAC.create({
      data: {
        enrollmentId: data.enrollmentId,
        racTypeId: data.racTypeId,
        date: new Date(data.date),
        description: data.description,
        operatorId
      }
    });

    revalidatePath('/rac');
    revalidatePath('/');
    return { success: true, rac };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao criar RAC');
  }
}

export async function getRACs(params?: {
  classGroupId?: string;
  racTypeId?: string;
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
  if (params?.racTypeId && params.racTypeId !== 'todos') {
    where.racTypeId = params.racTypeId;
  }
  if (params?.severity && params.severity !== 'todas') {
    where.racType = { severity: params.severity };
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

  const [racs, total] = await Promise.all([
    prisma.rAC.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        enrollment: {
          include: {
            student: true,
            classGroup: true,
          }
        },
        racType: true,
        operator: true
      },
      orderBy: { date: 'desc' }
    }),
    prisma.rAC.count({ where })
  ]);

  return { racs, total, pages: Math.ceil(total / pageSize) };
}

export async function getStudentRACs(studentId: string) {
  return await prisma.rAC.findMany({
    where: { enrollment: { studentId } },
    include: { racType: true, operator: true },
    orderBy: { date: 'desc' }
  });
}
