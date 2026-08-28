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

export default async function AlunoDetalhesPage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id)
  
  if (!student) {
    notFound()
  }

  const activeEnrollment = student.enrollments?.find(e => e.status === 'ATIVO') || student.enrollments?.[0]
  const classGroup = activeEnrollment?.classGroup
  const attendances = activeEnrollment?.attendances || []
  const racs = activeEnrollment?.racs || []
  const occurrences = activeEnrollment?.occurrences || []

  const totalAttendances = attendances.length
  const presents = attendances.filter(a => a.status === 'PRESENTE').length
  const justified = attendances.filter(a => a.status === 'JUSTIFICADO').length
  const absents = attendances.filter(a => a.status === 'AUSENTE').length
  const attendanceRate = totalAttendances > 0 ? Math.round(((presents + justified) / totalAttendances) * 100) : 100

  const age = student.birthDate 
    ? differenceInYears(new Date(), new Date(student.birthDate))
    : 'N/A'

  const formattedBirthDate = student.birthDate
    ? format(new Date(student.birthDate), 'dd/MM/yyyy', { locale: ptBR })
    : 'Não informada'

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/alunos">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ficha do Estudante</h2>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm">
              <AvatarImage src={student.photoUrl || ''} alt={student.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-medium">
                {student.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center sm:text-left space-y-1 mt-2">
              <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  Matrícula: {student.registrationNumber}
                </span>
                <span>•</span>
                <span>{classGroup?.name || 'Sem turma'}</span>
                <span>•</span>
                <span>
                  {classGroup?.shift === 'MANHA' ? 'Manhã' : 
                   classGroup?.shift === 'TARDE' ? 'Tarde' : 
                   classGroup?.shift === 'NOITE' ? 'Noite' : classGroup?.shift || ''}
                </span>
                <span>•</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  student.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {student.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Link href={`/alunos/${student.id}/editar`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Editar Dados
              </Button>
            </Link>
            <Link href="/rac/novo" className="w-full sm:w-auto">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <FileText className="mr-2 h-4 w-4" />
                Lançar RAC
              </Button>
            </Link>
            <Link href="/ocorrencias/novo" className="w-full sm:w-auto">
              <Button className="w-full bg-amber-500 hover:bg-amber-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                Lançar Ocorrência
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b rounded-none h-12 p-0 space-x-6">
          <TabsTrigger 
            value="dados" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
          >
            Dados Cadastrais
          </TabsTrigger>
          <TabsTrigger 
            value="frequencia"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
          >
            Frequência
          </TabsTrigger>
          <TabsTrigger 
            value="racs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
          >
            RACs ({racs.length})
          </TabsTrigger>
          <TabsTrigger 
            value="ocorrencias"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
          >
            Ocorrências Disciplinares ({occurrences.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center text-slate-900 border-b pb-2">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Informações Pessoais
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Data de Nascimento</p>
                  <p className="mt-1 flex items-center text-slate-900">
                    <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                    {formattedBirthDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Idade</p>
                  <p className="mt-1 text-slate-900">{typeof age === 'number' ? `${age} anos` : age}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <h3 className="text-lg font-semibold flex items-center text-slate-900 border-b pb-2 mb-4">
                  <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                  Endereço
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Logradouro</p>
                    <p className="mt-1 text-slate-900">{student.address || 'Não informado'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Bairro</p>
                      <p className="mt-1 text-slate-900">{student.neighborhood || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Cidade</p>
                      <p className="mt-1 text-slate-900">{student.city || 'Não informada'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center text-slate-900 border-b pb-2">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Contato e Responsáveis
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Nome do Responsável</p>
                  <p className="mt-1 text-slate-900">{student.guardianName || 'Não informado'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-500">Telefone do Responsável</p>
                  <p className="mt-1 flex items-center text-slate-900">
                    <Phone className="mr-2 h-4 w-4 text-slate-400" />
                    {student.guardianPhone || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="frequencia" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border shadow-sm p-4 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-500">Taxa de Presença</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{attendanceRate}%</p>
            </div>
            <div className="bg-white rounded-lg border shadow-sm p-4 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-500">Presenças</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{presents}</p>
            </div>
            <div className="bg-white rounded-lg border shadow-sm p-4 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-500">Faltas Injustificadas</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{absents}</p>
            </div>
            <div className="bg-white rounded-lg border shadow-sm p-4 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-500">Faltas Justificadas</p>
              <p className="text-3xl font-bold text-amber-500 mt-2">{justified}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Registros Recentes de Frequência</h3>
              <Link href="/frequencia/relatorio">
                <Button variant="outline" size="sm">Ver Relatório Completo</Button>
              </Link>
            </div>
            {attendances.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nenhum registro de frequência encontrado para este aluno.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Disciplina</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((record: any) => (
                    <tr key={record.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">{format(new Date(record.date), 'dd/MM/yyyy')}</td>
                      <td className="px-4 py-3 font-medium">{record.subject?.name || 'Geral'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          record.status === 'PRESENTE' ? 'bg-green-100 text-green-800' :
                          record.status === 'JUSTIFICADO' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{record.observation || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="racs" className="mt-6 space-y-6">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Registros de Acompanhamento (RAC)</h3>
              <Link href="/rac/novo">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Novo RAC
                </Button>
              </Link>
            </div>
            
            {racs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nenhum registro de RAC encontrado para este aluno.
              </div>
            ) : (
              <div className="divide-y">
                {racs.map((rac: any) => (
                  <div key={rac.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{rac.racType?.name || 'RAC'}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          rac.racType?.severity === 'LEVE' ? 'bg-green-100 text-green-800' :
                          rac.racType?.severity === 'MODERADO' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rac.racType?.severity || 'LEVE'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(rac.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        {rac.operator?.name || 'Professor'}
                      </span>
                    </div>
                    {rac.description && (
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border mt-2">
                        {rac.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ocorrencias" className="mt-6 space-y-6">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Ocorrências Disciplinares</h3>
              <Link href="/ocorrencias/novo">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Nova Ocorrência
                </Button>
              </Link>
            </div>
            
            {occurrences.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nenhuma ocorrência registrada para este aluno.
              </div>
            ) : (
              <div className="divide-y">
                {occurrences.map((occ: any) => (
                  <div key={occ.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{occ.occurrenceType?.name || 'Ocorrência'}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          occ.occurrenceType?.severity === 'LEVE' ? 'bg-green-100 text-green-800' :
                          occ.occurrenceType?.severity === 'MODERADO' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {occ.occurrenceType?.severity || 'LEVE'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(occ.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        {occ.operator?.name || 'Operador'}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      {occ.description && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Descrição</p>
                          <p className="text-sm text-slate-700 bg-white p-2 rounded border">{occ.description}</p>
                        </div>
                      )}
                      {occ.actionTaken && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Ação Tomada</p>
                          <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border">{occ.actionTaken}</p>
                        </div>
                      )}
                    </div>
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
