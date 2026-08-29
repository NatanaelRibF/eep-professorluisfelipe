"use client";

import Link from "next/link";
import { TrendingUp, Users, AlertTriangle, Award, Briefcase, Building2, Phone, ChevronRight, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GestaoClientProps {
  data: any;
}

export default function GestaoClient({ data }: GestaoClientProps) {
  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Não foi possível carregar os dados de gestão.
      </div>
    );
  }

  const {
    totalStudents,
    totalClasses,
    totalOperators,
    criticalStudentsCount,
    criticalStudentsList,
    examStats,
    internshipStats,
    spaceStats,
  } = data;

  const activeInternships = internshipStats.find((i: any) => i.status === "EM_ANDAMENTO")?._count?.status || 0;
  const completedInternships = internshipStats.find((i: any) => i.status === "CONCLUIDO")?._count?.status || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-blue-600" />
            Painel Estratégico de Gestão Escolar (EEEP)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Monitoramento de metas da escola, busca ativa (abandono zero), proficiência SPAECE e estágio técnico (SEDUC-CE).
          </p>
        </div>
      </div>

      {/* Strategic KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-gradient-to-br from-red-50/70 to-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-red-800 uppercase flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              Radar de Busca Ativa
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-950">
              {criticalStudentsCount} Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-700">Com 3 ou mais faltas (Atenção imediata)</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50/70 to-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" />
              Total de Estudantes
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {totalStudents} Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">{totalClasses} Turmas ativas no ano letivo</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-emerald-600" />
              Estágios 3º Ano EEEP
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {activeInternships} Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">{completedInternships} Estágios concluídos</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca Ativa - Alunos com Risco de Abandono */}
      <Card className="border-red-200 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b bg-red-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold text-red-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Alerta de Busca Ativa & Permanência Escolar (Abandono Zero)
            </CardTitle>
            <CardDescription className="text-xs text-red-800">
              Estudantes com maior número de ausências não justificadas. Acionar Professor Diretor de Turma (PDT) e Família.
            </CardDescription>
          </div>
          <Link href="/pdt">
            <Button size="sm" variant="outline" className="text-xs border-red-300 text-red-900 hover:bg-red-100 font-semibold">
              Ir para Painel PDT
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {criticalStudentsList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              🎉 Nenhum estudante em situação de infrequência crítica no momento!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {criticalStudentsList.map((enr: any) => (
                <div key={enr.id} className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={enr.student?.photoUrl || ""} alt={enr.student?.name} />
                      <AvatarFallback className="bg-red-100 text-red-800 font-bold text-xs">
                        {enr.student?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{enr.student?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Turma: <strong>{enr.classGroup?.name}</strong> • PDT: {enr.classGroup?.pdtTeacher?.name || "Sem PDT"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Badge className="bg-red-100 text-red-800 text-[11px] font-bold">
                      {enr._count?.attendances || 0} Faltas Registradas
                    </Badge>
                    {enr.student?.guardianPhone && (
                      <span className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {enr.student.guardianPhone}
                      </span>
                    )}
                    <Link href={`/pdt/dossie/${enr.studentId}`}>
                      <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-blue-700 hover:bg-blue-50">
                        Abrir Dossiê
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Programs Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PDT Hub */}
        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Projeto PDT (SEDUC-CE)
            </CardTitle>
            <CardDescription className="text-xs">
              Acompanhamento socioemocional e tutoria de turmas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 border-t text-xs text-slate-600">
            <p>• Dossiês digitais individuais</p>
            <p>• Registro de reuniões com pais</p>
            <p>• Atas bimestrais de conselho de turma</p>
          </CardContent>
          <div className="p-4 pt-0">
            <Link href="/pdt">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold text-blue-800 border-blue-200 hover:bg-blue-50">
                Acessar Módulo PDT
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Boletim de Notas do RAC */}
        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Boletim de Notas do RAC
            </CardTitle>
            <CardDescription className="text-xs">
              Pontuação bimestral de conduta e acompanhamento por turma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 border-t text-xs text-slate-600">
            <p>• 10,0 pontos iniciais por bimestre</p>
            <p>• Tolerância pedagógica nos 4 primeiros RACs</p>
            <p>• Penalização por gravidade (Leve, Moderado, Grave)</p>
          </CardContent>
          <div className="p-4 pt-0">
            <Link href="/rac/notas">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold text-amber-800 border-amber-200 hover:bg-amber-50">
                Acessar Boletim de RAC
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Estagio Hub */}
        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              Estágio Curricular EEEP
            </CardTitle>
            <CardDescription className="text-xs">
              Prática profissional e empresas conveniadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 border-t text-xs text-slate-600">
            <p>• Empresas parceiras concedentes</p>
            <p>• Controle de 400h obrigatórias</p>
            <p>• Folhas mensais de atividades</p>
          </CardContent>
          <div className="p-4 pt-0">
            <Link href="/estagio">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold text-purple-800 border-purple-200 hover:bg-purple-50">
                Acessar Módulo Estágio
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
