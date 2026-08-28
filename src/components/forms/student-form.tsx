'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhotoUpload } from '@/components/shared/photo-upload'
import { createStudent, updateStudent } from '@/actions/student.actions'

const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
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

type StudentFormValues = z.infer<typeof studentSchema>

interface StudentFormProps {
  initialData?: any
  classGroups: any[]
}

export function StudentForm({ initialData, classGroups }: StudentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      name: '',
      registrationNumber: `MAT${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      dateOfBirth: '',
      classGroupId: '',
      guardianName: '',
      guardianPhone: '',
      address: '',
      neighborhood: '',
      city: '',
      photoUrl: '',
    },
  })

  const photoUrl = watch('photoUrl')

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      if (initialData?.id) {
        await updateStudent(initialData.id, data)
      } else {
        await createStudent(data)
      }
      
      router.push('/alunos')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ocorreu um erro ao salvar os dados do aluno.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simple mask for phone
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <PhotoUpload 
          value={photoUrl} 
          onChange={(url) => setValue('photoUrl', url)} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo <span className="text-red-500">*</span></Label>
            <Input id="name" {...register('name')} placeholder="Ex: João da Silva" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Matrícula <span className="text-red-500">*</span></Label>
            <Input id="registrationNumber" {...register('registrationNumber')} placeholder="Ex: MAT1234" />
            {errors.registrationNumber && <p className="text-sm text-red-500">{errors.registrationNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Data de Nascimento <span className="text-red-500">*</span></Label>
            <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
            {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="classGroupId">Turma de Matrícula <span className="text-red-500">*</span></Label>
            <select 
              id="classGroupId" 
              {...register('classGroupId')}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione uma turma...</option>
              {classGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} - {group.shift === 'MORNING' ? 'Manhã' : group.shift === 'AFTERNOON' ? 'Tarde' : 'Noite'}
                </option>
              ))}
            </select>
            {errors.classGroupId && <p className="text-sm text-red-500">{errors.classGroupId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianName">Nome do Responsável <span className="text-red-500">*</span></Label>
            <Input id="guardianName" {...register('guardianName')} placeholder="Nome do pai, mãe ou responsável" />
            {errors.guardianName && <p className="text-sm text-red-500">{errors.guardianName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianPhone">Telefone do Responsável <span className="text-red-500">*</span></Label>
            <Input 
              id="guardianPhone" 
              {...register('guardianPhone')} 
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000" 
              maxLength={15}
            />
            {errors.guardianPhone && <p className="text-sm text-red-500">{errors.guardianPhone.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" {...register('address')} placeholder="Rua, número, complemento" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" {...register('neighborhood')} placeholder="Bairro" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" {...register('city')} placeholder="Cidade" />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 border-t pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/alunos')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? 'Salvar Alterações' : 'Cadastrar Aluno'}
        </Button>
      </div>
    </form>
  )
}
