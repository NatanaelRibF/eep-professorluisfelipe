"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, User, Heart, Sparkles, AlertCircle, FileText, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { saveStudentDossier } from "@/actions/pdt.actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface DossierFormClientProps {
  data: {
    student: any;
    dossier: any;
    attendances: any[];
    racs: any[];
    occurrences: any[];
  };
}

export default function DossierFormClient({ data }: DossierFormClientProps) {
  const router = useRouter();
  const { student, dossier, attendances, racs, occurrences } = data;
  const [loading, setLoading] = useState(false);

  const [livesWith, setLivesWith] = useState(dossier?.livesWith || "Pais");
  const [siblingsCount, setSiblingsCount] = useState(dossier?.siblingsCount || 0);
  const [transportMethod, setTransportMethod] = useState(dossier?.transportMethod || "Ônibus Escolar");
  const [healthConditions, setHealthConditions] = useState(dossier?.healthConditions || "");
  const [familyIncomeBracket, setFamilyIncomeBracket] = useState(dossier?.familyIncomeBracket || "Até 1 Salário Mínimo");
  const [strengths, setStrengths] = useState(dossier?.strengths || "");
  const [challenges, setChallenges] = useState(dossier?.challenges || "");
  const [lifeProjectGoals, setLifeProjectGoals] = useState(dossier?.lifeProjectGoals || "");
  const [observations, setObservations] = useState(dossier?.observations || "");

  const classGroup = student.enrollments?.[0]?.classGroup;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await saveStudentDossier(student.id, {
        livesWith,
        siblingsCount: Number(siblingsCount) || 0,
        transportMethod,
        healthConditions,
        familyIncomeBracket,
        strengths,
        challenges,
        lifeProjectGoals,
        observations,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao salvar dossiê");
        return;
      }

      toast.success("Dossiê do aluno atualizado com sucesso!");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao salvar dossiê");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Link href="/pdt">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <User className="h-7 w-7 text-blue-600" />
            Dossiê do Aluno — PDT
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Instrumental oficial de acompanhamento do Professor Diretor de Turma (SEDUC-CE).
          </p>
        </div>
      </div>

      {/* Student Banner */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/70 to-white shadow-sm">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src={student.photoUrl || ""} alt={student.name} />
            <AvatarFallback className="bg-blue-800 text-white font-bold text-lg">
              {student.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Matrícula: {student.registrationNumber}
              </Badge>
              {student.cpf && (
                <Badge variant="outline" className="font-mono text-slate-600">
                  CPF: {student.cpf}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-600">
              Turma: <strong>{classGroup?.name || "Sem turma"}</strong> • PDT: <strong>{classGroup?.pdtTeacher?.name || "Não atribuído"}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Responsável: {student.guardianName || "-"} ({student.guardianPhone || "-"})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dossier Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Perfil Sociofamiliar e Saúde */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Perfil Sociofamiliar, Transporte & Saúde
            </CardTitle>
            <CardDescription className="text-xs">
              Informações essenciais para a compreensão do contexto de vida do estudante.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="livesWith" className="text-xs font-semibold text-slate-700">Mora com quem?</Label>
                <Input
                  id="livesWith"
                  value={livesWith}
                  onChange={(e) => setLivesWith(e.target.value)}
                  placeholder="Ex: Pais, Mãe, Avós..."
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="siblingsCount" className="text-xs font-semibold text-slate-700">Número de Irmãos</Label>
                <Input
                  id="siblingsCount"
                  type="number"
                  value={siblingsCount}
                  onChange={(e) => setSiblingsCount(Number(e.target.value))}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="transportMethod" className="text-xs font-semibold text-slate-700">Meio de Transporte</Label>
                <Input
                  id="transportMethod"
                  value={transportMethod}
                  onChange={(e) => setTransportMethod(e.target.value)}
                  placeholder="Ex: Ônibus Escolar, A pé, Moto..."
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="familyIncomeBracket" className="text-xs font-semibold text-slate-700">Faixa de Renda Familiar</Label>
                <select
                  id="familyIncomeBracket"
                  value={familyIncomeBracket}
                  onChange={(e) => setFamilyIncomeBracket(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="Até 1 Salário Mínimo">Até 1 Salário Mínimo</option>
                  <option value="De 1 a 2 Salários Mínimos">De 1 a 2 Salários Mínimos</option>
                  <option value="De 2 a 4 Salários Mínimos">De 2 a 4 Salários Mínimos</option>
                  <option value="Acima de 4 Salários Mínimos">Acima de 4 Salários Mínimos</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="healthConditions" className="text-xs font-semibold text-slate-700">Condições de Saúde / Alergias</Label>
                <Input
                  id="healthConditions"
                  value={healthConditions}
                  onChange={(e) => setHealthConditions(e.target.value)}
                  placeholder="Ex: Asma, rinite, uso contínuo de medicação..."
                  className="h-10 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloco 2: Projeto de Vida e Aprendizagem */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Projeto de Vida & Desempenho Pedagógico
            </CardTitle>
            <CardDescription className="text-xs">
              Mapeamento de competências socioemocionais e expectativas do estudante.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lifeProjectGoals" className="text-xs font-semibold text-slate-700">
                🎯 Projeto de Vida / Sonho Profissional do Aluno
              </Label>
              <Textarea
                id="lifeProjectGoals"
                value={lifeProjectGoals}
                onChange={(e) => setLifeProjectGoals(e.target.value)}
                placeholder="Ex: Pretende cursar Engenharia de Software na UFC, interesse por tecnologia e idiomas..."
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="strengths" className="text-xs font-semibold text-emerald-800">
                  🌟 Pontos Fortes e Habilidades
                </Label>
                <Textarea
                  id="strengths"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Ex: Boa comunicação, liderança em grupo, pontual..."
                  rows={3}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="challenges" className="text-xs font-semibold text-red-800">
                  ⚠️ Desafios / Dificuldades de Aprendizagem
                </Label>
                <Textarea
                  id="challenges"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Ex: Dificuldade em Matemática Básica, timidez para falar em público..."
                  rows={3}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observations" className="text-xs font-semibold text-slate-700">
                Observações Gerais do Professor Diretor de Turma
              </Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Anotações confidenciais do PDT para acompanhamento da turma..."
                rows={2}
                className="text-xs"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={loading} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Salvar Dossiê do Aluno
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
