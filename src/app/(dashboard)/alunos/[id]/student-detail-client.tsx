"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
  AlertCircle, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  GraduationCap, 
  Printer, 
  Award,
  Clock,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function StudentDetailClient({
  student,
  activeEnrollment,
  classGroup,
  attendances,
  racs,
  occurrences,
  attendanceRate,
  presents,
  absents,
  justified,
  age,
  formattedBirthDate,
  racUrl,
  ocorrenciaUrl,
}: any) {
  const [activeTab, setActiveTab] = useState("dados");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top Header - Hidden when printing */}
      <div className="print:hidden flex items-center justify-between gap-3">
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

        <Button onClick={handlePrint} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10 shadow-sm">
          <Printer className="mr-1.5 h-4 w-4" />
          Imprimir Ficha & Termo
        </Button>
      </div>

      {/* Header Profile Card - Hidden when printing */}
      <div className="print:hidden bg-white rounded-xl border shadow-sm p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-left">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-slate-100 shadow-sm overflow-hidden flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xl shrink-0">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.name} className="h-full w-full object-cover" />
              ) : (
                <span>{student.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            
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
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Link href={`/pdt/dossie/${student.id}`} className="w-full sm:w-auto">
              <Button className="w-full bg-purple-800 hover:bg-purple-700 text-white text-xs font-semibold h-10 shadow-sm">
                <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                Dossiê PDT
              </Button>
            </Link>
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

      {/* Screen Tabs (Hidden when printing) */}
      <div className="print:hidden">
        <Tabs defaultValue="dados" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              Frequência ({attendances.length})
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
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">CPF</p>
                    <p className="mt-1 text-sm font-mono font-medium text-slate-900">{student.cpf || 'Não informado'}</p>
                  </div>
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
                            {format(new Date(rac.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
                            {format(new Date(occ.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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

      {/* PRINT-ONLY OFFICIAL STUDENT FICHA & SIGNATURES */}
      <div className="hidden print:block space-y-6 text-slate-900 p-4">
        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-800 pb-4">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-600">Governo do Estado do Ceará • Secretaria da Educação (SEDUC)</p>
          <h2 className="text-xl font-black uppercase text-slate-900 mt-1">EEEP Professor Luís Felipe</h2>
          <h3 className="text-sm font-bold text-blue-900 mt-1 bg-slate-100 py-1 rounded">
            RELATÓRIO INDIVIDUAL DE CONDUTA, FREQUÊNCIA E OCORRÊNCIAS
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Data de Emissão: {new Date().toLocaleDateString('pt-BR')} • Ano Letivo 2026
          </p>
        </div>

        {/* Student Bio */}
        <div className="border border-slate-300 rounded-lg p-3 grid grid-cols-2 gap-3 text-xs bg-slate-50">
          <div>
            <span className="font-bold block">Nome do Estudante:</span>
            <span className="text-sm font-bold text-blue-950">{student.name}</span>
          </div>
          <div>
            <span className="font-bold block">Matrícula / Código SEDUC:</span>
            <span className="font-mono">{student.registrationNumber}</span>
          </div>
          <div>
            <span className="font-bold block">Turma / Série / Turno:</span>
            <span>{classGroup?.name} ({classGroup?.shift})</span>
          </div>
          <div>
            <span className="font-bold block">Data de Nascimento:</span>
            <span>{formattedBirthDate} ({age} anos)</span>
          </div>
          <div>
            <span className="font-bold block">Responsável Legal:</span>
            <span>{student.guardianName || "Não informado"}</span>
          </div>
          <div>
            <span className="font-bold block">Telefone de Contato:</span>
            <span>{student.guardianPhone || "Não informado"}</span>
          </div>
        </div>

        {/* Assiduidade Summary */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Resumo de Frequência Escolar</h4>
          <div className="grid grid-cols-4 gap-2 text-center text-xs border border-slate-300 rounded-lg p-2">
            <div>
              <span className="text-[10px] text-slate-500 block">Total Aulas:</span>
              <span className="font-bold">{attendances.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Presenças:</span>
              <span className="font-bold text-blue-900">{presents}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Faltas:</span>
              <span className="font-bold text-red-700">{absents}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Taxa de Presença:</span>
              <span className="font-bold text-emerald-800">{attendanceRate}%</span>
            </div>
          </div>
        </div>

        {/* RACs Summary */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Registros de Acompanhamento em Sala de Aula (RAC) - Total: {racs.length}
          </h4>
          {racs.length === 0 ? (
            <p className="text-xs italic text-slate-500 p-2 border rounded">Nenhum registro de RAC anotado.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 p-1.5 font-bold">Data</th>
                  <th className="border border-slate-300 p-1.5 font-bold">Tipo de RAC</th>
                  <th className="border border-slate-300 p-1.5 font-bold text-center">Gravidade</th>
                  <th className="border border-slate-300 p-1.5 font-bold">Descrição do Fato</th>
                  <th className="border border-slate-300 p-1.5 font-bold">Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {racs.map((r: any) => (
                  <tr key={r.id}>
                    <td className="border border-slate-300 p-1.5 whitespace-nowrap">{format(new Date(r.date), 'dd/MM/yyyy')}</td>
                    <td className="border border-slate-300 p-1.5 font-medium">{r.racType?.name}</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold">{r.racType?.severity}</td>
                    <td className="border border-slate-300 p-1.5">{r.description || '-'}</td>
                    <td className="border border-slate-300 p-1.5">{r.operator?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Occurrences Summary */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Ocorrências e Medidas Disciplinares - Total: {occurrences.length}
          </h4>
          {occurrences.length === 0 ? (
            <p className="text-xs italic text-slate-500 p-2 border rounded">Nenhuma ocorrência disciplinar anotada.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 p-1.5 font-bold">Data</th>
                  <th className="border border-slate-300 p-1.5 font-bold">Ocorrência</th>
                  <th className="border border-slate-300 p-1.5 text-center">Gravidade</th>
                  <th className="border border-slate-300 p-1.5 font-bold">Descrição dos Fatos</th>
                  <th className="border border-slate-300 p-1.5 font-bold">Medida / Providência</th>
                </tr>
              </thead>
              <tbody>
                {occurrences.map((o: any) => (
                  <tr key={o.id}>
                    <td className="border border-slate-300 p-1.5 whitespace-nowrap">{format(new Date(o.date), 'dd/MM/yyyy')}</td>
                    <td className="border border-slate-300 p-1.5 font-medium">{o.occurrenceType?.name}</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold">{o.occurrenceType?.severity}</td>
                    <td className="border border-slate-300 p-1.5">{o.description || '-'}</td>
                    <td className="border border-slate-300 p-1.5 font-medium text-blue-950">{o.actionTaken || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* OFFICIAL SIGNATURE BLOCK */}
        <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs border-t-2 border-slate-800">
          <div>
            <div className="border-t border-slate-800 mx-auto mb-1.5 w-44"></div>
            <span className="font-bold block">Assinatura do Estudante</span>
            <span className="text-[10px] text-slate-500 block">Data: ___/___/2026</span>
          </div>

          <div>
            <div className="border-t border-slate-800 mx-auto mb-1.5 w-44"></div>
            <span className="font-bold block">Assinatura do Responsável</span>
            <span className="text-[10px] text-slate-500 block">CPF: __________________</span>
          </div>

          <div>
            <div className="border-t border-slate-800 mx-auto mb-1.5 w-44"></div>
            <span className="font-bold block">Coordenação / Direção</span>
            <span className="text-[10px] text-slate-500 block">EEEP Prof. Luís Felipe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
