'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const GESTOR_ROLES = ['Diretor', 'Coordenador', 'Secretário'];

export async function getPDTClasses(schoolYearId?: string) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role || '';
    const userId = session?.user?.id;
    const isGestor = GESTOR_ROLES.includes(userRole);

    let where: any = {};
    if (schoolYearId && schoolYearId !== 'all') {
      where.schoolYearId = schoolYearId;
    } else if (!schoolYearId) {
      const currentYear = await prisma.schoolYear.findFirst({
        where: { isCurrent: true },
      });
      if (currentYear) {
        where.schoolYearId = currentYear.id;
      }
    }

    // If teacher (and not Núcleo Gestor), only allow viewing their own assigned PDT class(es)
    if (!isGestor) {
      if (!userId) return [];
      where.pdtId = userId;
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
    const userRole = (session?.user as any)?.role || '';
    const isGestor = GESTOR_ROLES.includes(userRole);

    if (!isGestor) {
      return {
        success: false,
        error: 'Apenas o Núcleo Gestor (Diretor, Coordenador e Secretário) pode definir os professores PDT das turmas.',
      };
    }

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
    const session = await auth();
    const userRole = (session?.user as any)?.role || '';
    const userId = session?.user?.id;
    const isGestor = GESTOR_ROLES.includes(userRole);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          where: { status: 'ATIVO' },
          include: {
            classGroup: {
              include: { pdtTeacher: true },
            },
          },
        },
      },
    });

    if (!student) return null;

    // Check permissions for teacher
    if (!isGestor) {
      const isPDTOfStudent = student.enrollments.some(
        (enr) => enr.classGroup.pdtId === userId
      );
      if (!isPDTOfStudent) {
        return {
          error: 'Acesso restrito: Você só pode acessar o dossiê de estudantes da sua própria turma de PDT.',
        };
      }
    }

    const [dossier, attendances, racs, occurrences] = await Promise.all([
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
    const session = await auth();
    const userRole = (session?.user as any)?.role || '';
    const userId = session?.user?.id;
    const isGestor = GESTOR_ROLES.includes(userRole);

    const where: any = {};
    if (params?.studentId) where.studentId = params.studentId;
    if (params?.operatorId) where.operatorId = params.operatorId;

    if (!isGestor && userId) {
      // Filter attendances for students belonging to this PDT's assigned classes or created by them
      where.OR = [
        { operatorId: userId },
        {
          student: {
            enrollments: {
              some: {
                status: 'ATIVO',
                classGroup: { pdtId: userId },
              },
            },
          },
        },
      ];
    }

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
    const session = await auth();
    const userRole = (session?.user as any)?.role || '';
    const userId = session?.user?.id;
    const isGestor = GESTOR_ROLES.includes(userRole);

    const where: any = {};
    if (classGroupId) where.classGroupId = classGroupId;

    if (!isGestor && userId) {
      where.classGroup = { pdtId: userId };
    }

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
