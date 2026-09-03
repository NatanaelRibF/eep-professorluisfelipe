"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { School, PlusCircle, Users, ClipboardCheck, GraduationCap, Search, Calendar, Filter, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TurmasClientProps {
  initialClasses: any[];
  schoolYears: any[];
}

export default function TurmasClient({ initialClasses, schoolYears }: TurmasClientProps) {
  const currentYear = schoolYears.find((y) => y.isCurrent) || schoolYears[0];
  const [selectedYearId, setSelectedYearId] = useState<string>(currentYear?.id || "all");
  const [search, setSearch] = useState("");
  const [selectedShift, setSelectedShift] = useState<string>("ALL");

  const filteredClasses = useMemo(() => {
    return initialClasses.filter((t) => {
      const matchesYear =
        selectedYearId === "all" || t.schoolYearId === selectedYearId;
      const matchesShift =
        selectedShift === "ALL" || t.shift === selectedShift;
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.grade?.name && t.grade.name.toLowerCase().includes(search.toLowerCase())) ||
        (t.pdtTeacher?.name && t.pdtTeacher.name.toLowerCase().includes(search.toLowerCase()));

      return matchesYear && matchesShift && matchesSearch;
    });
  }, [initialClasses, selectedYearId, selectedShift, search]);

  const activeYearObj = schoolYears.find((y) => y.id === selectedYearId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <School className="h-7 w-7 text-blue-600" />
            Turmas e Séries
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            {activeYearObj
              ? `Exibindo turmas do Ano Letivo ${activeYearObj.year}${activeYearObj.isCurrent ? " (Ano Vigente)" : ""}`
              : "Gerenciamento geral de turmas e enturmações da escola."}
          </p>
        </div>

        <Link href="/turmas/novo">
          <Button className="bg-blue-800 hover:bg-blue-700 shadow-sm w-full sm:w-auto font-semibold text-xs h-10">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search */}
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por turma, série ou PDT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-xs bg-white"
              />
            </div>

            {/* School Year Filter */}
            <div className="sm:col-span-4">
              <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                <SelectTrigger className="h-10 text-xs font-semibold bg-white border-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <SelectValue placeholder="Ano Letivo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Anos Letivos</SelectItem>
                  {schoolYears.map((sy) => (
                    <SelectItem key={sy.id} value={sy.id}>
                      Ano Letivo {sy.year} {sy.isCurrent ? "(Atual)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shift Filter */}
            <div className="sm:col-span-3">
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="h-10 text-xs font-semibold bg-white border-slate-300">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Turno" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Turnos</SelectItem>
                  <SelectItem value="MANHA">Manhã</SelectItem>
                  <SelectItem value="TARDE">Tarde</SelectItem>
                  <SelectItem value="NOITE">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class List Grid */}
      {filteredClasses.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 border-dashed">
          <School className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Nenhuma turma encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não há turmas cadastradas para o ano letivo selecionado ou com os filtros atuais.
          </p>
          <div className="mt-4">
            <Link href="/turmas/novo">
              <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-xs">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Cadastrar Turma neste Ano
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClasses.map((turma) => (
            <Card key={turma.id} className="hover:shadow-md transition-shadow border-slate-200 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
                      {turma.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500 mt-0.5">
                      {turma.grade?.name || "Ensino Médio"}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[11px] font-bold">
                      {turma.shift === "MANHA" ? "Manhã" : turma.shift === "TARDE" ? "Tarde" : "Noite"}
                    </Badge>
                    <Badge
                      className={`text-[10px] font-semibold ${
                        turma.schoolYear?.isCurrent
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {turma.schoolYear?.year || "2026"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-3">
                {/* PDT Info */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-purple-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Professor Diretor de Turma (PDT)</p>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {turma.pdtTeacher?.name || "Não atribuído"}
                    </p>
                  </div>
                </div>

                {/* Professores Vinculados */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <UserCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Professores da Turma</p>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {turma.teacherClasses?.length > 0
                        ? turma.teacherClasses.map((tc: any) => tc.operator?.name).filter(Boolean).join(", ")
                        : "Nenhum docente vinculado"}
                    </p>
                  </div>
                </div>

                {/* Enrollment count */}
                <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-700">Estudantes Matriculados</span>
                  </div>
                  <span className="text-base font-black text-blue-900">
                    {turma._count?.enrollments || 0}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link href={`/alunos?classGroupId=${turma.id}`} className="w-full">
                  <Button variant="outline" className="w-full text-xs font-semibold h-9 border-slate-300 hover:bg-slate-50">
                    <Users className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                    Ver Alunos
                  </Button>
                </Link>
                <Link href={`/frequencia?turmaId=${turma.id}`} className="w-full">
                  <Button className="w-full text-xs font-semibold h-9 bg-blue-800 hover:bg-blue-700 text-white">
                    <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
                    Chamada
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
