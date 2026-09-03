'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const GESTOR_ROLES = ['Diretor', 'Coordenador', 'Secretário'];

export async function getClassesForAttendance(schoolYearId?: string) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role || '';
    const userId = session?.user?.id;
    const isGestor = GESTOR_ROLES.includes(userRole);

    let where: any = {};
    if (schoolYearId && schoolYearId !== 'all') {
      where.schoolYearId = schoolYearId;
    } else if (!schoolYearId) {
      // By default, show classes from the configured current school year
      const currentYear = await prisma.schoolYear.findFirst({
        where: { isCurrent: true },
      });
      if (currentYear) {
        where.schoolYearId = currentYear.id;
      }
    }

    // If teacher (and not Núcleo Gestor), only allow viewing their own assigned classes:
    // 1) via teacherClasses
    // 2) via subjectTeachers
    // 3) via pdtId (PDT Teacher)
    if (!isGestor) {
      if (!userId) return [];
      where.OR = [
        { teacherClasses: { some: { operatorId: userId } } },
        { subjectTeachers: { some: { operatorId: userId } } },
        { pdtId: userId },
      ];
    }

    return await prisma.classGroup.findMany({
      where,
      include: {
        grade: true,
        schoolYear: true,
        pdtTeacher: true,
        teacherClasses: {
          include: { operator: true },
        },
        _count: {
          select: { enrollments: true, subjectTeachers: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error in getClassesForAttendance:', error);
    return [];
  }
}

export async function getClassGroups(schoolYearId?: string) {
  try {
    let where: any = {};
    if (schoolYearId && schoolYearId !== 'all') {
      where = { schoolYearId };
    } else if (!schoolYearId) {
      // By default, show classes from the configured current school year
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
        teacherClasses: {
          include: { operator: true },
        },
        _count: {
          select: { enrollments: true, subjectTeachers: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error in getClassGroups:', error);
    return [];
  }
}

export async function createClassGroup(data: {
  name: string;
  shift: string;
  gradeId: string;
  schoolYearId: string;
}) {
  try {
    const classGroup = await prisma.classGroup.create({
      data: {
        name: data.name,
        shift: data.shift as any,
        gradeId: data.gradeId,
        schoolYearId: data.schoolYearId,
      },
    });

    revalidatePath('/turmas');
    revalidatePath('/');
    return { success: true, classGroup };
  } catch (error: any) {
    console.error('Error in createClassGroup:', error);
    return { success: false, error: error.message || 'Erro ao criar turma' };
  }
}

export async function getGrades() {
  try {
    return await prisma.grade.findMany({ orderBy: { name: 'asc' } });
  } catch (error) {
    console.error('Error in getGrades:', error);
    return [];
  }
}

export async function getSubjects(includeInactive = false) {
  try {
    return await prisma.subject.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error in getSubjects:', error);
    return [];
  }
}

export async function createSubject(data: { name: string; abbreviation?: string }) {
  try {
    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        abbreviation: data.abbreviation || null,
        isActive: true,
      },
    });

    revalidatePath('/configuracoes');
    return { success: true, subject };
  } catch (error: any) {
    console.error('Error in createSubject:', error);
    return { success: false, error: error.message || 'Erro ao criar disciplina' };
  }
}

export async function toggleSubjectStatus(id: string) {
  try {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) return { success: false, error: 'Disciplina não encontrada' };

    const updated = await prisma.subject.update({
      where: { id },
      data: { isActive: !subject.isActive },
    });

    revalidatePath('/configuracoes');
    return { success: true, subject: updated };
  } catch (error: any) {
    console.error('Error toggling subject status:', error);
    return { success: false, error: error.message || 'Erro ao alterar status da disciplina' };
  }
}

export async function getSchoolYears() {
  try {
    return await prisma.schoolYear.findMany({ orderBy: { year: 'desc' } });
  } catch (error) {
    console.error('Error in getSchoolYears:', error);
    return [];
  }
}

export async function getCurrentSchoolYear() {
  try {
    return await prisma.schoolYear.findFirst({ where: { isCurrent: true } });
  } catch (error) {
    console.error('Error in getCurrentSchoolYear:', error);
    return null;
  }
}

export async function createSchoolYear(data: {
  year: number;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}) {
  try {
    const existing = await prisma.schoolYear.findUnique({
      where: { year: data.year },
    });

    if (existing) {
      return { success: false, error: `O ano letivo ${data.year} já está cadastrado.` };
    }

    if (data.isCurrent) {
      await prisma.schoolYear.updateMany({
        data: { isCurrent: false },
      });
    }

    const schoolYear = await prisma.schoolYear.create({
      data: {
        year: Number(data.year),
        startDate: data.startDate ? new Date(data.startDate) : new Date(`${data.year}-02-01`),
        endDate: data.endDate ? new Date(data.endDate) : new Date(`${data.year}-12-15`),
        isCurrent: !!data.isCurrent,
      },
    });

    revalidatePath('/configuracoes');
    return { success: true, schoolYear };
  } catch (error: any) {
    console.error('Error in createSchoolYear:', error);
    return { success: false, error: error.message || 'Erro ao cadastrar ano letivo' };
  }
}

export async function updateSchoolYear(
  id: string,
  data: {
    year?: number;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  }
) {
  try {
    if (data.isCurrent) {
      await prisma.schoolYear.updateMany({
        where: { id: { not: id } },
        data: { isCurrent: false },
      });
    }

    const updateData: any = {};
    if (data.year !== undefined) updateData.year = Number(data.year);
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.isCurrent !== undefined) updateData.isCurrent = data.isCurrent;

    const schoolYear = await prisma.schoolYear.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/configuracoes');
    return { success: true, schoolYear };
  } catch (error: any) {
    console.error('Error in updateSchoolYear:', error);
    return { success: false, error: error.message || 'Erro ao atualizar ano letivo' };
  }
}

export async function setCurrentSchoolYear(id: string) {
  try {
    await prisma.schoolYear.updateMany({
      data: { isCurrent: false },
    });

    const schoolYear = await prisma.schoolYear.update({
      where: { id },
      data: { isCurrent: true },
    });

    revalidatePath('/configuracoes');
    return { success: true, schoolYear };
  } catch (error: any) {
    console.error('Error in setCurrentSchoolYear:', error);
    return { success: false, error: error.message || 'Erro ao definir ano letivo atual' };
  }
}

export async function assignTeacher(data: {
  subjectId: string;
  operatorId: string;
  classGroupId: string;
}) {
  try {
    const assignment = await prisma.subjectTeacher.create({ data });
    revalidatePath('/turmas');
    return { success: true, assignment };
  } catch (error: any) {
    console.error('Error in assignTeacher:', error);
    return { success: false, error: error.message || 'Erro ao vincular professor' };
  }
}

export async function getTeacherSubjects(operatorId: string) {
  try {
    return await prisma.subjectTeacher.findMany({
      where: { operatorId },
      include: { subject: true, classGroup: true },
    });
  } catch (error) {
    console.error('Error in getTeacherSubjects:', error);
    return [];
  }
}

export async function assignTeacherToClass(operatorId: string, classGroupId: string) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role || '';
    if (!session?.user || !GESTOR_ROLES.includes(userRole)) {
      return { success: false, error: 'Apenas o Núcleo Gestor pode vincular professores a turmas.' };
    }

    const assignment = await prisma.teacherClass.upsert({
      where: {
        operatorId_classGroupId: { operatorId, classGroupId },
      },
      update: {},
      create: { operatorId, classGroupId },
    });

    revalidatePath('/turmas');
    revalidatePath('/frequencia');
    return { success: true, assignment };
  } catch (error: any) {
    console.error('Error in assignTeacherToClass:', error);
    return { success: false, error: error.message || 'Erro ao vincular professor à turma' };
  }
}

export async function removeTeacherFromClass(operatorId: string, classGroupId: string) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role || '';
    if (!session?.user || !GESTOR_ROLES.includes(userRole)) {
      return { success: false, error: 'Apenas o Núcleo Gestor pode desvincular professores.' };
    }

    await prisma.teacherClass.deleteMany({
      where: { operatorId, classGroupId },
    });

    revalidatePath('/turmas');
    revalidatePath('/frequencia');
    return { success: true };
  } catch (error: any) {
    console.error('Error in removeTeacherFromClass:', error);
    return { success: false, error: error.message || 'Erro ao desvincular professor' };
  }
}
