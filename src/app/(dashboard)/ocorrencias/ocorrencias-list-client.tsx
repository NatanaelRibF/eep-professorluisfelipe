'use client';

import { useState, useEffect, useCallback } from "react";
import { getOccurrences } from "@/actions/occurrence.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Loader2, Calendar, User, AlertTriangle, ShieldAlert } from "lucide-react";

export default function OcorrenciasListClient({ classes, occurrenceTypes }: { classes: any[], occurrenceTypes: any[] }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOccurrences({
        classGroupId: selectedClass || undefined,
        occurrenceTypeId: selectedType || undefined,
        severity: selectedSeverity || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(result.occurrences);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedType, selectedSeverity, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'LEVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'MODERADO': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'GRAVE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Card */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Turma</label>
          <select 
            className="w-full flex h-10 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
          >
            <option value="">Todas as Turmas</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo</label>
          <select 
            className="w-full flex h-10 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            value={selectedType} 
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="">Todos os Tipos</option>
            {occurrenceTypes.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gravidade</label>
          <select 
            className="w-full flex h-10 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            value={selectedSeverity} 
            onChange={e => setSelectedSeverity(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="LEVE">Leve</option>
            <option value="MODERADO">Moderado</option>
            <option value="GRAVE">Grave</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Data Inicial</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Data Final</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10" />
        </div>
        <Button onClick={loadData} className="w-full h-10 bg-blue-800 hover:bg-blue-700 font-semibold shadow-sm">
          <Search className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
      </div>

      {/* Results Container */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center p-12 bg-white rounded-xl border">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed">
            <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            Nenhuma ocorrência encontrada com os filtros selecionados.
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="block md:hidden space-y-3">
              {data.map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.enrollment?.student?.name}</h4>
                      <p className="text-xs text-slate-500">{item.enrollment?.classGroup?.name || "Sem turma"}</p>
                    </div>
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${getSeverityColor(item.occurrenceType?.severity)}`}>
                      {item.occurrenceType?.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-amber-900 bg-amber-50/80 p-2 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{item.occurrenceType?.name}</span>
                  </div>

                  {item.description && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Fatos:</p>
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {item.actionTaken && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Providência:</p>
                      <p className="text-xs text-slate-700 bg-blue-50/50 p-2 rounded-lg border border-blue-100 mt-0.5">
                        {item.actionTaken}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <User className="w-3 h-3 text-slate-400" />
                      {item.operator?.name || "Operador"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 border-b">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Data</th>
                    <th className="px-5 py-3.5 font-semibold">Aluno</th>
                    <th className="px-5 py-3.5 font-semibold">Tipo & Gravidade</th>
                    <th className="px-5 py-3.5 font-semibold">Descrição</th>
                    <th className="px-5 py-3.5 font-semibold">Medida / Ação Tomada</th>
                    <th className="px-5 py-3.5 font-semibold">Registrado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                        {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{item.enrollment?.student?.name}</div>
                        <div className="text-xs text-slate-500">{item.enrollment?.classGroup?.name}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900">{item.occurrenceType?.name}</div>
                        <span className={`inline-block px-2 py-0.5 mt-0.5 text-xs font-semibold rounded-full border ${getSeverityColor(item.occurrenceType?.severity)}`}>
                          {item.occurrenceType?.severity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={item.description}>
                        {item.description || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={item.actionTaken}>
                        {item.actionTaken || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {item.operator?.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
