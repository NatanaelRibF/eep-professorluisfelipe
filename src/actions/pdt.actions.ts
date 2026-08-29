'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getPDTClasses(schoolYearId?: string) {
  try {
    let where: any = {};
    if (schoolYearId && schoolYearId !== 'all') {
      where = { schoolYearId };
    } else if (!schoolYearId) {
      const currentYear = await prisma.schoolYear.findFirst({
        where: { isCurrent: true },
      });
      if (currentYear) {
        where = { schoolYearId: currentYear.id };
      }
    }

    return await prisma.classGroup.findMany({
      where,
      include: {
        grade: true,
        schoolYear: true,
        pdtTeacher: true,
        _count: { select: { enrollments: true, pdtCouncils: true } },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error in getPDTClasses:', error);
    return [];
  }
}

export async function assignPDTTeacher(classGroupId: string, operatorId: string | null) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Não autorizado');

    const updated = await prisma.classGroup.update({
      where: { id: classGroupId },
      data: { pdtId: operatorId || null },
      include: { pdtTeacher: true },
    });

    revalidatePath('/pdt');
    revalidatePath('/turmas');
    return { success: true, classGroup: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao vincular PDT' };
  }
}

export async function getStudentDossier(studentId: string) {
  try {
    const [student, dossier, attendances, racs, occurrences] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          enrollments: { include: { classGroup: { include: { pdtTeacher: true } } } },
        },
      }),
      prisma.pDTStudentDossier.findUnique({
        where: { studentId },
      }),
      prisma.pDTAttendanceRecord.findMany({
        where: { studentId },
        include: { operator: true },
        orderBy: { date: 'desc' },
      }),
      prisma.rAC.findMany({
        where: { enrollment: { studentId } },
        include: { racType: true, operator: true },
        orderBy: { date: 'desc' },
      }),
      prisma.occurrence.findMany({
        where: { enrollment: { studentId } },
        include: { occurrenceType: true, operator: true },
        orderBy: { date: 'desc' },
      }),
    ]);

    return { student, dossier, attendances, racs, occurrences };
  } catch (error) {
    console.error('Error in getStudentDossier:', error);
    return null;
  }
}

export async function saveStudentDossier(studentId: string, data: {
  livesWith?: string;
  siblingsCount?: number;
  transportMethod?: string;
  healthConditions?: string;
  familyIncomeBracket?: string;
  strengths?: string;
  challenges?: string;
  lifeProjectGoals?: string;
  observations?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Não autorizado');

    const dossier = await prisma.pDTStudentDossier.upsert({
      where: { studentId },
      update: data,
      create: {
        studentId,
        ...data,
      },
    });

    revalidatePath(`/pdt/dossie/${studentId}`);
    revalidatePath(`/alunos/${studentId}`);
    return { success: true, dossier };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar dossiê' };
  }
}

export async function getPDTAttendances(params?: { studentId?: string; operatorId?: string }) {
  try {
    const where: any = {};
    if (params?.studentId) where.studentId = params.studentId;
    if (params?.operatorId) where.operatorId = params.operatorId;

    return await prisma.pDTAttendanceRecord.findMany({
      where,
      include: {
        student: {
          include: {
            enrollments: { include: { classGroup: true } },
          },
        },
        operator: true,
      },
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('Error in getPDTAttendances:', error);
    return [];
  }
}

export async function createPDTAttendance(data: {
  studentId: string;
  guardianName: string;
  reason: string;
  summary: string;
  actionPlan?: string;
}) {
  try {
    const session = await auth();
    let operatorId = session?.user?.id;
    if (!operatorId) {
      const admin = await prisma.operator.findFirst({ where: { isActive: true } });
      operatorId = admin?.id;
    }
    if (!operatorId) throw new Error('Operador não autenticado');

    const record = await prisma.pDTAttendanceRecord.create({
      data: {
        studentId: data.studentId,
        operatorId,
        guardianName: data.guardianName,
        reason: data.reason,
        summary: data.summary,
        actionPlan: data.actionPlan || null,
        status: 'CONCLUIDO',
      },
    });

    revalidatePath('/pdt');
    revalidatePath(`/pdt/dossie/${data.studentId}`);
    return { success: true, record };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao registrar atendimento' };
  }
}

export async function getPDTCouncils(classGroupId?: string) {
  try {
    const where: any = {};
    if (classGroupId) where.classGroupId = classGroupId;

    return await prisma.pDTClassCouncil.findMany({
      where,
      include: {
        classGroup: true,
        operator: true,
      },
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('Error in getPDTCouncils:', error);
    return [];
  }
}

export async function createPDTCouncil(data: {
  classGroupId: string;
  bimester: number;
  highlights?: string;
  concerns?: string;
  interventions?: string;
  minutes?: string;
}) {
  try {
    const session = await auth();
    let operatorId = session?.user?.id;
    if (!operatorId) {
      const admin = await prisma.operator.findFirst({ where: { isActive: true } });
      operatorId = admin?.id;
    }
    if (!operatorId) throw new Error('Operador não autenticado');

    const council = await prisma.pDTClassCouncil.create({
      data: {
        classGroupId: data.classGroupId,
        operatorId,
        bimester: data.bimester,
        highlights: data.highlights || null,
        concerns: data.concerns || null,
        interventions: data.interventions || null,
        minutes: data.minutes || null,
      },
    });

    revalidatePath('/pdt');
    return { success: true, council };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao registrar ata do conselho' };
  }
}
