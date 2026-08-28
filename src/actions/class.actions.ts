'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getClassGroups(schoolYearId?: string) {
  const where = schoolYearId ? { schoolYearId } : {};
  return await prisma.classGroup.findMany({
    where,
    include: {
      grade: true,
      schoolYear: true,
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function createClassGroup(data: { name: string, shift: string, gradeId: string, schoolYearId: string }) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const classGroup = await prisma.classGroup.create({ data });
    revalidatePath('/classes');
    return { success: true, classGroup };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao criar turma');
  }
}

export async function getGrades() {
  return await prisma.grade.findMany({ orderBy: { name: 'asc' } });
}

export async function getSubjects() {
  return await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });
}

export async function createSubject(data: { name: string, abbreviation?: string }) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const subject = await prisma.subject.create({ data });
    revalidatePath('/subjects');
    return { success: true, subject };
  } catch (error) {
    throw new Error('Erro ao criar disciplina');
  }
}

export async function toggleSubjectStatus(id: string) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new Error('Disciplina não encontrada');

    const updated = await prisma.subject.update({
      where: { id },
      data: { isActive: !subject.isActive }
    });
    revalidatePath('/subjects');
    return { success: true, subject: updated };
  } catch (error) {
    throw new Error('Erro ao alterar status da disciplina');
  }
}

export async function getSchoolYears() {
  return await prisma.schoolYear.findMany({ orderBy: { year: 'desc' } });
}

export async function getCurrentSchoolYear() {
  return await prisma.schoolYear.findFirst({
    where: { isCurrent: true }
  });
}

export async function assignTeacher(data: { subjectId: string, operatorId: string, classGroupId: string }) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const assignment = await prisma.subjectTeacher.create({
      data: {
        subjectId: data.subjectId,
        operatorId: data.operatorId,
        classGroupId: data.classGroupId
      }
    });
    revalidatePath('/classes');
    return { success: true, assignment };
  } catch (error) {
    throw new Error('Erro ao vincular professor');
  }
}

export async function getTeacherSubjects(operatorId: string) {
  return await prisma.subjectTeacher.findMany({
    where: { operatorId },
    include: {
      subject: true,
      classGroup: true
    }
  });
}
