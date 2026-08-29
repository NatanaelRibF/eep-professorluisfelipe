"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Users, UserCheck, Calendar, FileText, Plus, Search, Shield, ChevronRight, User, HeartHandshake, BookOpen, AlertCircle, Sparkles } from "lucide-react";
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
  isGestor: boolean;
  userRole: string;
}

export default function PDTDashboardClient({
  classes,
  attendances,
  councils,
  operators,
  isGestor,
  userRole,
}: PDTDashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [savingPDT, setSavingPDT] = useState<string | null>(null);

  const handleAssignPDT = async (classGroupId: string, operatorId: string) => {
    if (!isGestor) {
      toast.error("Apenas o Núcleo Gestor pode alterar o PDT da turma.");
      return;
    }
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

  const teachers = operators.filter((o) => o.role?.name === "Professor" || o.role?.name === "Diretor" || o.role?.name === "Coordenador" || o.role?.name === "Secretário");

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pdtTeacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-blue-600" />
              Projeto Professor Diretor de Turma (PDT)
            </h1>
            {isGestor ? (
              <Badge className="bg-purple-100 text-purple-900 border-purple-300 text-[11px] font-bold">
                Núcleo Gestor
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[11px] font-bold">
                Docente PDT
              </Badge>
            )}
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {isGestor
              ? "Visão global da Direção, Coordenação e Secretaria: acompanhamento pedagógico e atribuição dos Professores Diretores de Turma."
              : "Acompanhamento individualizado da sua turma, dossiê do estudante, relação com a família e atas de conselho."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pdt/atendimentos/novo">
            <Button size="sm" className="bg-blue-800 hover:bg-blue-700 font-semibold shadow-sm text-xs h-9">
              <HeartHandshake className="mr-1.5 h-4 w-4" />
              Novo Atendimento a Pais
            </Button>
          </Link>
          <Link href="/pdt/conselho/novo">
            <Button size="sm" variant="outline" className="font-semibold text-xs border-blue-200 text-blue-800 hover:bg-blue-50 h-9">
              <FileText className="mr-1.5 h-4 w-4" />
              Registrar Conselho de Turma
            </Button>
          </Link>
        </div>
      </div>

      {/* Teacher without assigned PDT class banner */}
      {!isGestor && classes.length === 0 && (
        <Card className="p-8 text-center border-dashed border-amber-300 bg-amber-50/60">
          <AlertCircle className="h-10 w-10 text-amber-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-amber-900">Nenhuma Turma Atribuída como PDT</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto mt-1">
            Você está conectado como Professor, mas ainda não possui nenhuma turma atribuída como Diretor de Turma (PDT). Apenas o <strong>Núcleo Gestor (Diretor, Coordenador ou Secretário)</strong> pode definir os professores PDT das turmas.
          </p>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-800 uppercase flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" />
              {isGestor ? "Turmas com PDT" : "Sua Turma de PDT"}
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {isGestor ? `${classes.filter((c) => c.pdtId).length} / ${classes.length}` : classes.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {isGestor ? "Turmas da escola com Diretor de Turma atribuído" : "Turmas sob sua coordenação pedagógica de PDT"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-purple-800 uppercase flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-purple-600" />
              Atendimentos Realizados
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">{attendances.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Reuniões individuais e acolhimento com os responsáveis</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-emerald-600" />
              Atas de Conselho de Turma
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">{councils.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Deliberações e diagnósticos pedagógicos bimestrais</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="turmas" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 border">
          <TabsTrigger value="turmas" className="text-xs font-bold gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {isGestor ? "Painel de Turmas & PDTs" : "Minha Turma de PDT"}
          </TabsTrigger>
          <TabsTrigger value="atendimentos" className="text-xs font-bold gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5" />
            Atendimentos a Pais ({attendances.length})
          </TabsTrigger>
          <TabsTrigger value="conselhos" className="text-xs font-bold gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Conselhos de Turma ({councils.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Turmas */}
        <TabsContent value="turmas" className="space-y-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isGestor ? "Atribuição de Professores Diretores de Turma" : "Estudantes da Turma"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isGestor
                    ? "Defina qual docente é o responsável pelo projeto PDT em cada turma da escola."
                    : "Acompanhe individualmente o dossiê e o desenvolvimento de cada aluno da sua turma."}
                </p>
              </div>
            </div>

            {isGestor && (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por turma ou nome do PDT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 text-xs sm:text-sm"
                />
              </div>
            )}

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
                      {cls._count?.enrollments || 0} Alunos
                    </Badge>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Professor Diretor de Turma (PDT):
                    </label>

                    {isGestor ? (
                      <select
                        defaultValue={cls.pdtId || ""}
                        onChange={(e) => handleAssignPDT(cls.id, e.target.value)}
                        disabled={savingPDT === cls.id}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">Nenhum PDT atribuído...</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} {t.nickname ? `(${t.nickname})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 bg-blue-50/80 border border-blue-100 rounded-lg text-xs font-bold text-blue-900">
                        {cls.pdtTeacher?.name || "Você"}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <Link
                      href={`/alunos?classGroupId=${cls.id}`}
                      className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      Ver Estudantes da Turma
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
                <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-xs font-bold h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Registrar Atendimento
                </Button>
              </Link>
            </div>

            {attendances.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum atendimento individual a pais/responsáveis registrado até o momento.
              </div>
            ) : (
              <div className="divide-y">
                {attendances.map((att) => (
                  <div key={att.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900 text-sm">{att.student?.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {att.student?.enrollments?.[0]?.classGroup?.name || "Turma"}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {format(new Date(att.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border space-y-1">
                      <p><strong>Responsável Atendido:</strong> {att.guardianName}</p>
                      <p><strong>Motivo / Assunto:</strong> {att.reason}</p>
                      <p><strong>Síntese do Diálogo:</strong> {att.summary}</p>
                      {att.actionPlan && (
                        <p className="text-blue-800"><strong>Encaminhamentos / Plano de Ação:</strong> {att.actionPlan}</p>
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
              <h3 className="font-bold text-slate-900 text-sm">Atas dos Conselhos de Turma Bimestrais</h3>
              <Link href="/pdt/conselho/novo">
                <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-xs font-bold h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nova Ata de Conselho
                </Button>
              </Link>
            </div>

            {councils.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum conselho de turma registrado até o momento.
              </div>
            ) : (
              <div className="divide-y">
                {councils.map((c) => (
                  <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-slate-900 text-sm">{c.classGroup?.name}</span>
                        <Badge className="bg-purple-100 text-purple-800 text-[10px]">
                          {c.bimester}º Bimestre
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {format(new Date(c.date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border space-y-1.5">
                      {c.highlights && <p><strong>Destaques Positivos:</strong> {c.highlights}</p>}
                      {c.concerns && <p className="text-amber-800"><strong>Dificuldades / Pontos de Atenção:</strong> {c.concerns}</p>}
                      {c.interventions && <p className="text-blue-800"><strong>Intervenções Pedagógicas Decididas:</strong> {c.interventions}</p>}
                    </div>
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
