'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getOperators() {
  try {
    return await prisma.operator.findMany({
      include: { role: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching operators:', error);
    return [];
  }
}

export async function createOperator(data: {
  name: string;
  email: string;
  password: string;
  roleId: string;
}) {
  try {
    const existing = await prisma.operator.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: 'Já existe um operador cadastrado com este e-mail' };
    }

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
  } catch (error: any) {
    console.error('Error in createOperator:', error);
    return { success: false, error: error.message || 'Erro ao criar operador' };
  }
}

export async function updateOperator(
  id: string,
  data: { name?: string; email?: string; roleId?: string; isActive?: boolean }
) {
  try {
    const operator = await prisma.operator.update({
      where: { id },
      data,
    });

    revalidatePath('/operadores');
    return { success: true, operator };
  } catch (error: any) {
    console.error('Error updating operator:', error);
    return { success: false, error: error.message || 'Erro ao atualizar operador' };
  }
}

export async function toggleOperatorStatus(id: string) {
  try {
    const operator = await prisma.operator.findUnique({ where: { id } });
    if (!operator) return { success: false, error: 'Operador não encontrado' };

    const updated = await prisma.operator.update({
      where: { id },
      data: { isActive: !operator.isActive },
    });

    revalidatePath('/operadores');
    return { success: true, operator: updated };
  } catch (error: any) {
    console.error('Error toggling operator status:', error);
    return { success: false, error: error.message || 'Erro ao alterar status' };
  }
}

export async function getOperatorRoles() {
  try {
    return await prisma.operatorRole.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching operator roles:', error);
    return [];
  }
}
