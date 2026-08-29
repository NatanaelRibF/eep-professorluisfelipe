import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Edit, AlertCircle, FileText, Calendar, MapPin, Phone, User } from 'lucide-react'
import { format, differenceInYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getStudentById } from '@/actions/student.actions'

export const dynamic = 'force-dynamic'

export default async function AlunoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const student = await getStudentById(id)
  
  if (!student) {
    notFound()
  }

  const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'ATIVO') || student.enrollments?.[0]
  const classGroup = activeEnrollment?.classGroup
  const attendances = activeEnrollment?.attendances || []
  const racs = activeEnrollment?.racs || []
  const occurrences = activeEnrollment?.occurrences || []

  const totalAttendances = attendances.length
  const presents = attendances.filter((a: any) => a.status === 'PRESENTE').length
  const justified = attendances.filter((a: any) => a.status === 'JUSTIFICADO').length
  const absents = attendances.filter((a: any) => a.status === 'AUSENTE').length
  const attendanceRate = totalAttendances > 0 ? Math.round(((presents + justified) / totalAttendances) * 100) : 100

  const age = student.birthDate 
    ? differenceInYears(new Date(), new Date(student.birthDate))
    : 'N/A'

  const formattedBirthDate = student.birthDate
    ? format(new Date(student.birthDate), 'dd/MM/yyyy', { locale: ptBR })
    : 'Não informada'

  const racUrl = classGroup?.id
    ? `/rac/novo?turmaId=${classGroup.id}&enrollmentId=${activeEnrollment?.id || ''}&alunoId=${student.id}`
    : `/rac/novo?alunoId=${student.id}&enrollmentId=${activeEnrollment?.id || ''}`

  const ocorrenciaUrl = classGroup?.id
    ? `/ocorrencias/novo?turmaId=${classGroup.id}&enrollmentId=${activeEnrollment?.id || ''}&alunoId=${student.id}`
    : `/ocorrencias/novo?alunoId=${student.id}&enrollmentId=${activeEnrollment?.id || ''}`

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/alunos">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-blue-900">Ficha do Estudante</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Histórico individual global, assiduidade e conduta.</p>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-left">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-slate-100 shadow-sm shrink-0">
              <AvatarImage src={student.photoUrl || ''} alt={student.name} />
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xl font-bold">
                {student.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{student.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-slate-600">
                <span className="font-mono font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                  Mat: {student.registrationNumber}
                </span>
                <span>•</span>
                <span className="font-medium text-slate-800">{classGroup?.name || 'Sem turma'}</span>
                <span>•</span>
                <span>
                  {classGroup?.shift === 'MANHA' || classGroup?.shift === 'MORNING' ? 'Manhã' : 
                   classGroup?.shift === 'TARDE' || classGroup?.shift === 'AFTERNOON' ? 'Tarde' : 
                   classGroup?.shift === 'NOITE' || classGroup?.shift === 'NIGHT' ? 'Noite' : classGroup?.shift || ''}
                </span>
                <span>•</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  student.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {student.isActive !== false ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Link href={`/alunos/${student.id}/editar`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full text-xs font-semibold h-10">
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                Editar Dados
              </Button>
            </Link>
            <Link href={racUrl} className="w-full sm:w-auto">
              <Button className="w-full bg-blue-800 hover:bg-blue-700 text-xs font-semibold h-10 shadow-sm">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Lançar RAC
              </Button>
            </Link>
            <Link href={ocorrenciaUrl} className="w-full sm:w-auto">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-10 shadow-sm">
                <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                Lançar Ocorrência
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="flex w-full overflow-x-auto justify-start border-b rounded-none h-12 p-0 space-x-4 sm:space-x-6">
          <TabsTrigger 
            value="dados" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-900 py-3 px-1 text-xs sm:text-sm font-semibold"
          >
            Dados Cadastrais
          </TabsTrigger>
          <TabsTrigger 
            value="frequencia"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-900 py-3 px-1 text-xs sm:text-sm font-semibold"
          >
            Frequência
          </TabsTrigger>
          <TabsTrigger 
            value="racs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-900 py-3 px-1 text-xs sm:text-sm font-semibold"
          >
            RACs ({racs.length})
          </TabsTrigger>
          <TabsTrigger 
            value="ocorrencias"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-900 py-3 px-1 text-xs sm:text-sm font-semibold"
          >
            Ocorrências ({occurrences.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-4 sm:mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 space-y-6">
              <h3 className="text-base font-bold flex items-center text-slate-900 border-b pb-2">
                <User className="mr-2 h-4 w-4 text-blue-600" />
                Informações Pessoais
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Data de Nascimento</p>
                  <p className="mt-1 flex items-center text-sm font-medium text-slate-900">
                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                    {formattedBirthDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Idade</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{typeof age === 'number' ? `${age} anos` : age}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <h3 className="text-base font-bold flex items-center text-slate-900 border-b pb-2 mb-4">
                  <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                  Endereço
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Logradouro</p>
                    <p className="mt-0.5 text-slate-900 font-medium">{student.address || 'Não informado'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Bairro</p>
                      <p className="mt-0.5 text-slate-900 font-medium">{student.neighborhood || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Cidade</p>
                      <p className="mt-0.5 text-slate-900 font-medium">{student.city || 'Não informada'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 space-y-6">
              <h3 className="text-base font-bold flex items-center text-slate-900 border-b pb-2">
                <User className="mr-2 h-4 w-4 text-blue-600" />
                Contato e Responsáveis
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Nome do Responsável</p>
                  <p className="mt-0.5 text-slate-900 font-medium">{student.guardianName || 'Não informado'}</p>
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Telefone do Responsável</p>
                  <p className="mt-0.5 flex items-center text-slate-900 font-medium">
                    <Phone className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                    {student.guardianPhone || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="frequencia" className="mt-4 sm:mt-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase">Taxa de Presença</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{attendanceRate}%</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase">Presenças</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-800 mt-1">{presents}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase">Faltas Injustificadas</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{absents}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase">Faltas Justificadas</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-500 mt-1">{justified}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 text-sm">Registros de Frequência</h3>
              <Link href="/frequencia/relatorio">
                <Button variant="outline" size="sm" className="text-xs">Ver Relatório Completo</Button>
              </Link>
            </div>
            {attendances.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Nenhum registro de frequência encontrado para este aluno.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Data</th>
                      <th className="px-4 py-3 font-semibold">Disciplina</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendances.map((record: any) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap">{format(new Date(record.date), 'dd/MM/yyyy')}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{record.subject?.name || 'Geral'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            record.status === 'PRESENTE' ? 'bg-emerald-100 text-emerald-800' :
                            record.status === 'JUSTIFICADO' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{record.observation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="racs" className="mt-4 sm:mt-6 space-y-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 text-sm">Registros de Acompanhamento (RAC)</h3>
              <Link href={racUrl}>
                <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-xs font-semibold">
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Novo RAC
                </Button>
              </Link>
            </div>
            
            {racs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Nenhum registro de RAC encontrado para este aluno.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {racs.map((rac: any) => (
                  <div key={rac.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rac.racType?.name || 'RAC'}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          rac.racType?.severity === 'LEVE' ? 'bg-emerald-100 text-emerald-800' :
                          rac.racType?.severity === 'MODERADO' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rac.racType?.severity || 'LEVE'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center bg-slate-100 px-2 py-0.5 rounded">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(rac.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 flex items-center font-medium">
                        <User className="mr-1 h-3 w-3 text-slate-400" />
                        {rac.operator?.name || 'Professor'}
                      </span>
                    </div>
                    {rac.description && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {rac.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ocorrencias" className="mt-4 sm:mt-6 space-y-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 text-sm">Ocorrências Disciplinares</h3>
              <Link href={ocorrenciaUrl}>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold">
                  <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                  Nova Ocorrência
                </Button>
              </Link>
            </div>
            
            {occurrences.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Nenhuma ocorrência registrada para este aluno.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {occurrences.map((occ: any) => (
                  <div key={occ.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{occ.occurrenceType?.name || 'Ocorrência'}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          occ.occurrenceType?.severity === 'LEVE' ? 'bg-emerald-100 text-emerald-800' :
                          occ.occurrenceType?.severity === 'MODERADO' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {occ.occurrenceType?.severity || 'LEVE'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center bg-slate-100 px-2 py-0.5 rounded">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(occ.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 flex items-center font-medium">
                        <User className="mr-1 h-3 w-3 text-slate-400" />
                        {occ.operator?.name || 'Operador'}
                      </span>
                    </div>
                    
                    {occ.description && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">Fatos:</p>
                        <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border mt-0.5">{occ.description}</p>
                      </div>
                    )}
                    {occ.actionTaken && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">Providência:</p>
                        <p className="text-xs text-slate-700 bg-blue-50/50 p-2 rounded-lg border border-blue-100 mt-0.5">{occ.actionTaken}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
