"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, FileSpreadsheet, Projector, Building2, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RelatorioReservasClientProps {
  spaces: any[];
  spaceBookings: any[];
  equipments: any[];
}

export default function RelatorioReservasClient({
  spaces,
  spaceBookings,
  equipments,
}: RelatorioReservasClientProps) {
  const [filterType, setFilterType] = useState("TODOS");

  const handlePrint = () => {
    window.print();
  };

  // Flatten equipment bookings
  const equipmentBookings = equipments.flatMap((eq) =>
    (eq.bookings || []).map((b: any) => ({
      ...b,
      resourceName: eq.name,
      resourceCode: eq.code,
      resourceCategory: eq.category,
      type: "EQUIPAMENTO",
    }))
  );

  const formattedSpaceBookings = spaceBookings.map((sb) => ({
    ...sb,
    resourceName: sb.space?.name,
    resourceCode: sb.space?.code || "-",
    resourceCategory: sb.space?.category,
    type: "ESPACO",
  }));

  const allBookings = [...equipmentBookings, ...formattedSpaceBookings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = allBookings.filter((item) => {
    if (filterType === "EQUIPAMENTO") return item.type === "EQUIPAMENTO";
    if (filterType === "ESPACO") return item.type === "ESPACO";
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center space-x-2">
          <Link href="/imobilizados">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
              <FileSpreadsheet className="h-7 w-7 text-blue-600" />
              Relatório Consolidado de Reservas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Histórico unificado de uso e ocupação de Equipamentos e Espaços Pedagógicos.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePrint} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs">
            <Printer className="mr-1.5 h-4 w-4" />
            Imprimir Relatório
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h2 className="text-lg font-bold">EEEP PROFESSOR LUÍS FELIPE</h2>
        <p className="text-xs text-gray-600">Relatório Geral de Ocupação de Equipamentos e Espaços Escolares</p>
        <p className="text-[10px] text-gray-500 font-mono mt-1">
          Emitido em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>

      {/* Filters (screen only) */}
      <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-wrap gap-2 items-center print:hidden">
        <span className="text-xs font-bold text-slate-700 mr-2">Filtrar por Recurso:</span>
        <Button
          size="sm"
          variant={filterType === "TODOS" ? "default" : "outline"}
          onClick={() => setFilterType("TODOS")}
          className={`h-8 text-xs font-semibold ${filterType === "TODOS" ? "bg-blue-800 text-white" : ""}`}
        >
          Todos ({allBookings.length})
        </Button>
        <Button
          size="sm"
          variant={filterType === "EQUIPAMENTO" ? "default" : "outline"}
          onClick={() => setFilterType("EQUIPAMENTO")}
          className={`h-8 text-xs font-semibold ${filterType === "EQUIPAMENTO" ? "bg-blue-800 text-white" : ""}`}
        >
          Equipamentos ({equipmentBookings.length})
        </Button>
        <Button
          size="sm"
          variant={filterType === "ESPACO" ? "default" : "outline"}
          onClick={() => setFilterType("ESPACO")}
          className={`h-8 text-xs font-semibold ${filterType === "ESPACO" ? "bg-blue-800 text-white" : ""}`}
        >
          Espaços / Labs ({formattedSpaceBookings.length})
        </Button>
      </div>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Recurso / Equipamento</th>
                  <th className="p-3">Horário</th>
                  <th className="p-3">Turma / Solicitante</th>
                  <th className="p-3">Finalidade</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Nenhum registro de reserva encontrado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono">
                        {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="p-3">
                        <Badge className={
                          item.type === "ESPACO" ? "bg-purple-100 text-purple-800 text-[10px]" : "bg-blue-100 text-blue-800 text-[10px]"
                        }>
                          {item.type === "ESPACO" ? "Espaço" : "Equipamento"}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {item.resourceName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {item.resourceCategory} {item.resourceCode ? `• ${item.resourceCode}` : ""}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-blue-900">
                        {item.classNumber}ª Aula
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{item.operator?.name}</div>
                        <div className="text-[10px] text-slate-500">{item.classGroupName || "Geral"}</div>
                      </td>
                      <td className="p-3 max-w-xs truncate">
                        {item.purpose || "-"}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-bold text-[11px] ${
                          item.status === "DEVOLVIDO" || item.status === "CONFIRMADO" ? "text-emerald-700" : "text-amber-700"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
