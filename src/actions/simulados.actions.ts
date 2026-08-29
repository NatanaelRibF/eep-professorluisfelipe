'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getExams(params?: { category?: string }) {
  try {
    const where: any = {};
    if (params?.category) where.category = params.category;

    return await prisma.exam.findMany({
      where,
      include: {
        _count: { select: { submissions: true } },
      },
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('Error in getExams:', error);
    return [];
  }
}

export async function getExamById(id: string) {
  try {
    return await prisma.exam.findUnique({
      where: { id },
      include: {
        submissions: {
          include: {
            student: {
              include: {
                enrollments: { include: { classGroup: true } },
              },
            },
          },
          orderBy: { score: 'desc' },
        },
      },
    });
  } catch (error) {
    console.error('Error in getExamById:', error);
    return null;
  }
}

export async function createExam(data: {
  title: string;
  category: string;
  targetGrade: string;
  date: string;
  totalQuestions: number;
  answerKey: Array<{ q: number; answer: string; descriptor?: string }>;
  description?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Não autorizado');

    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        category: data.category,
        targetGrade: data.targetGrade,
        date: new Date(data.date),
        totalQuestions: Number(data.totalQuestions),
        answerKey: data.answerKey,
        description: data.description || null,
        isActive: true,
      },
    });

    revalidatePath('/simulados');
    return { success: true, exam };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao criar simulado' };
  }
}

export async function submitExamAnswers(data: {
  examId: string;
  studentId: string;
  answers: Record<string, string>;
}) {
  try {
    const exam = await prisma.exam.findUnique({ where: { id: data.examId } });
    if (!exam) throw new Error('Simulado não encontrado');

    const answerKey = (exam.answerKey as Array<{ q: number; answer: string; descriptor?: string }>) || [];
    let correctCount = 0;
    const descriptorStats: Record<string, { correct: number; total: number }> = {};

    answerKey.forEach((item) => {
      const studentAns = data.answers[String(item.q)]?.toUpperCase().trim();
      const isCorrect = studentAns === item.answer.toUpperCase().trim();

      if (isCorrect) correctCount++;

      const desc = item.descriptor || 'GERAL';
      if (!descriptorStats[desc]) descriptorStats[desc] = { correct: 0, total: 0 };
      descriptorStats[desc].total++;
      if (isCorrect) descriptorStats[desc].correct++;
    });

    const score = Math.round((correctCount / answerKey.length) * 100);

    let performanceTier = 'INTERMEDIARIO';
    if (score < 40) performanceTier = 'MUITO_CRITICO';
    else if (score < 60) performanceTier = 'CRITICO';
    else if (score >= 80) performanceTier = 'ADEQUADO';

    const submission = await prisma.examSubmission.upsert({
      where: {
        examId_studentId: {
          examId: data.examId,
          studentId: data.studentId,
        },
      },
      update: {
        score,
        correctCount,
        answers: data.answers,
        descriptorStats,
        performanceTier,
        submittedAt: new Date(),
      },
      create: {
        examId: data.examId,
        studentId: data.studentId,
        score,
        correctCount,
        answers: data.answers,
        descriptorStats,
        performanceTier,
      },
    });

    revalidatePath(`/simulados/${data.examId}`);
    return { success: true, submission };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao lançar respostas do simulado' };
  }
}
