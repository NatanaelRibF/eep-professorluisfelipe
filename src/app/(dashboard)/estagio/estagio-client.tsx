"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Building2, Plus, Users, Clock, CheckCircle, ChevronRight, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EstagioClientProps {
  internships: any[];
  companies: any[];
}

export default function EstagioClient({ internships, companies }: EstagioClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TODOS");

  const filtered = internships.filter((item) => {
    const matchesSearch =
      item.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company?.tradeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "TODOS" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = internships.filter((i) => i.status === "EM_ANDAMENTO").length;
  const completedCount = internships.filter((i) => i.status === "CONCLUIDO").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-blue-600" />
            Estágio Curricular Supervisionado (EEEP)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Gestão do estágio obrigatório do 3º ano dos cursos técnicos e convênios com empresas parceiras (SEDUC-CE).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/estagio/empresas">
            <Button size="sm" variant="outline" className="font-semibold text-xs border-blue-200 text-blue-800 hover:bg-blue-50">
              <Building2 className="mr-1.5 h-4 w-4" />
              Empresas Conveniadas ({companies.length})
            </Button>
          </Link>
          <Link href="/estagio/novo">
            <Button size="sm" className="bg-blue-800 hover:bg-blue-700 font-semibold shadow-sm text-xs">
              <Plus className="mr-1.5 h-4 w-4" />
              Alocar Novo Estagiário
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-800 uppercase flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" />
              Estágios em Andamento
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {activeCount} Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Estudantes ativos em empresas parceiras</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-purple-800 uppercase flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-purple-600" />
              Empresas Parceiras
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {companies.length} Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Termos de convênio ativos</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Estágios Concluídos
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {completedCount} Formandos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Com carga horária e avaliação cumpridas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por aluno, empresa ou curso técnico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs sm:text-sm"
          />
        </div>
        <div className="w-full sm:w-56">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="DESLIGADO">Desligado</option>
          </select>
        </div>
      </div>

      {/* Internships Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed">
          <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          Nenhum vínculo de estágio encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const completed = item.completedHours || 0;
            const total = item.totalHours || 400;
            const percent = Math.min(100, Math.round((completed / total) * 100));

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {item.courseName}
                    </span>
                    <Badge className={
                      item.status === "CONCLUIDO" ? "bg-emerald-100 text-emerald-800 text-[10px]" :
                      item.status === "EM_ANDAMENTO" ? "bg-blue-100 text-blue-800 text-[10px]" :
                      "bg-red-100 text-red-800 text-[10px]"
                    }>
                      {item.status === "EM_ANDAMENTO" ? "Em Andamento" : item.status === "CONCLUIDO" ? "Concluído" : "Desligado"}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.student?.name}
                  </h3>

                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>Empresa: <strong>{item.company?.tradeName}</strong></div>
                    <div>Orientador: <strong>{item.advisor?.name}</strong></div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Horas Cumpridas
                    </span>
                    <span className="text-blue-900">{completed}h / {total}h ({percent}%)</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percent >= 100 ? "bg-emerald-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="pt-1 flex justify-end">
                    <Link href={`/estagio/${item.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50">
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Ver Ficha & Lançar Horas
                        <ChevronRight className="w-3 h-3 ml-0.5" />
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
