'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getSchoolSpaces() {
  try {
    // Seed default spaces if none exist
    const count = await prisma.schoolSpace.count();
    if (count === 0) {
      await prisma.schoolSpace.createMany({
        data: [
          { name: 'Laboratório de Informática (LEI 1)', category: 'LEI', capacity: 36, location: 'Bloco A', resources: '36 Computadores, Projetor, Ar Condicionado' },
          { name: 'Laboratório de Informática (LEI 2)', category: 'LEI', capacity: 36, location: 'Bloco A', resources: '36 Computadores, Ar Condicionado' },
          { name: 'Laboratório Multidisciplinar de Ciências', category: 'Ciências', capacity: 40, location: 'Bloco B', resources: 'Bancadas, Vidrarias, Microscópios, Pia' },
          { name: 'Biblioteca Escolar / Sala de Estudos', category: 'Biblioteca', capacity: 50, location: 'Bloco Central', resources: 'Mesas de grupo, Acervo, Computador de consulta' },
          { name: 'Auditório Principal', category: 'Auditório', capacity: 150, location: 'Entrada', resources: 'Palco, Som embutido, Telão, Iluminação' },
          { name: 'Quadra Poliesportiva Coberta', category: 'Quadra', capacity: 80, location: 'Área Externa', resources: 'Traves, Rede de vôlei, Placares' },
        ],
      });
    }

    return await prisma.schoolSpace.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error in getSchoolSpaces:', error);
    return [];
  }
}

export async function getSpaceBookings(params?: { date?: string; spaceId?: string }) {
  try {
    const where: any = {};
    if (params?.spaceId) where.spaceId = params.spaceId;
    if (params?.date) where.date = new Date(params.date);

    return await prisma.spaceBooking.findMany({
      where,
      include: {
        space: true,
        operator: true,
      },
      orderBy: [{ date: 'asc' }, { classNumber: 'asc' }],
    });
  } catch (error) {
    console.error('Error in getSpaceBookings:', error);
    return [];
  }
}

export async function createSpaceBooking(data: {
  spaceId: string;
  date: string;
  classNumber: number;
  classGroupName?: string;
  purpose: string;
}) {
  try {
    const session = await auth();
    let operatorId = session?.user?.id;
    if (!operatorId) {
      const admin = await prisma.operator.findFirst({ where: { isActive: true } });
      operatorId = admin?.id;
    }
    if (!operatorId) throw new Error('Operador não autenticado');

    const bookingDate = new Date(data.date);

    // Check conflict
    const existing = await prisma.spaceBooking.findFirst({
      where: {
        spaceId: data.spaceId,
        date: bookingDate,
        classNumber: Number(data.classNumber),
        status: 'CONFIRMADO',
      },
    });

    if (existing) {
      return { success: false, error: 'Este espaço já está reservado para este horário de aula!' };
    }

    const booking = await prisma.spaceBooking.create({
      data: {
        spaceId: data.spaceId,
        operatorId,
        date: bookingDate,
        classNumber: Number(data.classNumber),
        classGroupName: data.classGroupName || null,
        purpose: data.purpose,
        status: 'CONFIRMADO',
      },
    });

    revalidatePath('/imobilizados');
    revalidatePath('/imobilizados/espacos');
    return { success: true, booking };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao agendar espaço' };
  }
}

export async function cancelSpaceBooking(bookingId: string) {
  try {
    await prisma.spaceBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELADO' },
    });

    revalidatePath('/imobilizados');
    revalidatePath('/imobilizados/espacos');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao cancelar reserva' };
  }
}
