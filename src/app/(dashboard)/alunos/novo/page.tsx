import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { StudentForm } from '@/components/forms/student-form'
import { getClassGroups } from '@/actions/class.actions'

export const dynamic = 'force-dynamic'

export default async function NovoAlunoPage() {
  const classGroups = await getClassGroups()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center text-sm text-slate-500 mb-4">
        <Link href="/alunos" className="hover:text-slate-900 transition-colors">
          Alunos
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-slate-900 font-medium">Novo Aluno</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cadastrar Novo Aluno</h2>
      </div>

      <div className="mt-4 p-6 bg-white rounded-lg border shadow-sm">
        <StudentForm classGroups={classGroups || []} />
      </div>
    </div>
  )
}
