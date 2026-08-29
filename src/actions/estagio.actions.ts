'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getInternshipCompanies() {
  try {
    return await prisma.internshipCompany.findMany({
      include: {
        _count: { select: { internships: true } },
      },
      orderBy: { tradeName: 'asc' },
    });
  } catch (error) {
    console.error('Error in getInternshipCompanies:', error);
    return [];
  }
}

export async function createInternshipCompany(data: {
  corporateName: string;
  tradeName: string;
  cnpj?: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  industryArea: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Não autorizado');

    const company = await prisma.internshipCompany.create({
      data: {
        corporateName: data.corporateName,
        tradeName: data.tradeName,
        cnpj: data.cnpj || null,
        contactPerson: data.contactPerson,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || 'Sobral',
        industryArea: data.industryArea,
        isActive: true,
      },
    });

    revalidatePath('/estagio');
    revalidatePath('/estagio/empresas');
    return { success: true, company };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao cadastrar empresa parceira' };
  }
}

export async function getStudentInternships(params?: { status?: string; companyId?: string }) {
  try {
    const where: any = {};
    if (params?.status) where.status = params.status;
    if (params?.companyId) where.companyId = params.companyId;

    return await prisma.studentInternship.findMany({
      where,
      include: {
        student: {
          include: { enrollments: { include: { classGroup: true } } },
        },
        company: true,
        advisor: true,
        _count: { select: { logs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error in getStudentInternships:', error);
    return [];
  }
}

export async function getStudentInternshipById(id: string) {
  try {
    return await prisma.studentInternship.findUnique({
      where: { id },
      include: {
        student: {
          include: { enrollments: { include: { classGroup: true } } },
        },
        company: true,
        advisor: true,
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });
  } catch (error) {
    console.error('Error in getStudentInternshipById:', error);
    return null;
  }
}

export async function createStudentInternship(data: {
  studentId: string;
  companyId: string;
  advisorId: string;
  courseName: string;
  totalHours: number;
  startDate: string;
  endDate?: string;
  supervisorName?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Não autorizado');

    const internship = await prisma.studentInternship.create({
      data: {
        studentId: data.studentId,
        companyId: data.companyId,
        advisorId: data.advisorId,
        courseName: data.courseName,
        totalHours: Number(data.totalHours) || 400,
        completedHours: 0,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        supervisorName: data.supervisorName || null,
        status: 'EM_ANDAMENTO',
      },
    });

    revalidatePath('/estagio');
    return { success: true, internship };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao vincular aluno ao estágio' };
  }
}

export async function addInternshipLog(data: {
  internshipId: string;
  monthYear: string;
  hoursLogged: number;
  activities: string;
  feedback?: string;
}) {
  try {
    const hours = Number(data.hoursLogged);
    const log = await prisma.internshipLog.create({
      data: {
        internshipId: data.internshipId,
        monthYear: data.monthYear,
        hoursLogged: hours,
        activities: data.activities,
        feedback: data.feedback || null,
      },
    });

    // Update completed hours
    await prisma.studentInternship.update({
      where: { id: data.internshipId },
      data: {
        completedHours: { increment: hours },
      },
    });

    revalidatePath(`/estagio/${data.internshipId}`);
    revalidatePath('/estagio');
    return { success: true, log };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao registrar frequência de estágio' };
  }
}
