'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getRACTypes(includeInactive = false) {
  try {
    return await prisma.rACType.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching RAC types:', error);
    return [];
  }
}

export async function createRACType(data: {
  name: string;
  description?: string;
  severity: string;
}) {
  try {
    const racType = await prisma.rACType.create({
      data: {
        name: data.name,
        description: data.description || null,
        severity: data.severity as any,
        isActive: true,
      },
    });

    revalidatePath('/configuracoes');
    return { success: true, racType };
  } catch (error: any) {
    console.error('Error in createRACType:', error);
    return { success: false, error: error.message || 'Erro ao criar tipo de RAC' };
  }
}

export async function toggleRACTypeStatus(id: string) {
  try {
    const racType = await prisma.rACType.findUnique({ where: { id } });
    if (!racType) return { success: false, error: 'Tipo de RAC não encontrado' };

    const updated = await prisma.rACType.update({
      where: { id },
      data: { isActive: !racType.isActive },
    });

    revalidatePath('/configuracoes');
    return { success: true, racType: updated };
  } catch (error: any) {
    console.error('Error toggling RAC type status:', error);
    return { success: false, error: error.message || 'Erro ao alterar status' };
  }
}

export async function getOccurrenceTypes(includeInactive = false) {
  try {
    return await prisma.occurrenceType.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching occurrence types:', error);
    return [];
  }
}

export async function createOccurrenceType(data: {
  name: string;
  description?: string;
  severity: string;
}) {
  try {
    const occurrenceType = await prisma.occurrenceType.create({
      data: {
        name: data.name,
        description: data.description || null,
        severity: data.severity as any,
        isActive: true,
      },
    });

    revalidatePath('/configuracoes');
    return { success: true, occurrenceType };
  } catch (error: any) {
    console.error('Error in createOccurrenceType:', error);
    return { success: false, error: error.message || 'Erro ao criar tipo de ocorrência' };
  }
}

export async function toggleOccurrenceTypeStatus(id: string) {
  try {
    const occurrenceType = await prisma.occurrenceType.findUnique({ where: { id } });
    if (!occurrenceType) return { success: false, error: 'Tipo de ocorrência não encontrado' };

    const updated = await prisma.occurrenceType.update({
      where: { id },
      data: { isActive: !occurrenceType.isActive },
    });

    revalidatePath('/configuracoes');
    return { success: true, occurrenceType: updated };
  } catch (error: any) {
    console.error('Error toggling occurrence type status:', error);
    return { success: false, error: error.message || 'Erro ao alterar status' };
  }
}
