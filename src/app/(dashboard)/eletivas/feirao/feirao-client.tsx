"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Store, Sparkles, CheckCircle, Users, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { enrollStudentInElective } from "@/actions/eletivas.actions";
import { toast } from "sonner";

interface FeiraoClientProps {
  electives: any[];
  students: any[];
}

export default function FeiraoClient({ electives, students }: FeiraoClientProps) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleQuickEnroll = async (electiveId: string, electiveName: string) => {
    if (!selectedStudentId) {
      toast.error("Por favor, selecione o aluno no topo da página primeiro!");
      return;
    }

    setEnrollingId(electiveId);
    try {
      const res = await enrollStudentInElective(selectedStudentId, electiveId);
      if (!res.success) {
        toast.error(res.error || "Não foi possível realizar a inscrição.");
        return;
      }
      toast.success(`🎉 Inscrição de ${selectedStudent?.name} na eletiva "${electiveName}" realizada com sucesso!`);
    } catch (err: any) {
      toast.error(err.message || "Erro na inscrição");
    } finally {
      setEnrollingId(null);
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-900 flex items-center gap-2">
            <Store className="h-7 w-7 text-amber-600" />
            Portal do Feirão das Eletivas
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Vitrine interativa de escolha e matrícula em tempo real para os estudantes.
          </p>
        </div>
      </div>

      {/* Student Selector Banner */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/40 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-3">
          <label className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-700" />
            1. Selecione o Estudante para Inscrição no Feirão:
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl border border-amber-300 bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 shadow-xs"
          >
            <option value="">Selecione o aluno que está escolhendo no Feirão...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.enrollments?.[0]?.classGroup?.name || "Sem turma"})
              </option>
            ))}
          </select>
          {selectedStudent && (
            <p className="text-xs text-amber-900 font-medium">
              ✅ Aluno selecionado: <strong>{selectedStudent.name}</strong> ({selectedStudent.enrollments?.[0]?.classGroup?.name || "Sem turma"})
            </p>
          )}
        </CardContent>
      </Card>

      {/* Electives Showcase Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          2. Escolha uma das Eletivas Disponíveis:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {electives.map((el) => {
            const enrolledCount = el._count?.enrollments || 0;
            const capacity = el.maxCapacity || 35;
            const isFull = enrolledCount >= capacity;

            return (
              <Card
                key={el.id}
                className={`border transition-all flex flex-col justify-between ${
                  isFull ? "border-slate-200 opacity-80 bg-slate-50" : "border-amber-200 hover:border-amber-400 bg-white shadow-sm"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                      {el.themeArea}
                    </span>
                    <Badge className={isFull ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}>
                      {enrolledCount} / {capacity} Vagas
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 mt-1">
                    {el.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Professor: <strong>{el.operator?.name}</strong> {el.roomLocation ? `• Sala: ${el.roomLocation}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border">
                    {el.description}
                  </p>
                  <Button
                    onClick={() => handleQuickEnroll(el.id, el.name)}
                    disabled={isFull || enrollingId === el.id}
                    className={`w-full h-11 font-bold text-xs shadow-sm ${
                      isFull
                        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    }`}
                  >
                    {isFull ? "Vagas Esgotadas" : "Escolher Esta Eletiva"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
