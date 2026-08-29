"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building2, Clock, CheckCircle, Plus, Save, Loader2, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addInternshipLog } from "@/actions/estagio.actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface EstagioDetalheClientProps {
  internship: any;
}

export default function EstagioDetalheClient({ internship }: EstagioDetalheClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [monthYear, setMonthYear] = useState("08/2026");
  const [hoursLogged, setHoursLogged] = useState(80);
  const [activities, setActivities] = useState("");
  const [feedback, setFeedback] = useState("");

  const completed = internship.completedHours || 0;
  const total = internship.totalHours || 400;
  const percent = Math.min(100, Math.round((completed / total) * 100));

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthYear || !hoursLogged || !activities) {
      toast.error("Preencha o mês de referência, horas cumpridas e atividades desenvolvidas.");
      return;
    }

    setLoading(true);
    try {
      const res = await addInternshipLog({
        internshipId: internship.id,
        monthYear,
        hoursLogged: Number(hoursLogged),
        activities,
        feedback,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao registrar horas de estágio.");
        return;
      }

      toast.success("Horas e atividades de estágio registradas com sucesso!");
      setActivities("");
      setFeedback("");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao salvar log de estágio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Link href="/estagio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-blue-600" />
            Ficha de Estágio Supervisionado
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Acompanhamento de frequência, atividades práticas e avaliação do estagiário.
          </p>
        </div>
      </div>

      {/* Student & Company Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/70 to-white shadow-sm">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src={internship.student?.photoUrl || ""} alt={internship.student?.name} />
            <AvatarFallback className="bg-blue-800 text-white font-bold text-lg">
              {internship.student?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900">{internship.student?.name}</h2>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {internship.courseName}
              </Badge>
              <Badge variant="outline">
                {internship.status === "EM_ANDAMENTO" ? "Em Andamento" : "Concluído"}
              </Badge>
            </div>
            <p className="text-xs text-slate-600">
              Empresa: <strong>{internship.company?.tradeName}</strong> ({internship.company?.corporateName})
            </p>
            <p className="text-xs text-slate-500">
              Orientador: <strong>{internship.advisor?.name}</strong> • Supervisor na Empresa: {internship.supervisorName || "Não informado"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hours Progress */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Clock className="w-4 h-4 text-blue-600" />
              Progresso da Carga Horária Obrigatória
            </span>
            <span className="text-blue-900 font-mono text-base">
              {completed}h / {total}h ({percent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percent >= 100 ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Log Monthly Form */}
      <Card className="border-blue-200 bg-blue-50/40 shadow-sm">
        <CardHeader className="pb-3 border-b border-blue-100">
          <CardTitle className="text-sm font-bold text-blue-950 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-700" />
            Lançar Frequência & Atividades Mensais do Estagiário
          </CardTitle>
          <CardDescription className="text-xs">
            Registro das horas cumpridas e parecer do professor orientador ou supervisor.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleAddLog} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="month" className="text-xs font-semibold text-slate-700">Mês de Referência *</Label>
                <Input
                  id="month"
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  placeholder="Ex: 08/2026"
                  required
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hours" className="text-xs font-semibold text-slate-700">Horas Cumpridas no Mês *</Label>
                <Input
                  id="hours"
                  type="number"
                  value={hoursLogged}
                  onChange={(e) => setHoursLogged(Number(e.target.value))}
                  required
                  min={1}
                  max={200}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acts" className="text-xs font-semibold text-slate-700">Atividades Desenvolvidas no Período *</Label>
              <Textarea
                id="acts"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="Descreva as tarefas técnicas e práticas realizadas pelo aluno na empresa..."
                rows={3}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feedback" className="text-xs font-semibold text-slate-700">Parecer / Feedback do Orientador ou Empresa</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Avaliação do desempenho, pontualidade e postura profissional..."
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10 px-5">
                {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Registrar Frequência Mensal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Logs History */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Histórico Mensal de Atividades ({internship.logs?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!internship.logs || internship.logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhuma folha mensal registrada para este estágio ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {internship.logs.map((log: any) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 font-mono text-xs">
                        {log.monthYear}
                      </Badge>
                      <span className="font-bold text-slate-900 text-xs">
                        +{log.hoursLogged} horas computadas
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {format(new Date(log.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border leading-relaxed">
                    <strong>Atividades:</strong> {log.activities}
                  </p>

                  {log.feedback && (
                    <p className="text-xs text-blue-900 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      <strong>Parecer do Orientador:</strong> {log.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
