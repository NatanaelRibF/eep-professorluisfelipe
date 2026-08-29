'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getOperators() {
  try {
    return await prisma.operator.findMany({
      include: {
        role: true,
        teacherSubjects: {
          include: { subject: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching operators:', error);
    return [];
  }
}

export async function getOperatorById(id: string) {
  try {
    return await prisma.operator.findUnique({
      where: { id },
      include: {
        role: true,
        teacherSubjects: {
          include: { subject: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching operator by ID:', error);
    return null;
  }
}

export async function createOperator(data: {
  name: string;
  nickname?: string;
  email: string;
  password: string;
  roleId: string;
  avatarUrl?: string;
  subjectIds?: string[];
}) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'Diretor') {
      return { success: false, error: 'Apenas a Direção Escolar tem permissão para cadastrar novos operadores.' };
    }

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
        nickname: data.nickname || null,
        email: data.email,
        passwordHash: hashedPassword,
        roleId: data.roleId,
        avatarUrl: data.avatarUrl || null,
        isActive: true,
        ...(data.subjectIds && data.subjectIds.length > 0
          ? {
              teacherSubjects: {
                create: data.subjectIds.map((subjectId) => ({
                  subjectId,
                })),
              },
            }
          : {}),
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
  data: {
    name?: string;
    nickname?: string;
    email?: string;
    roleId?: string;
    avatarUrl?: string;
    password?: string;
    isActive?: boolean;
    subjectIds?: string[];
  }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'Diretor') {
      return { success: false, error: 'Apenas a Direção Escolar tem permissão para alterar outros operadores.' };
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.nickname !== undefined) updateData.nickname = data.nickname || null;
    if (data.email !== undefined) {
      const existing = await prisma.operator.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== id) {
        return { success: false, error: 'Já existe outro operador com este e-mail' };
      }
      updateData.email = data.email;
    }
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.password && data.password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    // Update teacher subjects if provided
    if (data.subjectIds !== undefined) {
      await prisma.teacherSubject.deleteMany({
        where: { operatorId: id },
      });

      if (data.subjectIds.length > 0) {
        await prisma.teacherSubject.createMany({
          data: data.subjectIds.map((subjectId) => ({
            operatorId: id,
            subjectId,
          })),
        });
      }
    }

    const operator = await prisma.operator.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/operadores');
    revalidatePath(`/operadores/${id}/editar`);
    return { success: true, operator };
  } catch (error: any) {
    console.error('Error updating operator:', error);
    return { success: false, error: error.message || 'Erro ao atualizar operador' };
  }
}

export async function toggleOperatorStatus(id: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'Diretor') {
      return { success: false, error: 'Apenas a Direção Escolar tem permissão para alterar o status de operadores.' };
    }

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
    // Ensure all roles and their updated permissions exist in the database
    await Promise.all([
      prisma.operatorRole.upsert({
        where: { name: 'Diretor' },
        update: {
          permissions: ['manage_students', 'manage_attendance', 'manage_rac', 'manage_occurrences', 'manage_operators', 'manage_classes', 'manage_subjects', 'manage_settings', 'view_reports', 'manage_equipment', 'view_equipment', 'manage_pdt', 'manage_internships', 'view_management'],
        },
        create: {
          name: 'Diretor',
          description: 'Direção Geral da Escola',
          permissions: ['manage_students', 'manage_attendance', 'manage_rac', 'manage_occurrences', 'manage_operators', 'manage_classes', 'manage_subjects', 'manage_settings', 'view_reports', 'manage_equipment', 'view_equipment', 'manage_pdt', 'manage_internships', 'view_management'],
        },
      }),
      prisma.operatorRole.upsert({
        where: { name: 'Coordenador' },
        update: {
          permissions: ['manage_students', 'manage_attendance', 'manage_rac', 'manage_occurrences', 'manage_classes', 'manage_subjects', 'manage_settings', 'view_reports', 'manage_equipment', 'view_equipment', 'manage_pdt', 'manage_internships', 'view_management'],
        },
        create: {
          name: 'Coordenador',
          description: 'Coordenação Pedagógica',
          permissions: ['manage_students', 'manage_attendance', 'manage_rac', 'manage_occurrences', 'manage_classes', 'manage_subjects', 'manage_settings', 'view_reports', 'manage_equipment', 'view_equipment', 'manage_pdt', 'manage_internships', 'view_management'],
        },
      }),
      prisma.operatorRole.upsert({
        where: { name: 'Secretário' },
        update: {
          permissions: ['manage_students', 'manage_attendance', 'manage_rac', 'manage_occurrences', 'manage_classes', 'manage_subjects', 'manage_settings', 'view_reports', 'manage_equipment', 'view_equipment', 'manage_pdt', 'manage_internships', 'view_management'],
        },
        create: {
          name: 'Secretário',
          description: 'Secretaria Escolar',
          permissions: ['manage_students', 'manage_attendance', 'manage_rac', 'manage_occurrences', 'manage_classes', 'manage_subjects', 'manage_settings', 'view_reports', 'manage_equipment', 'view_equipment', 'manage_pdt', 'manage_internships', 'view_management'],
        },
      }),
      prisma.operatorRole.upsert({
        where: { name: 'Professor' },
        update: {
          permissions: ['manage_attendance', 'manage_rac', 'manage_occurrences', 'manage_equipment', 'view_equipment', 'manage_pdt', 'manage_internships'],
        },
        create: {
          name: 'Professor',
          description: 'Corpo Docente',
          permissions: ['manage_attendance', 'manage_rac', 'manage_occurrences', 'manage_equipment', 'view_equipment', 'manage_pdt', 'manage_internships'],
        },
      }),
      prisma.operatorRole.upsert({
        where: { name: 'Outros' },
        update: {
          permissions: ['manage_attendance', 'manage_occurrences', 'manage_equipment', 'view_equipment'],
        },
        create: {
          name: 'Outros',
          description: 'Funcionários Gerais / Apoio / Inspetores',
          permissions: ['manage_attendance', 'manage_occurrences', 'manage_equipment', 'view_equipment'],
        },
      }),
    ]);

    return await prisma.operatorRole.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching operator roles:', error);
    return [];
  }
}

// Logged-in Operator Self Profile Management
export async function getMyProfile() {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    return await prisma.operator.findUnique({
      where: { id: session.user.id },
      include: {
        role: true,
        teacherSubjects: {
          include: { subject: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching my profile:', error);
    return null;
  }
}

export async function updateMyProfile(data: {
  nickname?: string;
  avatarUrl?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Você precisa estar conectado.' };
    }

    const operator = await prisma.operator.findUnique({
      where: { id: session.user.id },
    });

    if (!operator) {
      return { success: false, error: 'Operador não encontrado.' };
    }

    const updateData: any = {};
    if (data.nickname !== undefined) {
      updateData.nickname = data.nickname.trim() ? data.nickname.trim() : null;
    }
    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl || null;
    }

    // Password change verification
    if (data.newPassword && data.newPassword.trim() !== '') {
      if (!data.currentPassword) {
        return { success: false, error: 'Informe sua senha atual para definir uma nova senha.' };
      }

      const isCurrentValid = await bcrypt.compare(
        data.currentPassword,
        operator.passwordHash
      );

      if (!isCurrentValid) {
        return { success: false, error: 'A senha atual informada está incorreta.' };
      }

      if (data.newPassword.length < 4) {
        return { success: false, error: 'A nova senha deve ter pelo menos 4 caracteres.' };
      }

      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await prisma.operator.update({
      where: { id: session.user.id },
      data: updateData,
    });

    revalidatePath('/perfil');
    revalidatePath('/');
    return { success: true, operator: updated };
  } catch (error: any) {
    console.error('Error in updateMyProfile:', error);
    return { success: false, error: error.message || 'Erro ao atualizar perfil.' };
  }
}
