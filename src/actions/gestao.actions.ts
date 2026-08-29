'use server';

import { prisma } from '@/lib/prisma';

export async function getStrategicManagementData() {
  try {
    const [
      totalStudents,
      totalClasses,
      totalOperators,
      criticalAbsenceStudents,
      examStats,
      electivesStats,
      internshipStats,
      spaceStats,
    ] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.classGroup.count(),
      prisma.operator.count({ where: { isActive: true } }),
      
      // Busca Ativa: Alunos com faltas recentes
      prisma.attendance.groupBy({
        by: ['enrollmentId'],
        where: { status: 'AUSENTE' },
        _count: { status: true },
        having: {
          status: { _count: { gte: 3 } },
        },
      }),

      // Simulados SPAECE / Desempenho
      prisma.examSubmission.groupBy({
        by: ['performanceTier'],
        _count: { performanceTier: true },
      }),

      // Eletivas Ocupação
      prisma.electiveSubject.findMany({
        where: { isActive: true },
        include: {
          operator: true,
          _count: { select: { enrollments: true } },
        },
      }),

      // Estágios
      prisma.studentInternship.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Espaços escolares
      prisma.schoolSpace.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { bookings: true } },
        },
      }),
    ]);

    // Fetch student info for critical absence list
    const criticalEnrollmentIds = criticalAbsenceStudents.map((c) => c.enrollmentId);
    const criticalStudentsList = await prisma.enrollment.findMany({
      where: { id: { in: criticalEnrollmentIds } },
      include: {
        student: true,
        classGroup: { include: { pdtTeacher: true } },
        _count: { select: { attendances: { where: { status: 'AUSENTE' } } } },
      },
      take: 10,
    });

    return {
      totalStudents,
      totalClasses,
      totalOperators,
      criticalStudentsCount: criticalAbsenceStudents.length,
      criticalStudentsList,
      examStats,
      electivesStats,
      internshipStats,
      spaceStats,
    };
  } catch (error) {
    console.error('Error in getStrategicManagementData:', error);
    return null;
  }
}
