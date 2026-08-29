'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createRAC(data: { enrollmentId: string, racTypeId: string, date: string, description?: string }) {
  const session = await auth();
  let operatorId = session?.user?.id;
  if (!operatorId) {
    const admin = await prisma.operator.findFirst({ where: { isActive: true } });
    operatorId = admin?.id;
  }
  if (!operatorId) throw new Error('Operador não encontrado');

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: data.enrollmentId }
    });

    if (!enrollment) throw new Error('Matrícula não encontrada');

    const rac = await prisma.rAC.create({
      data: {
        enrollmentId: data.enrollmentId,
        racTypeId: data.racTypeId,
        date: new Date(data.date),
        description: data.description,
        operatorId
      }
    });

    revalidatePath('/rac');
    revalidatePath('/rac/notas');
    revalidatePath('/');
    return { success: true, rac };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao criar RAC');
  }
}

export async function getRACs(params?: {
  classGroupId?: string;
  racTypeId?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const where: any = {};

  if (params?.classGroupId && params.classGroupId !== 'todas') {
    where.enrollment = { classGroupId: params.classGroupId };
  }
  if (params?.racTypeId && params.racTypeId !== 'todos') {
    where.racTypeId = params.racTypeId;
  }
  if (params?.severity && params.severity !== 'todas') {
    where.racType = { severity: params.severity };
  }

  if (params?.startDate || params?.endDate) {
    where.date = {};
    if (params?.startDate) {
      where.date.gte = new Date(`${params.startDate}T00:00:00.000Z`);
    }
    if (params?.endDate) {
      where.date.lte = new Date(`${params.endDate}T23:59:59.999Z`);
    }
  }

  const [racs, total] = await Promise.all([
    prisma.rAC.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        enrollment: {
          include: {
            student: true,
            classGroup: true,
          }
        },
        racType: true,
        operator: true
      },
      orderBy: { date: 'desc' }
    }),
    prisma.rAC.count({ where })
  ]);

  return { racs, total, pages: Math.ceil(total / pageSize) };
}

export async function getStudentRACs(studentId: string) {
  return await prisma.rAC.findMany({
    where: { enrollment: { studentId } },
    include: { racType: true, operator: true },
    orderBy: { date: 'desc' }
  });
}

export async function getRACGradesByClass(params: {
  classGroupId: string;
  bimester: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const year = params.year || new Date().getFullYear();
    const bimester = params.bimester || 1;

    // Define default bimester date range
    let startD: Date;
    let endD: Date;

    if (params.startDate && params.endDate) {
      startD = new Date(`${params.startDate}T00:00:00.000Z`);
      endD = new Date(`${params.endDate}T23:59:59.999Z`);
    } else {
      switch (bimester) {
        case 1:
          startD = new Date(`${year}-01-01T00:00:00.000Z`);
          endD = new Date(`${year}-04-30T23:59:59.999Z`);
          break;
        case 2:
          startD = new Date(`${year}-05-01T00:00:00.000Z`);
          endD = new Date(`${year}-06-30T23:59:59.999Z`);
          break;
        case 3:
          startD = new Date(`${year}-08-01T00:00:00.000Z`);
          endD = new Date(`${year}-09-30T23:59:59.999Z`);
          break;
        case 4:
        default:
          startD = new Date(`${year}-10-01T00:00:00.000Z`);
          endD = new Date(`${year}-12-31T23:59:59.999Z`);
          break;
      }
    }

    const classGroup = await prisma.classGroup.findUnique({
      where: { id: params.classGroupId },
      include: {
        grade: true,
        schoolYear: true,
        pdtTeacher: true,
        enrollments: {
          where: { status: 'ATIVO' },
          include: {
            student: true,
            racs: {
              where: {
                date: {
                  gte: startD,
                  lte: endD,
                },
              },
              include: {
                racType: true,
                operator: true,
              },
              orderBy: { date: 'asc' },
            },
          },
          orderBy: {
            student: { name: 'asc' },
          },
        },
      },
    });

    if (!classGroup) {
      return { success: false, error: 'Turma não encontrada' };
    }

    // Compute grades for each student according to SEDUC / School rules:
    // 1. Initial base score = 10.0
    // 2. First 4 RACs: 0 points lost (free tolerance)
    // 3. From 5th RAC onwards:
    //    - LEVE: 1 point lost
    //    - MODERADO: 2 points lost
    //    - GRAVE: 3 points lost
    // 4. Minimum score = 0.0
    const studentGrades = classGroup.enrollments.map((enr) => {
      const racs = enr.racs || [];
      const totalCount = racs.length;

      let leveCount = 0;
      let moderadoCount = 0;
      let graveCount = 0;

      racs.forEach((r) => {
        const sev = r.racType?.severity?.toUpperCase() || 'LEVE';
        if (sev === 'GRAVE') graveCount++;
        else if (sev === 'MODERADO') moderadoCount++;
        else leveCount++;
      });

      const toleranceCount = Math.min(4, totalCount);
      const penalizedRACs = racs.slice(4); // RACs from index 4 (5th) onwards

      let pointsLost = 0;
      let penalizedLeve = 0;
      let penalizedModerado = 0;
      let penalizedGrave = 0;

      penalizedRACs.forEach((r) => {
        const sev = r.racType?.severity?.toUpperCase() || 'LEVE';
        if (sev === 'GRAVE') {
          pointsLost += 3;
          penalizedGrave++;
        } else if (sev === 'MODERADO') {
          pointsLost += 2;
          penalizedModerado++;
        } else {
          pointsLost += 1;
          penalizedLeve++;
        }
      });

      const finalGrade = Math.max(0, 10 - pointsLost);

      let status = 'EXCELENTE';
      if (finalGrade < 5) status = 'CRITICO';
      else if (finalGrade < 7) status = 'REGULAR';
      else if (finalGrade < 9) status = 'BOM';

      return {
        enrollmentId: enr.id,
        studentId: enr.student.id,
        studentName: enr.student.name,
        registrationNumber: enr.student.registrationNumber,
        photoUrl: enr.student.photoUrl,
        totalRACs: totalCount,
        leveCount,
        moderadoCount,
        graveCount,
        toleranceCount,
        penalizedCount: penalizedRACs.length,
        penalizedLeve,
        penalizedModerado,
        penalizedGrave,
        pointsLost,
        finalGrade,
        status,
        racsList: racs,
      };
    });

    // Compute class averages
    const totalStudents = studentGrades.length;
    const averageGrade = totalStudents > 0
      ? Number((studentGrades.reduce((acc, s) => acc + s.finalGrade, 0) / totalStudents).toFixed(2))
      : 10.0;
    const countGrade10 = studentGrades.filter((s) => s.finalGrade === 10).length;
    const countCritical = studentGrades.filter((s) => s.finalGrade < 5).length;
    const countWithPenalties = studentGrades.filter((s) => s.penalizedCount > 0).length;

    return {
      success: true,
      classGroup: {
        id: classGroup.id,
        name: classGroup.name,
        shift: classGroup.shift,
        gradeName: classGroup.grade?.name,
        schoolYear: classGroup.schoolYear?.year || year,
        pdtName: classGroup.pdtTeacher?.name,
      },
      bimester,
      year,
      startDate: startD.toISOString().split('T')[0],
      endDate: endD.toISOString().split('T')[0],
      stats: {
        totalStudents,
        averageGrade,
        countGrade10,
        countCritical,
        countWithPenalties,
      },
      studentGrades,
    };
  } catch (error: any) {
    console.error('Error in getRACGradesByClass:', error);
    return { success: false, error: error.message || 'Erro ao calcular notas do RAC' };
  }
}
