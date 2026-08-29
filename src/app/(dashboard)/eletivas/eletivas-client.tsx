"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Plus, Users, BookOpen, Search, CheckCircle, ChevronRight, Store, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EletivasClientProps {
  electives: any[];
}

export default function EletivasClient({ electives }: EletivasClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("TODAS");

  const filteredElectives = electives.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.operator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === "TODAS" || e.themeArea === selectedArea;
    return matchesSearch && matchesArea;
  });

  const totalCapacity = electives.reduce((acc, e) => acc + (e.maxCapacity || 0), 0);
  const totalEnrolled = electives.reduce((acc, e) => acc + (e._count?.enrollments || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-amber-500" />
            Disciplinas Eletivas & Feirão
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Componente diversificado do Ensino Médio em Tempo Integral — Escolha e Protagonismo Estudantil.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/eletivas/feirao">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 font-bold shadow-sm text-xs text-white">
              <Store className="mr-1.5 h-4 w-4" />
              Portal do Feirão de Eletivas
            </Button>
          </Link>
          <Link href="/eletivas/novo">
            <Button size="sm" className="bg-blue-800 hover:bg-blue-700 font-semibold shadow-sm text-xs">
              <Plus className="mr-1.5 h-4 w-4" />
              Criar Nova Eletiva
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-amber-800 uppercase flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Eletivas Ofertadas
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {electives.length} Disciplinas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Catálogo ativo no semestre</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-800 uppercase flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" />
              Alunos Inscritos
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {totalEnrolled} / {totalCapacity} Vagas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Total de matrículas realizadas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Taxa de Ocupação
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {occupancyRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Adesão geral no Feirão</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por título da eletiva ou professor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs sm:text-sm"
          />
        </div>
        <div className="w-full sm:w-60">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
          >
            <option value="TODAS">Todas as Áreas</option>
            <option value="Tecnologia">Tecnologia & Inovação</option>
            <option value="Linguagens">Linguagens & Artes</option>
            <option value="Matemática">Matemática & Finanças</option>
            <option value="Natureza">Ciências da Natureza</option>
            <option value="Humanas">Ciências Humanas & Sociais</option>
          </select>
        </div>
      </div>

      {/* Electives Grid */}
      {filteredElectives.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed">
          <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          Nenhuma disciplina eletiva encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredElectives.map((eletiva) => {
            const enrolled = eletiva._count?.enrollments || 0;
            const capacity = eletiva.maxCapacity || 35;
            const percent = Math.min(100, Math.round((enrolled / capacity) * 100));

            return (
              <div
                key={eletiva.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {eletiva.themeArea}
                    </span>
                    <Badge className="bg-slate-100 text-slate-700 font-mono text-[10px]">
                      {eletiva.semester}º Semestre / {eletiva.year}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {eletiva.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {eletiva.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Professor: <strong>{eletiva.operator?.name}</strong></span>
                    <span className="font-bold text-blue-900">{enrolled}/{capacity}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percent >= 100 ? "bg-red-500" : percent >= 80 ? "bg-amber-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="pt-1 flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">
                      {eletiva.roomLocation ? `Sala: ${eletiva.roomLocation}` : "Sala a definir"}
                    </span>
                    <Link href={`/eletivas/${eletiva.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50">
                        Ver Turma & Alunos
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
