"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Users, UserPlus, Trash2, User, BookOpen, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { enrollStudentInElective, removeStudentFromElective } from "@/actions/eletivas.actions";
import { toast } from "sonner";

interface EletivaDetalheClientProps {
  elective: any;
  allStudents: any[];
}

export default function EletivaDetalheClient({ elective, allStudents }: EletivaDetalheClientProps) {
  const router = useRouter();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  const enrolledIds = elective.enrollments.map((en: any) => en.studentId);
  const availableStudents = allStudents.filter((s) => !enrolledIds.includes(s.id));

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Selecione um aluno para matricular.");
      return;
    }

    setLoading(true);
    try {
      const res = await enrollStudentInElective(selectedStudentId, elective.id);
      if (!res.success) {
        toast.error(res.error || "Erro ao matricular aluno.");
        return;
      }
      toast.success("Aluno matriculado com sucesso na eletiva!");
      setSelectedStudentId("");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao matricular aluno.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (studentId: string, studentName: string) => {
    if (!confirm(`Deseja remover ${studentName} desta eletiva?`)) return;

    try {
      const res = await removeStudentFromElective(studentId, elective.id);
      if (!res.success) {
        toast.error("Erro ao remover aluno.");
        return;
      }
      toast.success("Matrícula cancelada!");
      router.refresh();
    } catch (err) {
      toast.error("Erro ao remover aluno.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Link href="/eletivas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-amber-500" />
            {elective.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {elective.themeArea} • Professor: <strong>{elective.operator?.name}</strong> • Semestre {elective.semester}/{elective.year}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-800">Ementa e Proposta Pedagógica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-700">
            <p className="bg-slate-50 p-3 rounded-lg border leading-relaxed">
              {elective.description}
            </p>
            {elective.goals && (
              <p className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-blue-900">
                <strong>🎯 Objetivos / Culminância:</strong> {elective.goals}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-800">Ocupação de Vagas</CardTitle>
            <CardDescription className="text-xs">Capacidade da turma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-blue-900">
              {elective.enrollments.length} / {elective.maxCapacity}
            </div>
            <p className="text-xs text-slate-500">
              {elective.maxCapacity - elective.enrollments.length > 0
                ? `${elective.maxCapacity - elective.enrollments.length} vagas disponíveis`
                : "Turma lotada"}
            </p>
            {elective.roomLocation && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Local: {elective.roomLocation}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enroll Form */}
      <Card className="border-blue-200 bg-blue-50/40 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleEnroll} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-bold text-blue-950 uppercase flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-blue-700" />
                Matricular Aluno nesta Eletiva
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-blue-200 bg-white text-xs font-medium text-slate-800"
              >
                <option value="">Selecione o aluno para matricular...</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.enrollments?.[0]?.classGroup?.name || "Sem turma"})
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              disabled={loading || elective.enrollments.length >= elective.maxCapacity}
              className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10 px-5 shrink-0"
            >
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1.5 h-4 w-4" />}
              Confirmar Matrícula
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Enrolled Students Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Alunos Matriculados ({elective.enrollments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {elective.enrollments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhum estudante matriculado nesta eletiva ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {elective.enrollments.map((en: any, idx: number) => (
                <div key={en.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={en.student?.photoUrl || ""} alt={en.student?.name} />
                      <AvatarFallback className="text-[10px] font-bold bg-blue-100 text-blue-800">
                        {en.student?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{en.student?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Turma Base: {en.student?.enrollments?.[0]?.classGroup?.name || "-"} • Mat: {en.student?.registrationNumber}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(en.studentId, en.student?.name)}
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
