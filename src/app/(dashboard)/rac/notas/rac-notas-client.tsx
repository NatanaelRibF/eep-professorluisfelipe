"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Printer, ChevronLeft, Calendar, School, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, User, Info, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRACGradesByClass } from "@/actions/rac.actions";
import { toast } from "sonner";

interface RACNotasClientProps {
  classes: any[];
  initialData: any;
  defaultClassId: string;
  defaultBimester: number;
}

export default function RACNotasClient({
  classes,
  initialData,
  defaultClassId,
  defaultBimester,
}: RACNotasClientProps) {
  const [selectedClassId, setSelectedClassId] = useState(defaultClassId);
  const [selectedBimester, setSelectedBimester] = useState(defaultBimester);
  const [reportData, setReportData] = useState<any>(initialData);
  const [loading, setLoading] = useState(false);

  const fetchGrades = async (classId: string, bim: number) => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await getRACGradesByClass({
        classGroupId: classId,
        bimester: bim,
      });
      if (res.success) {
        setReportData(res);
      } else {
        toast.error(res.error || "Erro ao carregar notas.");
      }
    } catch (err: any) {
      toast.error("Erro ao carregar notas.");
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    fetchGrades(classId, selectedBimester);
  };

  const handleBimesterChange = (bimStr: string) => {
    const bim = Number(bimStr);
    setSelectedBimester(bim);
    fetchGrades(selectedClassId, bim);
  };

  const handlePrint = () => {
    window.print();
  };

  const students = reportData?.studentGrades || [];
  const stats = reportData?.stats || {
    totalStudents: 0,
    averageGrade: 10,
    countGrade10: 0,
    countCritical: 0,
    countWithPenalties: 0,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Controls (Hidden when printing) */}
      <div className="print:hidden space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/rac">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
                <Award className="h-7 w-7 text-amber-500" />
                Boletim de Notas de RAC por Turma
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm">
                Pontuação bimestral de conduta (10,0 pontos iniciais • 4 primeiros RACs de tolerância pedagógica).
              </p>
            </div>
          </div>

          <Button onClick={handlePrint} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10 shadow-sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Relatório Oficial
          </Button>
        </div>

        {/* Filter Selection Bar */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-blue-50/50 via-white to-amber-50/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-blue-600" />
                  Turma
                </label>
                <Select value={selectedClassId} onValueChange={handleClassChange}>
                  <SelectTrigger className="h-10 text-xs font-semibold bg-white border-slate-300">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.shift === "MANHA" ? "Manhã" : c.shift === "TARDE" ? "Tarde" : "Noite"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Bimestre de Avaliação
                </label>
                <Select value={String(selectedBimester)} onValueChange={handleBimesterChange}>
                  <SelectTrigger className="h-10 text-xs font-semibold bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Bimestre (Fevereiro - Abril)</SelectItem>
                    <SelectItem value="2">2º Bimestre (Maio - Junho)</SelectItem>
                    <SelectItem value="3">3º Bimestre (Agosto - Setembro)</SelectItem>
                    <SelectItem value="4">4º Bimestre (Outubro - Dezembro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rule Reminder Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Regra Pedagógica Oficial de Notas do RAC:</strong> Cada estudante inicia o bimestre com <strong>10,0 pontos</strong>. Os <strong>4 primeiros registros de RAC têm tolerância (0 pontos perdidos)</strong>. A partir do 5º registro, o aluno perde: <strong>Leve: -1 ponto</strong>, <strong>Moderado: -2 pontos</strong>, <strong>Grave: -3 pontos</strong>.
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-3.5 sm:p-4 pb-1">
              <CardDescription className="text-[11px] font-bold text-slate-500 uppercase">Média da Turma</CardDescription>
              <CardTitle className="text-2xl font-black text-blue-900">{stats.averageGrade.toFixed(1)}</CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-1">
              <p className="text-[11px] text-slate-500">{stats.totalStudents} Alunos avaliados</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/40 shadow-sm">
            <CardHeader className="p-3.5 sm:p-4 pb-1">
              <CardDescription className="text-[11px] font-bold text-emerald-800 uppercase">Nota 10,0</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-900">{stats.countGrade10}</CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-1">
              <p className="text-[11px] text-emerald-700">Sem perda de pontos</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/40 shadow-sm">
            <CardHeader className="p-3.5 sm:p-4 pb-1">
              <CardDescription className="text-[11px] font-bold text-amber-800 uppercase">&gt; 4 RACs (Penalizados)</CardDescription>
              <CardTitle className="text-2xl font-black text-amber-900">{stats.countWithPenalties}</CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-1">
              <p className="text-[11px] text-amber-700">Ultrapassaram a tolerância</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/40 shadow-sm">
            <CardHeader className="p-3.5 sm:p-4 pb-1">
              <CardDescription className="text-[11px] font-bold text-red-800 uppercase">Nota Crítica (&lt; 5,0)</CardDescription>
              <CardTitle className="text-2xl font-black text-red-900">{stats.countCritical}</CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-1">
              <p className="text-[11px] text-red-700">Atenção imediata do PDT</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printable / Report Preview Container */}
      <div className="bg-white p-4 sm:p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Official School Header */}
        <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Governo do Estado do Ceará • SEDUC</p>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">EEEP Professor Luís Felipe</h2>
          <h3 className="text-sm sm:text-base font-bold text-blue-900 mt-1">
            Boletim de Notas de RAC — {selectedBimester}º Bimestre ({reportData?.classGroup?.schoolYear || 2026})
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Turma: <strong>{reportData?.classGroup?.name}</strong> • Turno: <strong>{reportData?.classGroup?.shift}</strong> • PDT: <strong>{reportData?.classGroup?.pdtName || "Não atribuído"}</strong>
          </p>
        </div>

        {/* Student Grades Table */}
        {students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Nenhum estudante encontrado para a turma selecionada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50">
                  <th className="py-2.5 px-3 font-bold">Nº / Foto</th>
                  <th className="py-2.5 px-3 font-bold">Estudante</th>
                  <th className="py-2.5 px-3 font-bold text-center">Total RACs</th>
                  <th className="py-2.5 px-3 font-bold text-center">Tolerância (≤ 4)</th>
                  <th className="py-2.5 px-3 font-bold text-center">Penalizados (&gt; 4)</th>
                  <th className="py-2.5 px-3 font-bold text-center">Pontos Perdidos</th>
                  <th className="py-2.5 px-3 font-bold text-right">Nota RAC (0-10)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((st: any, idx: number) => (
                  <tr key={st.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400 font-bold w-5">{idx + 1}.</span>
                        <Avatar className="h-7 w-7 border print:hidden">
                          <AvatarImage src={st.photoUrl || ""} alt={st.studentName} />
                          <AvatarFallback className="text-[10px] font-bold bg-blue-100 text-blue-800">
                            {st.studentName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div>{st.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Mat: {st.registrationNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className="text-xs font-bold">
                        {st.totalRACs}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                      {st.toleranceCount} / 4
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {st.penalizedCount > 0 ? (
                        <span className="font-bold text-red-600">+{st.penalizedCount}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {st.pointsLost > 0 ? (
                        <span className="font-bold text-red-600">-{st.pointsLost.toFixed(1)}</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">0,0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge
                        className={`text-xs font-black px-2.5 py-1 ${
                          st.finalGrade >= 9
                            ? "bg-emerald-600 text-white"
                            : st.finalGrade >= 7
                            ? "bg-blue-600 text-white"
                            : st.finalGrade >= 5
                            ? "bg-amber-500 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {st.finalGrade.toFixed(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures for Print */}
        <div className="mt-16 pt-8 flex flex-col sm:flex-row justify-around gap-8 text-center print:flex print:flex-row">
          <div className="w-full sm:w-64">
            <div className="border-t border-slate-400 mx-auto mb-2"></div>
            <p className="text-xs font-bold text-slate-800">
              {reportData?.classGroup?.pdtName || "Professor Diretor de Turma"}
            </p>
            <p className="text-[10px] text-slate-500">PDT — EEEP Professor Luís Felipe</p>
          </div>
          <div className="w-full sm:w-64">
            <div className="border-t border-slate-400 mx-auto mb-2"></div>
            <p className="text-xs font-bold text-slate-800">Coordenação Pedagógica</p>
            <p className="text-[10px] text-slate-500">EEEP Professor Luís Felipe</p>
          </div>
        </div>
      </div>

      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:flex {
            display: flex !important;
          }
          .bg-white, .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
