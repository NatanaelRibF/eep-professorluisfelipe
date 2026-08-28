'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveAttendance(data: {
  classGroupId: string;
  subjectId: string;
  date: string;
  records: { enrollmentId: string; status: string; observation?: string }[];
}) {
  const session = await auth();
  let operatorId = session?.user?.id;
  if (!operatorId) {
    const admin = await prisma.operator.findFirst({ where: { isActive: true } });
    operatorId = admin?.id;
  }
  if (!operatorId) throw new Error('Operador não encontrado');

  const attendanceDate = new Date(data.date);

  try {
    const operations = data.records
      .filter((r) => r.status)
      .map((record) =>
        prisma.attendance.upsert({
          where: {
            enrollmentId_date_subjectId: {
              enrollmentId: record.enrollmentId,
              date: attendanceDate,
              subjectId: data.subjectId,
            },
          },
          update: {
            status: record.status as any,
            observation: record.observation,
            operatorId,
          },
          create: {
            enrollmentId: record.enrollmentId,
            subjectId: data.subjectId,
            date: attendanceDate,
            status: record.status as any,
            observation: record.observation,
            operatorId,
          },
        })
      );

    await prisma.$transaction(operations);

    revalidatePath('/frequencia');
    revalidatePath('/frequencia/relatorio');
    revalidatePath('/');
    return { success: true, count: operations.length };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao salvar frequência');
  }
}

export async function getAttendanceByClassAndSubject(
  classGroupId: string,
  subjectId: string,
  date: string
) {
  const attendanceDate = new Date(date);
  return await prisma.attendance.findMany({
    where: {
      enrollment: { classGroupId },
      subjectId,
      date: attendanceDate,
    },
    include: {
      enrollment: {
        include: { student: true },
      },
    },
  });
}

export async function getAttendanceReport(params: {
  classGroupId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const where: any = {};

  if (params.classGroupId) {
    where.enrollment = { classGroupId: params.classGroupId };
  }
  if (params.subjectId) {
    where.subjectId = params.subjectId;
  }
  if (params.startDate || params.endDate) {
    where.date = {};
    if (params.startDate) where.date.gte = new Date(params.startDate);
    if (params.endDate) where.date.lte = new Date(params.endDate);
  }

  return await prisma.attendance.findMany({
    where,
    include: {
      enrollment: {
        include: { student: true, classGroup: true },
      },
      subject: true,
      operator: true,
    },
    orderBy: { date: 'asc' },
  });
}
