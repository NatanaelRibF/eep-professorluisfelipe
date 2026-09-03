'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const GESTOR_ROLES = ['Diretor', 'Coordenador', 'Secretário'];

async function verifyTeacherClassPermission(operatorId: string, role: string, classGroupId: string) {
  if (GESTOR_ROLES.includes(role)) return true;
  const isAssigned = await prisma.classGroup.findFirst({
    where: {
      id: classGroupId,
      OR: [
        { teacherClasses: { some: { operatorId } } },
        { subjectTeachers: { some: { operatorId } } },
        { pdtId: operatorId },
      ],
    },
  });
  return !!isAssigned;
}

export async function saveAttendance(data: {
  classGroupId: string;
  subjectId: string;
  date: string;
  records: { enrollmentId: string; status: string; observation?: string }[];
}) {
  const session = await auth();
  const userRole = (session?.user as any)?.role || '';
  let operatorId = session?.user?.id;
  if (!operatorId) {
    const admin = await prisma.operator.findFirst({ where: { isActive: true } });
    operatorId = admin?.id;
  }
  if (!operatorId) throw new Error('Operador não encontrado');

  // Verify that the teacher has permission for this class
  const hasAccess = await verifyTeacherClassPermission(operatorId, userRole, data.classGroupId);
  if (!hasAccess) {
    throw new Error('Você só pode lançar frequência para as suas próprias turmas atribuídas.');
  }

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
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || 'Erro ao salvar frequência');
  }
}

export async function getAttendanceByClassAndSubject(
  classGroupId: string,
  subjectId: string,
  date: string
) {
  const session = await auth();
  const userRole = (session?.user as any)?.role || '';
  const operatorId = session?.user?.id;

  if (operatorId && !GESTOR_ROLES.includes(userRole)) {
    const hasAccess = await verifyTeacherClassPermission(operatorId, userRole, classGroupId);
    if (!hasAccess) return [];
  }

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
  const session = await auth();
  const userRole = (session?.user as any)?.role || '';
  const operatorId = session?.user?.id;

  const where: any = {};

  if (operatorId && !GESTOR_ROLES.includes(userRole)) {
    where.enrollment = {
      classGroup: {
        OR: [
          { teacherClasses: { some: { operatorId } } },
          { subjectTeachers: { some: { operatorId } } },
          { pdtId: operatorId },
        ],
      },
    };
    if (params.classGroupId) {
      where.enrollment.classGroupId = params.classGroupId;
    }
  } else if (params.classGroupId) {
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
