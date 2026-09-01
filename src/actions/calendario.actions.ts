'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getSchoolEvents(params?: {
  bimester?: number;
  type?: string;
  year?: number;
  month?: number;
}) {
  try {
    const where: any = {};

    if (params?.bimester && params.bimester !== 0) {
      where.bimester = params.bimester;
    }

    if (params?.type && params.type !== 'TODOS') {
      where.type = params.type;
    }

    const events = await prisma.schoolEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    // Compute basic statistics
    const holidaysCount = events.filter((e) => e.type === 'FERIADO' || e.isNonSchoolDay).length;
    const councilsCount = events.filter((e) => e.type === 'CONSELHO').length;
    const eventsCount = events.filter((e) => e.type === 'EVENTO').length;

    return {
      success: true,
      events,
      stats: {
        totalEvents: events.length,
        holidaysCount,
        councilsCount,
        eventsCount,
      },
    };
  } catch (error: any) {
    console.error('Error getting school events:', error);
    return { success: false, error: error.message || 'Erro ao carregar eventos do calendário' };
  }
}

export async function createSchoolEvent(data: {
  title: string;
  description?: string;
  type: string;
  startDate: string;
  endDate?: string;
  isNonSchoolDay?: boolean;
  bimester?: number;
  color?: string;
}) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const currentYear = await prisma.schoolYear.findFirst({ where: { isCurrent: true } });

    const event = await prisma.schoolEvent.create({
      data: {
        schoolYearId: currentYear?.id,
        title: data.title,
        description: data.description || null,
        type: data.type || 'EVENTO',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isNonSchoolDay: data.isNonSchoolDay ?? (data.type === 'FERIADO' || data.type === 'RECESSO'),
        bimester: data.bimester ? Number(data.bimester) : null,
        color: data.color || 'blue',
      },
    });

    revalidatePath('/calendario');
    revalidatePath('/configuracoes');
    return { success: true, event };
  } catch (error: any) {
    console.error('Error creating school event:', error);
    return { success: false, error: error.message || 'Erro ao criar evento' };
  }
}

export async function deleteSchoolEvent(id: string) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    await prisma.schoolEvent.delete({ where: { id } });
    revalidatePath('/calendario');
    revalidatePath('/configuracoes');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
