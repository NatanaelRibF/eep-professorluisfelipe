'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getStudents(params?: {
  search?: string;
  query?: string;
  classGroupId?: string;
  shift?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || params?.limit || 10;
  const search = params?.search || params?.query;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { registrationNumber: { contains: search, mode: 'insensitive' } },
      { cpf: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (params?.status) {
    where.isActive = params.status === 'active' || params.status === 'ATIVO';
  }

  const enrollmentConditions: any = { status: 'ATIVO' };
  if (params?.classGroupId && params.classGroupId !== 'todas') {
    enrollmentConditions.classGroupId = params.classGroupId;
  }
  if (params?.shift && params.shift !== 'todos') {
    enrollmentConditions.classGroup = { shift: params.shift };
  }

  if (params?.classGroupId && params.classGroupId !== 'todas' || params?.shift && params.shift !== 'todos') {
    where.enrollments = {
      some: enrollmentConditions,
    };
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        enrollments: {
          where: { status: 'ATIVO' },
          include: {
            classGroup: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    students,
    total,
    pages: Math.ceil(total / pageSize),
  };
}

export async function getStudentById(id: string) {
  return await prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          classGroup: {
            include: { grade: true, schoolYear: true },
          },
          attendances: {
            include: { subject: true, operator: true },
            orderBy: { date: 'desc' },
          },
          racs: {
            include: { racType: true, operator: true },
            orderBy: { date: 'desc' },
          },
          occurrences: {
            include: { occurrenceType: true, operator: true },
            orderBy: { date: 'desc' },
          },
        },
      },
    },
  });
}

export async function createStudent(data: any) {
  try {
    const name = data.name;
    const cpf = data.cpf || null;
    const registrationNumber =
      data.registrationNumber ||
      `${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    const birthDate =
      data.birthDate || data.dateOfBirth
        ? new Date(data.birthDate || data.dateOfBirth)
        : null;
    const guardianName = data.guardianName || null;
    const guardianPhone = data.guardianPhone || null;
    const photoUrl = data.photoUrl || null;
    const address = data.address || null;
    const city = data.city || 'Sobral';
    const neighborhood = data.neighborhood || null;
    const classGroupId = data.classGroupId;

    const student = await prisma.student.create({
      data: {
        name,
        cpf,
        registrationNumber,
        birthDate,
        guardianName,
        guardianPhone,
        photoUrl,
        address,
        city,
        neighborhood,
        isActive: true,
        ...(classGroupId
          ? {
              enrollments: {
                create: {
                  classGroupId,
                  status: 'ATIVO',
                },
              },
            }
          : {}),
      },
      include: {
        enrollments: {
          include: {
            classGroup: true,
          },
        },
      },
    });

    revalidatePath('/alunos');
    revalidatePath('/');
    return { success: true, student };
  } catch (error: any) {
    console.error('Erro ao criar aluno:', error);
    throw new Error(error.message || 'Erro ao criar aluno');
  }
}

export async function updateStudent(id: string, data: any) {
  try {
    const name = data.name;
    const cpf = data.cpf || null;
    const registrationNumber = data.registrationNumber;
    const birthDate =
      data.birthDate || data.dateOfBirth
        ? new Date(data.birthDate || data.dateOfBirth)
        : null;
    const guardianName = data.guardianName || null;
    const guardianPhone = data.guardianPhone || null;
    const photoUrl = data.photoUrl;
    const address = data.address || null;
    const city = data.city || 'Sobral';
    const neighborhood = data.neighborhood || null;
    const classGroupId = data.classGroupId;

    const currentEnrollment = await prisma.enrollment.findFirst({
      where: { studentId: id, status: 'ATIVO' },
    });

    if (currentEnrollment && classGroupId && currentEnrollment.classGroupId !== classGroupId) {
      await prisma.enrollment.update({
        where: { id: currentEnrollment.id },
        data: { status: 'TRANSFERIDO' },
      });

      await prisma.enrollment.create({
        data: {
          studentId: id,
          classGroupId,
          status: 'ATIVO',
        },
      });
    } else if (!currentEnrollment && classGroupId) {
      await prisma.enrollment.create({
        data: {
          studentId: id,
          classGroupId,
          status: 'ATIVO',
        },
      });
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        name,
        cpf,
        registrationNumber,
        birthDate,
        guardianName,
        guardianPhone,
        ...(photoUrl !== undefined ? { photoUrl } : {}),
        address,
        city,
        neighborhood,
      },
      include: {
        enrollments: {
          include: {
            classGroup: true,
          },
        },
      },
    });

    revalidatePath('/alunos');
    revalidatePath(`/alunos/${id}`);
    return { success: true, student };
  } catch (error: any) {
    console.error('Erro ao atualizar aluno:', error);
    throw new Error(error.message || 'Erro ao atualizar aluno');
  }
}

export async function toggleStudentStatus(id: string) {
  try {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw new Error('Aluno não encontrado');

    const updated = await prisma.student.update({
      where: { id },
      data: { isActive: !student.isActive },
    });

    revalidatePath('/alunos');
    revalidatePath(`/alunos/${id}`);
    return { success: true, student: updated };
  } catch (error: any) {
    console.error('Erro ao alternar status do aluno:', error);
    throw new Error(error.message || 'Erro ao alternar status');
  }
}

export async function enrollStudent(studentId: string, classGroupId: string) {
  try {
    await prisma.enrollment.updateMany({
      where: { studentId, status: 'ATIVO' },
      data: { status: 'TRANSFERIDO' },
    });

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        classGroupId,
        status: 'ATIVO',
      },
      include: {
        classGroup: true,
      },
    });

    revalidatePath('/alunos');
    revalidatePath(`/alunos/${studentId}`);
    return { success: true, enrollment };
  } catch (error: any) {
    console.error('Erro ao matricular aluno:', error);
    throw new Error(error.message || 'Erro ao matricular aluno');
  }
}
