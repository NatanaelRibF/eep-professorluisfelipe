import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

import { StudentForm } from '@/components/forms/student-form'
import { getStudentById } from '@/actions/student.actions'
import { getClassGroups } from '@/actions/class.actions'

export const dynamic = 'force-dynamic'

export default async function EditarAlunoPage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id)
  
  if (!student) {
    notFound()
  }

  const classGroups = await getClassGroups()

  const activeEnrollment = student.enrollments?.find(e => e.status === 'ATIVO') || student.enrollments?.[0]

  // Format date for input type date
  const initialData = {
    ...student,
    dateOfBirth: student.birthDate 
      ? new Date(student.birthDate).toISOString().split('T')[0]
      : '',
    classGroupId: activeEnrollment?.classGroupId || '',
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center text-sm text-slate-500 mb-4">
        <Link href="/alunos" className="hover:text-slate-900 transition-colors">
          Alunos
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={`/alunos/${student.id}`} className="hover:text-slate-900 transition-colors">
          {student.name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-slate-900 font-medium">Editar Dados</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Editar Aluno</h2>
      </div>

      <div className="mt-4 p-6 bg-white rounded-lg border shadow-sm">
        <StudentForm 
          initialData={initialData} 
          classGroups={classGroups || []} 
        />
      </div>
    </div>
  )
}
