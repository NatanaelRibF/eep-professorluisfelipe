'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getClassGroups(schoolYearId?: string) {
  try {
    const where = schoolYearId ? { schoolYearId } : {};
    return await prisma.classGroup.findMany({
      where,
      include: {
        grade: true,
        schoolYear: true,
        _count: {
          select: { enrollments: true },
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

export async function getSubjects() {
  try {
    return await prisma.subject.findMany({
      where: { isActive: true },
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
