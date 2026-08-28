'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getRACTypes() {
  return await prisma.rACType.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createRACType(data: { name: string, description?: string, severity: string }) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const type = await prisma.rACType.create({ data });
    revalidatePath('/config/rac-types');
    return { success: true, type };
  } catch (error) {
    throw new Error('Erro ao criar tipo de RAC');
  }
}

export async function toggleRACTypeStatus(id: string) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const type = await prisma.rACType.findUnique({ where: { id } });
    if (!type) throw new Error('Tipo não encontrado');

    const updated = await prisma.rACType.update({
      where: { id },
      data: { isActive: !type.isActive }
    });
    revalidatePath('/config/rac-types');
    return { success: true, type: updated };
  } catch (error) {
    throw new Error('Erro ao alterar status');
  }
}

export async function getOccurrenceTypes() {
  return await prisma.occurrenceType.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createOccurrenceType(data: { name: string, description?: string, severity: string }) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const type = await prisma.occurrenceType.create({ data });
    revalidatePath('/config/occurrence-types');
    return { success: true, type };
  } catch (error) {
    throw new Error('Erro ao criar tipo de ocorrência');
  }
}

export async function toggleOccurrenceTypeStatus(id: string) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const type = await prisma.occurrenceType.findUnique({ where: { id } });
    if (!type) throw new Error('Tipo não encontrado');

    const updated = await prisma.occurrenceType.update({
      where: { id },
      data: { isActive: !type.isActive }
    });
    revalidatePath('/config/occurrence-types');
    return { success: true, type: updated };
  } catch (error) {
    throw new Error('Erro ao alterar status');
  }
}
