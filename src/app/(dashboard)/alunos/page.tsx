import Link from 'next/link'
import { UserPlus, Search, MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getStudents } from '@/actions/student.actions'

export const dynamic = 'force-dynamic'

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const query = searchParams?.q || ''
  const page = Number(searchParams?.page) || 1
  
  const { students, total } = await getStudents({ query, page, limit: 10 })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Alunos</h2>
          <p className="text-slate-500">
            Total de {total} alunos matriculados
          </p>
        </div>
        <Link href="/alunos/novo">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <form>
            <Input
              name="q"
              type="search"
              placeholder="Buscar por nome ou matrícula..."
              className="pl-8 bg-white"
              defaultValue={query}
            />
          </form>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="flex h-10 w-full sm:w-36 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
            <option value="">Todas as Turmas</option>
          </select>
          <select className="flex h-10 w-full sm:w-32 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
            <option value="">Status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Aluno</th>
                <th className="px-4 py-3 font-medium">Matrícula</th>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Responsável</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              ) : (
                students.map((student: any) => (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={student.photoUrl || ''} alt={student.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                            {student.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{student.registrationNumber}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {student.classGroup?.name || '-'}
                      <div className="text-xs text-slate-400">
                        {student.classGroup?.shift === 'MORNING' ? 'Manhã' : student.classGroup?.shift === 'AFTERNOON' ? 'Tarde' : student.classGroup?.shift === 'NIGHT' ? 'Noite' : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      <div>{student.guardianName || '-'}</div>
                      <div className="text-xs text-slate-400">{student.guardianPhone || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        student.status === 'ACTIVE' || !student.status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {student.status === 'ACTIVE' || !student.status ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/alunos/${student.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              Ver Ficha Completa
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/alunos/${student.id}/editar`}>
                            <DropdownMenuItem className="cursor-pointer">
                              Editar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination component placeholder */}
      {total > 10 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-md shadow-sm mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button variant="outline" size="sm">Anterior</Button>
            <Button variant="outline" size="sm">Próxima</Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Mostrando <span className="font-medium">{(page - 1) * 10 + 1}</span> a <span className="font-medium">{Math.min(page * 10, total)}</span> de <span className="font-medium">{total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                {/* Pages */}
                <Link href={`/alunos?page=${Math.max(1, page - 1)}${query ? `&q=${query}` : ''}`}>
                  <Button variant="outline" size="sm" className="rounded-r-none">Anterior</Button>
                </Link>
                <Link href={`/alunos?page=${page + 1}${query ? `&q=${query}` : ''}`}>
                  <Button variant="outline" size="sm" className="rounded-l-none" disabled={page * 10 >= total}>Próxima</Button>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
