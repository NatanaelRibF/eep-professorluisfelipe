'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getOperators() {
  return await prisma.operator.findMany({
    include: { role: true },
    orderBy: { name: 'asc' },
  });
}

export async function createOperator(data: {
  name: string;
  email: string;
  password: string;
  roleId: string;
}) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const operator = await prisma.operator.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        roleId: data.roleId,
        isActive: true,
      },
    });

    revalidatePath('/operadores');
    return { success: true, operator };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao criar operador');
  }
}

export async function updateOperator(
  id: string,
  data: { name?: string; email?: string; roleId?: string; isActive?: boolean }
) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const operator = await prisma.operator.update({
      where: { id },
      data,
    });

    revalidatePath('/operadores');
    return { success: true, operator };
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao atualizar operador');
  }
}

export async function toggleOperatorStatus(id: string) {
  const session = await auth();
  if (!session) throw new Error('Não autorizado');

  try {
    const operator = await prisma.operator.findUnique({ where: { id } });
    if (!operator) throw new Error('Operador não encontrado');

    const updated = await prisma.operator.update({
      where: { id },
      data: { isActive: !operator.isActive },
    });

    revalidatePath('/operadores');
    return { success: true, operator: updated };
  } catch (error) {
    throw new Error('Erro ao alterar status do operador');
  }
}

export async function getOperatorRoles() {
  return await prisma.operatorRole.findMany({
    orderBy: { name: 'asc' },
  });
}
