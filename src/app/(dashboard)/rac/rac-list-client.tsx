'use client';

import { useState, useEffect, useCallback } from "react";
import { getRACs } from "@/actions/rac.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Loader2 } from "lucide-react";

export default function RacListClient({ classes, racTypes }: { classes: any[], racTypes: any[] }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRACs({
        classGroupId: selectedClass || undefined,
        racTypeId: selectedType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(result.racs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedType, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'LEVE': return 'bg-green-100 text-green-700 border-green-200';
      case 'MODERADO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'GRAVE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Turma</label>
          <select 
            className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          >
            <option value="">Todas as Turmas</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de RAC</label>
          <select 
            className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedType} onChange={e => setSelectedType(e.target.value)}
          >
            <option value="">Todos os Tipos</option>
            {racTypes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data Inicial</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data Final</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <Button onClick={loadData} variant="outline" className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum registro RAC encontrado com os filtros selecionados.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Aluno</th>
                <th className="px-6 py-4 font-semibold">Tipo & Gravidade</th>
                <th className="px-6 py-4 font-semibold">Descrição</th>
                <th className="px-6 py-4 font-semibold">Registrado por</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.enrollment?.student?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.racType?.name}</div>
                    <span className={`inline-block px-2 py-1 mt-1 text-xs font-semibold rounded-full border ${getSeverityColor(item.racType?.severity)}`}>
                      {item.racType?.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={item.description}>
                    {item.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.operator?.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
