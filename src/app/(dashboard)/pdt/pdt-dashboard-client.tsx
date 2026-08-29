"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Users, UserCheck, Calendar, FileText, Plus, Search, Shield, ChevronRight, User, HeartHandshake, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assignPDTTeacher } from "@/actions/pdt.actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface PDTDashboardClientProps {
  classes: any[];
  attendances: any[];
  councils: any[];
  operators: any[];
}

export default function PDTDashboardClient({
  classes,
  attendances,
  councils,
  operators,
}: PDTDashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [savingPDT, setSavingPDT] = useState<string | null>(null);

  const handleAssignPDT = async (classGroupId: string, operatorId: string) => {
    setSavingPDT(classGroupId);
    try {
      const res = await assignPDTTeacher(classGroupId, operatorId || null);
      if (!res.success) {
        toast.error(res.error || "Erro ao definir PDT");
        return;
      }
      toast.success("Professor Diretor de Turma vinculado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar PDT");
    } finally {
      setSavingPDT(null);
    }
  };

  const teachers = operators.filter((o) => o.role?.name === "Professor" || o.role?.name === "Diretor" || o.role?.name === "Coordenador");

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pdtTeacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            Projeto Professor Diretor de Turma (PDT)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Acompanhamento individualizado, dossiê do estudante, relação com a família e conselhos de classe (SEDUC-CE).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pdt/atendimentos/novo">
            <Button size="sm" className="bg-blue-800 hover:bg-blue-700 font-semibold shadow-sm text-xs">
              <HeartHandshake className="mr-1.5 h-4 w-4" />
              Novo Atendimento a Pais
            </Button>
          </Link>
          <Link href="/pdt/conselho/novo">
            <Button size="sm" variant="outline" className="font-semibold text-xs border-blue-200 text-blue-800 hover:bg-blue-50">
              <FileText className="mr-1.5 h-4 w-4" />
              Registrar Conselho de Turma
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-800 uppercase flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" />
              Turmas com PDT
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {classes.filter((c) => c.pdtId).length} / {classes.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Turmas da escola com Diretor de Turma atribuído</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-amber-800 uppercase flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-amber-600" />
              Atendimentos a Famílias
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {attendances.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Reuniões e escutas individuais registradas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              Atas de Conselho
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {councils.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Deliberações bimestrais de turmas registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="turmas" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 border">
          <TabsTrigger value="turmas" className="text-xs font-bold">
            🏫 Turmas & Dossiês dos Alunos
          </TabsTrigger>
          <TabsTrigger value="atendimentos" className="text-xs font-bold">
            🤝 Atendimentos aos Pais ({attendances.length})
          </TabsTrigger>
          <TabsTrigger value="conselhos" className="text-xs font-bold">
            📜 Conselhos de Turma ({councils.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Turmas e Dossiês */}
        <TabsContent value="turmas" className="space-y-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por turma ou nome do PDT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{cls.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {cls.grade?.name} — {cls.shift === "MANHA" ? "Manhã" : cls.shift === "TARDE" ? "Tarde" : "Noite"}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-[11px] font-semibold">
                      {cls._count.enrollments} Alunos
                    </Badge>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Professor Diretor de Turma (PDT):
                    </label>
                    <select
                      defaultValue={cls.pdtId || ""}
                      onChange={(e) => handleAssignPDT(cls.id, e.target.value)}
                      disabled={savingPDT === cls.id}
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Nenhum PDT atribuído...</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.nickname ? `(${t.nickname})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <Link
                      href={`/alunos?turma=${cls.id}`}
                      className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      Ver Dossiês dos Alunos
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Atendimentos aos Pais */}
        <TabsContent value="atendimentos" className="space-y-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Histórico de Atendimentos & Reuniões com Responsáveis</h3>
              <Link href="/pdt/atendimentos/novo">
                <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-xs font-bold">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Registrar Atendimento
                </Button>
              </Link>
            </div>

            {attendances.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Nenhum atendimento a familiares registrado até o momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendances.map((att) => (
                  <div key={att.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-2">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">
                          {att.student?.name}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          (Resp: {att.guardianName})
                        </span>
                        <div className="text-xs text-blue-700 font-semibold mt-0.5">
                          Motivo: {att.reason}
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {format(new Date(att.date), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Atendido por: {att.operator?.name}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border text-xs text-slate-700 space-y-1.5">
                      <p><strong>Resumo:</strong> {att.summary}</p>
                      {att.actionPlan && (
                        <p className="text-blue-900 font-medium pt-1 border-t border-slate-200">
                          <strong>Plano de Ação / Compromissos:</strong> {att.actionPlan}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Conselhos de Turma */}
        <TabsContent value="conselhos" className="space-y-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Atas e Deliberações do Conselho de Turma</h3>
              <Link href="/pdt/conselho/novo">
                <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-xs font-bold">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nova Ata de Conselho
                </Button>
              </Link>
            </div>

            {councils.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Nenhum conselho de turma registrado até o momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {councils.map((c) => (
                  <div key={c.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {c.classGroup?.name} — {c.bimester}º Bimestre
                        </h4>
                        <p className="text-xs text-slate-500">
                          Registrado por: {c.operator?.name}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {format(new Date(c.date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {c.highlights && (
                        <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-emerald-900">
                          <strong>🌟 Destaques Positivos:</strong>
                          <p className="mt-0.5">{c.highlights}</p>
                        </div>
                      )}
                      {c.concerns && (
                        <div className="bg-red-50 p-2.5 rounded-lg border border-red-100 text-red-900">
                          <strong>⚠️ Pontos de Atenção / Risco:</strong>
                          <p className="mt-0.5">{c.concerns}</p>
                        </div>
                      )}
                    </div>

                    {c.interventions && (
                      <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100 text-blue-900 text-xs">
                        <strong>🎯 Ações de Intervenção Pedagógica:</strong>
                        <p className="mt-0.5">{c.interventions}</p>
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
  );
}
