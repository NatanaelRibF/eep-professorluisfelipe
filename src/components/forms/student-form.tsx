'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhotoUpload } from '@/components/shared/photo-upload'
import { createStudent, updateStudent } from '@/actions/student.actions'
import { toast } from 'sonner'

const CIDADES_CEARA = [
  'Sobral',
  'Forquilha',
  'Meruoca',
  'Massapê',
  'Cariré',
  'Groaíras',
  'Alcântaras',
  'Mucambo',
  'Santana do Acaraú',
  'Coreaú',
  'Varjota',
  'Reriutaba',
  'Moraújo',
  'Fortaleza',
  'Outra',
]

const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().optional(),
  registrationNumber: z.string().min(1, 'Matrícula é obrigatória'),
  dateOfBirth: z.string().min(1, 'Data de nascimento é obrigatória'),
  classGroupId: z.string().min(1, 'Turma é obrigatória'),
  guardianName: z.string().min(3, 'Nome do responsável é obrigatório'),
  guardianPhone: z.string().min(1, 'Telefone do responsável é obrigatório'),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  photoUrl: z.string().optional(),
})

type StudentFormValues = {
  id?: string
  name: string
  cpf?: string
  registrationNumber: string
  dateOfBirth: string
  classGroupId: string
  guardianName: string
  guardianPhone: string
  address?: string
  neighborhood?: string
  city?: string
  photoUrl?: string
}

interface StudentFormProps {
  initialData?: any
  classGroups: any[]
}

export function StudentForm({ initialData, classGroups }: StudentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultBirthDate = initialData?.birthDate
    ? format(new Date(initialData.birthDate), 'yyyy-MM-dd')
    : initialData?.dateOfBirth || ''

  const defaultClassGroupId =
    initialData?.classGroupId ||
    initialData?.enrollments?.[0]?.classGroupId ||
    ''

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      cpf: initialData?.cpf || '',
      registrationNumber: initialData?.registrationNumber || '',
      dateOfBirth: defaultBirthDate,
      classGroupId: defaultClassGroupId,
      guardianName: initialData?.guardianName || '',
      guardianPhone: initialData?.guardianPhone || '',
      address: initialData?.address || '',
      neighborhood: initialData?.neighborhood || '',
      city: initialData?.city || 'Sobral',
      photoUrl: initialData?.photoUrl || '',
    },
  })

  const photoUrl = watch('photoUrl')

  // CPF Mask
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`
    }

    setValue('cpf', value)
  }

  // Phone Mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    }
    if (value.length > 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`
    }

    setValue('guardianPhone', value)
  }

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (initialData?.id) {
        await updateStudent(initialData.id, data)
        toast.success('Aluno atualizado com sucesso!')
      } else {
        await createStudent(data)
        toast.success('Aluno cadastrado com sucesso!')
      }

      router.push('/alunos')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ocorreu um erro ao salvar os dados do aluno.')
      toast.error('Erro ao salvar aluno.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <PhotoUpload
            value={photoUrl}
            onChange={(url) => setValue('photoUrl', url)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
              Nome Completo do Estudante <span className="text-red-500">*</span>
            </Label>
            <Input id="name" {...register('name')} placeholder="Ex: João da Silva Santos" className="h-10" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cpf" className="text-xs font-semibold text-slate-700">
              CPF do Estudante
            </Label>
            <Input
              id="cpf"
              {...register('cpf')}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="h-10 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="registrationNumber" className="text-xs font-semibold text-slate-700">
              Matrícula / Código SEDUC <span className="text-red-500">*</span>
            </Label>
            <Input
              id="registrationNumber"
              {...register('registrationNumber')}
              placeholder="Digite o código SEDUC do aluno"
              className="h-10 font-mono"
            />
            {errors.registrationNumber && (
              <p className="text-xs text-red-500">{errors.registrationNumber.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth" className="text-xs font-semibold text-slate-700">
              Data de Nascimento <span className="text-red-500">*</span>
            </Label>
            <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} className="h-10" />
            {errors.dateOfBirth && (
              <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="classGroupId" className="text-xs font-semibold text-slate-700">
              Turma de Matrícula <span className="text-red-500">*</span>
            </Label>
            <select
              id="classGroupId"
              {...register('classGroupId')}
              className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma turma...</option>
              {classGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} — {group.shift === 'MANHA' || group.shift === 'MORNING' ? 'Manhã' : group.shift === 'TARDE' || group.shift === 'AFTERNOON' ? 'Tarde' : 'Noite'}
                </option>
              ))}
            </select>
            {errors.classGroupId && (
              <p className="text-xs text-red-500">{errors.classGroupId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guardianName" className="text-xs font-semibold text-slate-700">
              Nome do Responsável <span className="text-red-500">*</span>
            </Label>
            <Input
              id="guardianName"
              {...register('guardianName')}
              placeholder="Nome do pai, mãe ou responsável legal"
              className="h-10"
            />
            {errors.guardianName && (
              <p className="text-xs text-red-500">{errors.guardianName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guardianPhone" className="text-xs font-semibold text-slate-700">
              Telefone do Responsável <span className="text-red-500">*</span>
            </Label>
            <Input
              id="guardianPhone"
              {...register('guardianPhone')}
              onChange={handlePhoneChange}
              placeholder="(88) 90000-0000"
              maxLength={15}
              className="h-10 font-mono"
            />
            {errors.guardianPhone && (
              <p className="text-xs text-red-500">{errors.guardianPhone.message}</p>
            )}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address" className="text-xs font-semibold text-slate-700">
              Endereço / Logradouro
            </Label>
            <Input id="address" {...register('address')} placeholder="Rua, número, complemento..." className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="neighborhood" className="text-xs font-semibold text-slate-700">
              Bairro
            </Label>
            <Input id="neighborhood" {...register('neighborhood')} placeholder="Ex: Centro, Sinhá Sabóia..." className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
              Cidade / Município <span className="text-red-500">*</span>
            </Label>
            <select
              id="city"
              {...register('city')}
              className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CIDADES_CEARA.map((city) => (
                <option key={city} value={city}>
                  {city === 'Sobral' ? 'Sobral (Padrão)' : city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/alunos')}
          disabled={isSubmitting}
          className="h-10"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-800 hover:bg-blue-700 font-bold h-10">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {initialData?.id ? 'Salvar Alterações' : 'Cadastrar Aluno'}
        </Button>
      </div>
    </form>
  )
}
