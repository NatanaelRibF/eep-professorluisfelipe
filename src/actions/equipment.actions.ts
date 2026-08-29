'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { CLASS_SLOTS } from '@/lib/constants';

export async function getEquipments(filters?: {
  category?: string;
  status?: string;
  search?: string;
}) {
  try {
    const where: any = { isActive: true };

    if (filters?.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const equipments = await prisma.equipment.findMany({
      where,
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { operator: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return equipments;
  } catch (error: any) {
    console.error('Error in getEquipments:', error);
    return [];
  }
}

export async function getEquipmentById(id: string) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { date: 'desc' },
          include: { operator: true },
        },
      },
    });

    return equipment;
  } catch (error: any) {
    console.error('Error in getEquipmentById:', error);
    return null;
  }
}

export async function createEquipment(data: {
  name: string;
  code: string;
  category: string;
  brand?: string;
  model?: string;
  location: string;
  description?: string;
}) {
  try {
    const existing = await prisma.equipment.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return { success: false, error: 'Já existe um equipamento cadastrado com este código/patrimônio.' };
    }

    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        code: data.code,
        category: data.category,
        brand: data.brand || null,
        model: data.model || null,
        location: data.location,
        description: data.description || null,
        status: 'DISPONIVEL',
        isActive: true,
      },
    });

    revalidatePath('/imobilizados');
    revalidatePath('/imobilizados/agenda');
    return { success: true, equipment };
  } catch (error: any) {
    console.error('Error in createEquipment:', error);
    return { success: false, error: error.message || 'Erro ao cadastrar equipamento.' };
  }
}

export async function updateEquipment(
  id: string,
  data: {
    name?: string;
    code?: string;
    category?: string;
    brand?: string;
    model?: string;
    location?: string;
    status?: string;
    description?: string;
  }
) {
  try {
    const equipment = await prisma.equipment.update({
      where: { id },
      data,
    });

    revalidatePath('/imobilizados');
    revalidatePath(`/imobilizados/${id}`);
    revalidatePath('/imobilizados/agenda');
    return { success: true, equipment };
  } catch (error: any) {
    console.error('Error in updateEquipment:', error);
    return { success: false, error: error.message || 'Erro ao atualizar equipamento.' };
  }
}

export async function deleteEquipment(id: string) {
  try {
    await prisma.equipment.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/imobilizados');
    revalidatePath('/imobilizados/agenda');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteEquipment:', error);
    return { success: false, error: error.message || 'Erro ao desativar equipamento.' };
  }
}

export async function getEquipmentSchedule(dateStr: string) {
  try {
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

    const [equipments, bookings] = await Promise.all([
      prisma.equipment.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      }),
      prisma.equipmentBooking.findMany({
        where: {
          date: targetDate,
          status: { not: 'CANCELADO' },
        },
        include: {
          operator: true,
          equipment: true,
        },
      }),
    ]);

    return {
      date: dateStr,
      equipments,
      bookings,
      slots: CLASS_SLOTS,
    };
  } catch (error: any) {
    console.error('Error in getEquipmentSchedule:', error);
    return {
      date: dateStr,
      equipments: [],
      bookings: [],
      slots: CLASS_SLOTS,
    };
  }
}

export async function createEquipmentBooking(data: {
  equipmentId: string;
  date: string;
  classNumber: number;
  classGroupName?: string;
  purpose?: string;
  operatorId?: string;
}) {
  try {
    const session = await auth();
    const operatorId = data.operatorId || session?.user?.id;

    if (!operatorId) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const bookingDate = new Date(`${data.date}T00:00:00.000Z`);

    // Check if slot is already booked for this equipment
    const conflict = await prisma.equipmentBooking.findFirst({
      where: {
        equipmentId: data.equipmentId,
        date: bookingDate,
        classNumber: Number(data.classNumber),
        status: { in: ['RESERVADO', 'EM_USO'] },
      },
      include: { operator: true },
    });

    if (conflict) {
      return {
        success: false,
        error: `Este equipamento já está reservado na ${data.classNumber}ª Aula por ${conflict.operator.name}.`,
      };
    }

    const booking = await prisma.equipmentBooking.create({
      data: {
        equipmentId: data.equipmentId,
        operatorId,
        date: bookingDate,
        classNumber: Number(data.classNumber),
        classGroupName: data.classGroupName || null,
        purpose: data.purpose || null,
        status: 'RESERVADO',
      },
    });

    revalidatePath('/imobilizados');
    revalidatePath('/imobilizados/agenda');
    revalidatePath(`/imobilizados/${data.equipmentId}`);
    return { success: true, booking };
  } catch (error: any) {
    console.error('Error in createEquipmentBooking:', error);
    return { success: false, error: error.message || 'Erro ao realizar reserva.' };
  }
}

export async function cancelEquipmentBooking(bookingId: string) {
  try {
    const booking = await prisma.equipmentBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: 'Reserva não encontrada.' };
    }

    const updated = await prisma.equipmentBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELADO' },
    });

    // If equipment was EM_USO by this booking, set back to DISPONIVEL
    await prisma.equipment.update({
      where: { id: booking.equipmentId },
      data: { status: 'DISPONIVEL' },
    });

    revalidatePath('/imobilizados');
    revalidatePath('/imobilizados/agenda');
    revalidatePath(`/imobilizados/${booking.equipmentId}`);
    return { success: true, booking: updated };
  } catch (error: any) {
    console.error('Error in cancelEquipmentBooking:', error);
    return { success: false, error: error.message || 'Erro ao cancelar reserva.' };
  }
}

export async function checkOutEquipment(bookingId: string) {
  try {
    const booking = await prisma.equipmentBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: 'Reserva não encontrada.' };
    }

    await prisma.$transaction([
      prisma.equipmentBooking.update({
        where: { id: bookingId },
        data: {
          status: 'EM_USO',
          checkedOutAt: new Date(),
        },
      }),
      prisma.equipment.update({
        where: { id: booking.equipmentId },
        data: { status: 'EM_USO' },
      }),
    ]);

    revalidatePath('/imobilizados');
    revalidatePath('/imobilizados/agenda');
    revalidatePath(`/imobilizados/${booking.equipmentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error in checkOutEquipment:', error);
    return { success: false, error: error.message || 'Erro ao registrar retirada.' };
  }
}

export async function checkInEquipment(bookingId: string, returnNotes?: string) {
  try {
    const booking = await prisma.equipmentBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { success: false, error: 'Reserva não encontrada.' };
    }

    await prisma.$transaction([
      prisma.equipmentBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CONCLUIDO',
          checkedInAt: new Date(),
          returnNotes: returnNotes || null,
        },
      }),
      prisma.equipment.update({
        where: { id: booking.equipmentId },
        data: { status: 'DISPONIVEL' },
      }),
    ]);

    revalidatePath('/imobilizados');
    revalidatePath('/imobilizados/agenda');
    revalidatePath(`/imobilizados/${booking.equipmentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error in checkInEquipment:', error);
    return { success: false, error: error.message || 'Erro ao registrar devolução.' };
  }
}
