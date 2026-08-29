"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckSquare, Plus, Users, Calendar, Award, ChevronRight, BarChart3, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SimuladosClientProps {
  exams: any[];
}

export default function SimuladosClient({ exams }: SimuladosClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");

  const filteredExams = exams.filter((ex) => {
    const matchesSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "TODAS" || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalSubmissions = exams.reduce((acc, e) => acc + (e._count?.submissions || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-blue-600" />
            Simulados & Avaliações Diagnósticas
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Gestão de simulados SPAECE e ENEM com matriz de descritores e recomposição da aprendizagem (SEDUC-CE).
          </p>
        </div>
        <Link href="/simulados/novo">
          <Button size="sm" className="bg-blue-800 hover:bg-blue-700 font-semibold shadow-sm text-xs">
            <Plus className="mr-1.5 h-4 w-4" />
            Cadastrar Novo Simulado
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-800 uppercase flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              Simulados Cadastrados
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {exams.length} Provas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">SPAECE, ENEM e Avaliações Internas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-600" />
              Alunos Avaliados
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {totalSubmissions} Cartões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Respostas e gabaritos computados</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-amber-800 uppercase flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-600" />
              Foco na Aprendizagem
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Descritores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Diagnóstico de proficiência por habilidade</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar simulado por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs sm:text-sm"
          />
        </div>
        <div className="w-full sm:w-60">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
          >
            <option value="TODAS">Todas as Categorias</option>
            <option value="SPAECE">SPAECE (LP & MAT)</option>
            <option value="ENEM">ENEM (4 Áreas)</option>
            <option value="DIAGNOSTICA">Avaliação Diagnóstica</option>
          </select>
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed">
          <CheckSquare className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          Nenhum simulado cadastrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <Badge className={
                    exam.category === "SPAECE" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                    exam.category === "ENEM" ? "bg-blue-100 text-blue-800 border-blue-200" :
                    "bg-amber-100 text-amber-800 border-amber-200"
                  }>
                    {exam.category}
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {format(new Date(exam.date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-600">
                  {exam.totalQuestions} Questões cadastradas com gabarito e descritores.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">
                  {exam._count?.submissions || 0} Alunos Lançados
                </span>
                <Link href={`/simulados/${exam.id}`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50">
                    <BarChart3 className="w-3.5 h-3.5 mr-1" />
                    Ver Diagnóstico & Respostas
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
