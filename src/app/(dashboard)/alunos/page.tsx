import Link from 'next/link'
import { UserPlus, Search, MoreVertical, Eye, Phone, MapPin, User, Filter, RotateCcw } from 'lucide-react'

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
import { getClassGroups } from '@/actions/class.actions'

export const dynamic = 'force-dynamic'

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; turma?: string; turno?: string; page?: string }>
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || ''
  const turmaId = resolvedParams?.turma || 'todas'
  const turno = resolvedParams?.turno || 'todos'
  const page = Number(resolvedParams?.page) || 1
  
  const [classes, studentsData] = await Promise.all([
    getClassGroups(),
    getStudents({
      search: query,
      classGroupId: turmaId !== 'todas' ? turmaId : undefined,
      shift: turno !== 'todos' ? turno : undefined,
      page,
      pageSize: 20,
    }),
  ])

  const { students, total } = studentsData
  const totalPages = Math.ceil(total / 20)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">Alunos</h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Total de {total} estudantes cadastrados no sistema.
          </p>
        </div>
        <Link href="/alunos/novo" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-blue-800 hover:bg-blue-700 font-semibold shadow-sm text-sm h-11 sm:h-10">
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar Novo Aluno
          </Button>
        </Link>
      </div>

      {/* Responsive Filter Bar (Search + Turma + Turno) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca Textual */}
          <div className="relative flex items-center lg:col-span-2">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Buscar por nome, CPF ou matrícula..."
              className="pl-9 h-10 bg-slate-50 border-slate-200 text-xs sm:text-sm w-full"
            />
          </div>

          {/* Filtro por Turma */}
          <div>
            <select
              name="turma"
              defaultValue={turmaId}
              className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as Turmas</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Turno */}
          <div className="flex gap-2">
            <select
              name="turno"
              defaultValue={turno}
              className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Turnos</option>
              <option value="MANHA">Manhã</option>
              <option value="TARDE">Tarde</option>
              <option value="NOITE">Noite</option>
            </select>

            <Button type="submit" size="sm" className="bg-blue-800 hover:bg-blue-700 h-10 px-4 shrink-0 text-xs font-bold">
              <Filter className="w-3.5 h-3.5 mr-1" />
              Filtrar
            </Button>

            {(query || turmaId !== 'todas' || turno !== 'todos') && (
              <Link href="/alunos">
                <Button type="button" variant="outline" size="sm" className="h-10 px-3 shrink-0 text-xs">
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* MOBILE STUDENT CARDS (block md:hidden) */}
      <div className="block md:hidden space-y-3">
        {students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed">
            Nenhum aluno encontrado para os filtros selecionados.
          </div>
        ) : (
          students.map((student: any) => {
            const activeEnrollment = student.enrollments?.[0];
            const classGroup = activeEnrollment?.classGroup;

            return (
              <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 border border-slate-200">
                      <AvatarImage src={student.photoUrl || ''} alt={student.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-800 font-bold text-xs">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{student.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-blue-700 font-semibold">
                          Mat: {student.registrationNumber}
                        </span>
                        {student.cpf && (
                          <span className="text-[11px] font-mono text-slate-500">
                            CPF: {student.cpf}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    student.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {student.isActive !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-slate-800">
                      Turma: {classGroup?.name || "Sem turma vinculada"}
                    </p>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {classGroup?.shift === 'MANHA' || classGroup?.shift === 'MORNING' ? 'Manhã' :
                       classGroup?.shift === 'TARDE' || classGroup?.shift === 'AFTERNOON' ? 'Tarde' :
                       classGroup?.shift === 'NOITE' || classGroup?.shift === 'NIGHT' ? 'Noite' : ''}
                    </span>
                  </div>
                  {student.guardianName && (
                    <p className="flex items-center gap-1 text-slate-500">
                      <User className="w-3 h-3 text-slate-400" />
                      Resp: {student.guardianName} {student.guardianPhone ? `(${student.guardianPhone})` : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <Link href={`/alunos/${student.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 h-9">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Ver Ficha Completa
                    </Button>
                  </Link>
                  <Link href={`/alunos/${student.id}/editar`}>
                    <Button variant="ghost" size="sm" className="text-xs text-slate-600 h-9">
                      Editar
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Estudante</th>
              <th className="px-4 py-3 font-semibold">Matrícula / CPF</th>
              <th className="px-4 py-3 font-semibold">Turma / Turno</th>
              <th className="px-4 py-3 font-semibold">Responsável & Contato</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nenhum aluno encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              students.map((student: any) => {
                const enrollment = student.enrollments?.[0];
                const cls = enrollment?.classGroup;
                const shiftLabel =
                  cls?.shift === 'MANHA' || cls?.shift === 'MORNING' ? 'Manhã' :
                  cls?.shift === 'TARDE' || cls?.shift === 'AFTERNOON' ? 'Tarde' :
                  cls?.shift === 'NOITE' || cls?.shift === 'NIGHT' ? 'Noite' : '';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-200">
                          <AvatarImage src={student.photoUrl || ''} alt={student.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-800 font-bold text-xs">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-semibold text-slate-900">{student.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <div className="text-blue-700 font-semibold">{student.registrationNumber}</div>
                      {student.cpf && <div className="text-slate-500 text-[11px]">{student.cpf}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      <div>{cls?.name || '-'}</div>
                      {shiftLabel && <div className="text-xs text-slate-500 font-normal">{shiftLabel}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      <div>{student.guardianName || '-'}</div>
                      <div className="text-slate-400">{student.guardianPhone || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        student.isActive !== false 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {student.isActive !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/alunos/${student.id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Ver Ficha
                          </Button>
                        </Link>
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Página {page} de {totalPages} ({total} alunos)
          </div>
          <div className="flex gap-1">
            <Link href={`/alunos?page=${page - 1}${query ? `&q=${query}` : ''}${turmaId !== 'todas' ? `&turma=${turmaId}` : ''}${turno !== 'todos' ? `&turno=${turno}` : ''}`}>
              <Button variant="outline" size="sm" disabled={page <= 1} className="text-xs">
                Anterior
              </Button>
            </Link>
            <Link href={`/alunos?page=${page + 1}${query ? `&q=${query}` : ''}${turmaId !== 'todas' ? `&turma=${turmaId}` : ''}${turno !== 'todos' ? `&turno=${turno}` : ''}`}>
              <Button variant="outline" size="sm" disabled={page >= totalPages} className="text-xs">
                Próxima
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
