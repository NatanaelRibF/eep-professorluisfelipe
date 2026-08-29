"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Users, BarChart3, Award, CheckCircle, AlertTriangle, Loader2, Save, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { submitExamAnswers } from "@/actions/simulados.actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface SimuladoDetalheClientProps {
  exam: any;
  students: any[];
}

export default function SimuladoDetalheClient({ exam, students }: SimuladoDetalheClientProps) {
  const router = useRouter();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const answerKey = (exam.answerKey as Array<{ q: number; answer: string; descriptor?: string }>) || [];
  const submissions = exam.submissions || [];

  // Calculate aggregated descriptor stats across all submissions
  const aggregatedDescriptors: Record<string, { correct: number; total: number }> = {};
  submissions.forEach((sub: any) => {
    const stats = (sub.descriptorStats as Record<string, { correct: number; total: number }>) || {};
    Object.entries(stats).forEach(([desc, val]) => {
      if (!aggregatedDescriptors[desc]) aggregatedDescriptors[desc] = { correct: 0, total: 0 };
      aggregatedDescriptors[desc].correct += val.correct;
      aggregatedDescriptors[desc].total += val.total;
    });
  });

  const handleAnswerChange = (q: number, ans: string) => {
    setStudentAnswers({
      ...studentAnswers,
      [String(q)]: ans.toUpperCase(),
    });
  };

  const handleFillAll = (ans: string) => {
    const filled: Record<string, string> = {};
    answerKey.forEach((item) => {
      filled[String(item.q)] = ans;
    });
    setStudentAnswers(filled);
  };

  const handleSubmitAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Selecione o estudante.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitExamAnswers({
        examId: exam.id,
        studentId: selectedStudentId,
        answers: studentAnswers,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao computar cartão resposta.");
        return;
      }

      toast.success(`Respostas computadas! Pontuação: ${res.submission?.score}% (${res.submission?.correctCount}/${answerKey.length})`);
      setSelectedStudentId("");
      setStudentAnswers({});
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao enviar respostas.");
    } finally {
      setLoading(false);
    }
  };

  const avgScore =
    submissions.length > 0
      ? Math.round(submissions.reduce((acc: number, s: any) => acc + s.score, 0) / submissions.length)
      : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Link href="/simulados">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-blue-600" />
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {exam.category} • Série: {exam.targetGrade} • Aplicado em: {format(new Date(exam.date), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-800 uppercase flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" />
              Alunos Avaliados
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {submissions.length} Cartões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Respostas computadas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Média Geral de Acertos
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {avgScore}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {avgScore >= 80 ? "Padrão Adequado 🟢" : avgScore >= 60 ? "Padrão Intermediário 🟡" : "Padrão Crítico 🔴"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-purple-800 uppercase flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              Descritores Avaliados
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {Object.keys(aggregatedDescriptors).length} Habilidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Matriz diagnóstica SEDUC-CE</p>
          </CardContent>
        </Card>
      </div>

      {/* Launch Student Answers Card */}
      <Card className="border-blue-200 bg-blue-50/40 shadow-sm">
        <CardHeader className="pb-3 border-b border-blue-100">
          <CardTitle className="text-sm font-bold text-blue-950 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-700" />
            Lançamento Rápido de Cartão-Resposta do Aluno
          </CardTitle>
          <CardDescription className="text-xs">
            Selecione o aluno e marque as alternativas assinaladas no simulado.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <form onSubmit={handleSubmitAnswers} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Estudante *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="">Selecione o aluno para lançar respostas...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.enrollments?.[0]?.classGroup?.name || "Sem turma"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="outline" size="sm" onClick={() => handleFillAll("A")} className="h-10 text-[11px]">
                  Todos A
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleFillAll("B")} className="h-10 text-[11px]">
                  Todos B
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleFillAll("C")} className="h-10 text-[11px]">
                  Todos C
                </Button>
              </div>
            </div>

            {/* Answer Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-3 bg-white rounded-xl border max-h-60 overflow-y-auto">
              {answerKey.map((item) => (
                <div key={item.q} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Q{item.q} <span className="text-[9px] text-slate-400 font-mono">({item.descriptor || "GERAL"})</span>
                  </span>
                  <div className="flex justify-center gap-1">
                    {["A", "B", "C", "D", "E"].map((opt) => {
                      const isSelected = studentAnswers[String(item.q)] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAnswerChange(item.q, opt)}
                          className={`w-6 h-6 rounded text-[11px] font-bold transition-all ${
                            isSelected
                              ? "bg-blue-800 text-white shadow-xs"
                              : "bg-white border text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10 px-6">
                {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Computar & Salvar Cartão Resposta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Descriptors Diagnostic Breakdown */}
      {Object.keys(aggregatedDescriptors).length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              Diagnóstico de Proficiência por Descritor SPAECE / ENEM
            </CardTitle>
            <CardDescription className="text-xs">
              Mapa de calor das habilidades com maior taxa de acerto e de erro da escola.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(aggregatedDescriptors).map(([desc, stat]) => {
                const percent = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                const isCritical = percent < 50;
                const isAdequate = percent >= 75;

                return (
                  <div key={desc} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 font-mono">{desc}</span>
                      <span className={`font-bold ${isAdequate ? "text-emerald-700" : isCritical ? "text-red-700" : "text-amber-700"}`}>
                        {percent}% de acerto ({stat.correct}/{stat.total})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isAdequate ? "bg-emerald-500" : isCritical ? "bg-red-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Ranking */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Ranking de Alunos Avaliados ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {submissions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhum cartão resposta lançado para este simulado ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissions.map((sub: any, idx: number) => (
                <div key={sub.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      idx === 0 ? "bg-amber-100 text-amber-900 font-extrabold" : "bg-slate-100 text-slate-600"
                    }`}>
                      {idx + 1}º
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{sub.student?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {sub.student?.enrollments?.[0]?.classGroup?.name || "Sem turma"} • Mat: {sub.student?.registrationNumber}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-blue-900">{sub.score}%</div>
                    <Badge className={
                      sub.performanceTier === "ADEQUADO" ? "bg-emerald-100 text-emerald-800 text-[10px]" :
                      sub.performanceTier === "INTERMEDIARIO" ? "bg-amber-100 text-amber-800 text-[10px]" :
                      "bg-red-100 text-red-800 text-[10px]"
                    }>
                      {sub.correctCount}/{answerKey.length} Acertos
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
