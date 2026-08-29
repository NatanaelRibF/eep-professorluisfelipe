"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createPDTAttendance } from "@/actions/pdt.actions";
import { toast } from "sonner";

export default function NovoAtendimentoClient({ students }: { students: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [reason, setReason] = useState("Acompanhamento de Rendimento Escolar");
  const [summary, setSummary] = useState("");
  const [actionPlan, setActionPlan] = useState("");

  const handleStudentSelect = (id: string) => {
    setStudentId(id);
    const selected = students.find((s) => s.id === id);
    if (selected && selected.guardianName) {
      setGuardianName(selected.guardianName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !guardianName || !summary) {
      toast.error("Preencha o aluno, nome do responsável e o resumo do atendimento.");
      return;
    }

    setLoading(true);
    try {
      const res = await createPDTAttendance({
        studentId,
        guardianName,
        reason,
        summary,
        actionPlan,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao registrar atendimento.");
        return;
      }

      toast.success("Atendimento registrado com sucesso!");
      router.push("/pdt");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao salvar atendimento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2">
        <Link href="/pdt">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <HeartHandshake className="h-7 w-7 text-blue-600" />
            Novo Atendimento a Pais & Responsáveis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Registro oficial de escuta e pactuação de compromissos com a família (PDT / Gestão).
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Dados do Atendimento</CardTitle>
            <CardDescription className="text-xs">
              Selecione o estudante e descreva a conversa com o responsável legal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="student" className="text-xs font-semibold text-slate-700">Aluno *</Label>
                <select
                  id="student"
                  value={studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o aluno...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.enrollments?.[0]?.classGroup?.name || "Sem turma"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guardian" className="text-xs font-semibold text-slate-700">Nome do Responsável Presente *</Label>
                <Input
                  id="guardian"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Nome do pai, mãe ou responsável legal"
                  required
                  className="h-11 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-semibold text-slate-700">Motivo do Atendimento *</Label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
              >
                <option value="Acompanhamento de Rendimento Escolar">Acompanhamento de Rendimento Escolar</option>
                <option value="Infrequência / Busca Ativa">Infrequência / Busca Ativa</option>
                <option value="Conduta e Convivência em Sala">Conduta e Convivência em Sala</option>
                <option value="Orientação Vocacional / Projeto de Vida">Orientação Vocacional / Projeto de Vida</option>
                <option value="Elogio / Destaque Acadêmico">Elogio / Destaque Acadêmico</option>
                <option value="Outro Motivo">Outro Motivo</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="summary" className="text-xs font-semibold text-slate-700">
                Resumo da Reunião / Relato do Encontro *
              </Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Descreva os pontos tratados durante a reunião com o responsável..."
                rows={4}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="actionPlan" className="text-xs font-semibold text-slate-700">
                Plano de Ação e Compromissos Assumidos
              </Label>
              <Textarea
                id="actionPlan"
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder="Ex: Responsável irá acompanhar as tarefas diárias e o aluno participará do reforço nas terças..."
                rows={3}
                className="text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Link href="/pdt">
              <Button variant="outline" type="button" className="text-xs">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Salvar Atendimento
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
