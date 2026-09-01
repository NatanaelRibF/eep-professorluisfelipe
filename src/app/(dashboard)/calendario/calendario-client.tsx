"use client";

import { useState } from "react";
import { 
  CalendarDays, 
  Plus, 
  Filter, 
  Printer, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Loader2, 
  School,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { createSchoolEvent, deleteSchoolEvent, getSchoolEvents } from "@/actions/calendario.actions";
import { toast } from "sonner";
import { format } from "date-fns";

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  BIMESTRE: { bg: "bg-blue-100 border-blue-300", text: "text-blue-900", label: "Início/Fim Bimestre" },
  FERIADO: { bg: "bg-red-100 border-red-300", text: "text-red-900", label: "Feriado Oficial" },
  RECESSO: { bg: "bg-amber-100 border-amber-300", text: "text-amber-900", label: "Recesso Escolar" },
  CONSELHO: { bg: "bg-purple-100 border-purple-300", text: "text-purple-900", label: "Conselho de Turma" },
  SABADO_LETIVO: { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-900", label: "Sábado Letivo" },
  EVENTO: { bg: "bg-teal-100 border-teal-300", text: "text-teal-900", label: "Evento Escolar" },
  PROVA: { bg: "bg-indigo-100 border-indigo-300", text: "text-indigo-900", label: "Avaliações" },
};

export default function CalendarioClient({
  initialEvents,
  initialStats,
}: {
  initialEvents: any[];
  initialStats: any;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [stats, setStats] = useState(initialStats);
  const [selectedBimester, setSelectedBimester] = useState<number>(0);
  const [selectedType, setSelectedType] = useState("TODOS");
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("EVENTO");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [bimester, setBimester] = useState<number>(1);
  const [isNonSchoolDay, setIsNonSchoolDay] = useState(false);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFilter = async (bim: number, evType: string) => {
    setSelectedBimester(bim);
    setSelectedType(evType);
    setLoading(true);
    try {
      const res = await getSchoolEvents({
        bimester: bim,
        type: evType,
      });
      if (res.success) {
        setEvents(res.events || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (e) {
      toast.error("Erro ao filtrar calendário.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) {
      toast.error("Preencha o título e a data do evento.");
      return;
    }

    setSaving(true);
    try {
      const res = await createSchoolEvent({
        title: title.trim(),
        type,
        startDate,
        endDate: endDate || undefined,
        bimester,
        isNonSchoolDay,
        description: description.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao salvar evento.");
        return;
      }

      toast.success("✅ Evento adicionado ao Calendário Letivo!");
      setIsNewEventOpen(false);
      setTitle("");
      setDescription("");
      setEndDate("");
      handleFilter(selectedBimester, selectedType);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar evento.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja remover este evento do calendário?")) return;
    try {
      const res = await deleteSchoolEvent(id);
      if (res.success) {
        toast.success("Evento removido.");
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (e) {
      toast.error("Erro ao remover evento.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-blue-600" />
            Calendário Letivo Oficial 2026
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Programação letiva da SEDUC Ceará, bimestres, feriados, recessos, conselhos de turma e eventos escolares.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm" className="text-xs h-10 border-slate-300">
            <Printer className="mr-1.5 h-4 w-4" />
            Imprimir Calendário
          </Button>
          <Button onClick={() => setIsNewEventOpen(true)} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10 shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Novo Evento / Feriado
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/60 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Dias Letivos Previstos</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">200 dias</h3>
            </div>
            <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
              <School className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-purple-50/60 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Conselhos de Turma</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-1">{stats?.councilsCount || 4}</h3>
            </div>
            <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-red-50/60 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Feriados & Recessos</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-red-900 mt-1">{stats?.holidaysCount || 0}</h3>
            </div>
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/60 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Eventos & Feiras</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{stats?.eventsCount || 0}</h3>
            </div>
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bimestres Switcher Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200">
        {[
          { bim: 0, label: "📅 Ano Letivo Completo 2026" },
          { bim: 1, label: "1º Bimestre (Fev - Abr)" },
          { bim: 2, label: "2º Bimestre (Mai - Jun)" },
          { bim: 3, label: "3º Bimestre (Ago - Set)" },
          { bim: 4, label: "4º Bimestre (Out - Dez)" },
        ].map((item) => (
          <button
            key={item.bim}
            onClick={() => handleFilter(item.bim, selectedType)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedBimester === item.bim
                ? "bg-blue-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Events Timeline / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock className="w-5 h-5 text-blue-600" />
          Eventos e Datas Importantes ({events.length} registros)
        </h3>

        {events.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Nenhum evento encontrado para o período selecionado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {events.map((ev) => {
              const meta = EVENT_TYPE_COLORS[ev.type] || { bg: "bg-slate-100 border-slate-200", text: "text-slate-800", label: ev.type };
              const startFormatted = ev.startDate ? format(new Date(ev.startDate), 'dd/MM/yyyy') : '';
              const endFormatted = ev.endDate ? format(new Date(ev.endDate), 'dd/MM/yyyy') : '';

              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border ${meta.bg} flex flex-col justify-between space-y-3 transition-all hover:shadow-sm`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="bg-white/80 text-slate-800 border-slate-300 font-bold text-[10px]">
                        {meta.label} {ev.bimester ? `• ${ev.bimester}º Bimestre` : ''}
                      </Badge>
                      {ev.isNonSchoolDay && (
                        <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                          Não Letivo
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm sm:text-base font-extrabold ${meta.text}`}>
                      {ev.title}
                    </h4>
                    {ev.description && (
                      <p className="text-xs text-slate-600">{ev.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-black/10 pt-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1 font-semibold">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>{startFormatted} {endFormatted ? `até ${endFormatted}` : ''}</span>
                    </div>

                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold p-1 hover:bg-white/50 rounded"
                      title="Excluir evento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NOVO EVENTO MODAL */}
      <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-blue-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Adicionar Evento ao Calendário Letivo
            </DialogTitle>
            <DialogDescription className="text-xs">
              Cadastre feriados, recessos, conselhos de classe ou eventos pedagógicos da escola.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEvent} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Título do Evento / Feriado *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Dia de São José, Conselho de Turma..."
                className="h-10 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Tipo de Evento</Label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    if (e.target.value === 'FERIADO' || e.target.value === 'RECESSO') {
                      setIsNonSchoolDay(true);
                    }
                  }}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FERIADO">Feriado Oficial</option>
                  <option value="RECESSO">Recesso Escolar</option>
                  <option value="CONSELHO">Conselho de Turma</option>
                  <option value="SABADO_LETIVO">Sábado Letivo</option>
                  <option value="EVENTO">Evento / Feira Escolar</option>
                  <option value="PROVA">Avaliações Bimestrais</option>
                  <option value="BIMESTRE">Início / Término de Bimestre</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Bimestre</Label>
                <select
                  value={bimester}
                  onChange={(e) => setBimester(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1º Bimestre</option>
                  <option value={2}>2º Bimestre</option>
                  <option value={3}>3º Bimestre</option>
                  <option value={4}>4º Bimestre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Data Inicial *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Data Final (Opcional)</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isNonSchoolDay"
                checked={isNonSchoolDay}
                onChange={(e) => setIsNonSchoolDay(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isNonSchoolDay" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Dia Não Letivo (Feriado, Recesso ou Paralisação)
              </label>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Descrição / Observações</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes adicionais..."
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewEventOpen(false)} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                Salvar Evento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
