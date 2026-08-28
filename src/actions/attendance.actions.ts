'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveAttendance(data: { classGroupId: string, subjectId: string, date: string, records: { enrollmentId: string, status: string, observation?: string }[] }) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  const operatorId = session.user?.id;
  if (!operatorId) throw new Error('ID do operador não encontrado na sessão');

  try {
    const dateObj = new Date(data.date);
    
    // Process each record
    await prisma.$transaction(
      data.records.map(record => 
        prisma.attendance.upsert({
          where: {
            enrollmentId_date_subjectId: {
              enrollmentId: record.enrollmentId,
              subjectId: data.subjectId,
              date: dateObj
            }
          },
          update: {
            status: record.status,
            observation: record.observation,
            operatorId
          },
          create: {
            enrollmentId: record.enrollmentId,
            subjectId: data.subjectId,
            date: dateObj,
            status: record.status,
            observation: record.observation,
            operatorId
          }
        })
      )
    );

    revalidatePath('/attendance');
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao salvar chamada');
  }
}

export async function getAttendanceByClassAndSubject(classGroupId: string, subjectId: string, date: string) {
  const dateObj = new Date(date);
  
  return await prisma.attendance.findMany({
    where: {
      subjectId,
      date: dateObj,
      enrollment: {
        classGroupId
      }
    }
  });
}

export async function getAttendanceReport(params: { classGroupId?: string, subjectId?: string, startDate?: string, endDate?: string }) {
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
        include: {
          student: true,
          classGroup: true
        }
      },
      subject: true
    },
    orderBy: { date: 'desc' }
  });
}
