"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createStudentInternship } from "@/actions/estagio.actions";
import { format } from "date-fns";
import { toast } from "sonner";

interface NovoEstagioClientProps {
  students: any[];
  companies: any[];
  operators: any[];
}

export default function NovoEstagioClient({
  students,
  companies,
  operators,
}: NovoEstagioClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [advisorId, setAdvisorId] = useState("");
  const [courseName, setCourseName] = useState("Técnico em Informática");
  const [totalHours, setTotalHours] = useState(400);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [supervisorName, setSupervisorName] = useState("");

  const teachers = operators.filter((o) => o.role?.name === "Professor" || o.role?.name === "Diretor" || o.role?.name === "Coordenador");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !companyId || !advisorId || !startDate) {
      toast.error("Preencha o aluno, empresa parceira, professor orientador e data de início.");
      return;
    }

    setLoading(true);
    try {
      const res = await createStudentInternship({
        studentId,
        companyId,
        advisorId,
        courseName,
        totalHours: Number(totalHours) || 400,
        startDate,
        supervisorName,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao alocar estagiário.");
        return;
      }

      toast.success("Estágio curricular iniciado com sucesso!");
      router.push("/estagio");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao cadastrar estágio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2">
        <Link href="/estagio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-blue-600" />
            Alocar Aluno em Estágio Obrigatório
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Vinculação do estudante do 3º ano técnico à empresa concedente e professor orientador.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Termo de Compromisso & Dados do Estágio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="student" className="text-xs font-semibold text-slate-700">Estudante Estagiário *</Label>
              <select
                id="student"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o aluno do 3º ano...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.enrollments?.[0]?.classGroup?.name || "Sem turma"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs font-semibold text-slate-700">Empresa Concedente / Parceira *</Label>
                <select
                  id="company"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="">Selecione a empresa conveniada...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradeName} ({c.industryArea})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="advisor" className="text-xs font-semibold text-slate-700">Professor Orientador de Estágio *</Label>
                <select
                  id="advisor"
                  value={advisorId}
                  onChange={(e) => setAdvisorId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="">Selecione o professor orientador...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.nickname ? `(${t.nickname})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="course" className="text-xs font-semibold text-slate-700">Curso Técnico *</Label>
                <Input
                  id="course"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Técnico em Informática, Enfermagem..."
                  required
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hours" className="text-xs font-semibold text-slate-700">Carga Horária Total (Horas) *</Label>
                <Input
                  id="hours"
                  type="number"
                  value={totalHours}
                  onChange={(e) => setTotalHours(Number(e.target.value))}
                  required
                  min={100}
                  max={800}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="start" className="text-xs font-semibold text-slate-700">Data de Início *</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supervisor" className="text-xs font-semibold text-slate-700">Supervisor Responsável na Empresa</Label>
              <Input
                id="supervisor"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                placeholder="Nome do gestor ou supervisor no local de estágio"
                className="h-10 text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Link href="/estagio">
              <Button variant="outline" type="button" className="text-xs">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Efetivar Alocação de Estágio
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
