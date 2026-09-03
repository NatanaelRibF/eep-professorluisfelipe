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
  BookOpen,
  Sun,
  Moon,
  Sunrise,
  Users,
  Award,
  FileText,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const EVENT_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; label: string; badgeColor: string }> = {
  BIMESTRE: { bg: "bg-blue-50/80", border: "border-blue-200", text: "text-blue-900", label: "Início/Fim Bimestre", badgeColor: "bg-blue-100 text-blue-800 border-blue-300" },
  FERIADO: { bg: "bg-red-50/80", border: "border-red-200", text: "text-red-900", label: "Feriado Oficial", badgeColor: "bg-red-100 text-red-800 border-red-300" },
  RECESSO: { bg: "bg-amber-50/80", border: "border-amber-200", text: "text-amber-900", label: "Recesso Escolar", badgeColor: "bg-amber-100 text-amber-800 border-amber-300" },
  CONSELHO: { bg: "bg-purple-50/80", border: "border-purple-200", text: "text-purple-900", label: "Conselho de Turma (PDT)", badgeColor: "bg-purple-100 text-purple-800 border-purple-300" },
  SABADO_LETIVO: { bg: "bg-emerald-50/80", border: "border-emerald-200", text: "text-emerald-900", label: "Sábado Letivo", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  EVENTO: { bg: "bg-teal-50/80", border: "border-teal-200", text: "text-teal-900", label: "Evento Escolar", badgeColor: "bg-teal-100 text-teal-800 border-teal-300" },
  PROVA: { bg: "bg-indigo-50/80", border: "border-indigo-200", text: "text-indigo-900", label: "Avaliações / Simulados", badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300" },
};

// Quadro Oficial dos 200 Dias Letivos 2026 da SEDUC CE
const DIAS_LETIVOS_MESES = [
  { mes: "Fevereiro", letivos: 18, totalDias: 28, obs: "Início do ano letivo (02/02)" },
  { mes: "Março", letivos: 21, totalDias: 31, obs: "Feriados: São José (19) e Data Magna (25)" },
  { mes: "Abril", letivos: 20, totalDias: 30, obs: "Fim do 1º Bimestre & Conselho (30/04)" },
  { mes: "Maio", letivos: 21, totalDias: 31, obs: "Início 2º Bimestre (04/05)" },
  { mes: "Junho", letivos: 21, totalDias: 30, obs: "Fim do 2º Bimestre & Conselho (30/06)" },
  { mes: "Julho", letivos: 0, totalDias: 31, obs: "Férias Escolares / Recesso Docente" },
  { mes: "Agosto", letivos: 21, totalDias: 31, obs: "Início 3º Bimestre (03/08) & Início Estágio 3º EM" },
  { mes: "Setembro", letivos: 21, totalDias: 30, obs: "Fim do 3º Bimestre & Conselho (30/09)" },
  { mes: "Outubro", letivos: 21, totalDias: 31, obs: "Início 4º Bimestre (01/10)" },
  { mes: "Novembro", letivos: 20, totalDias: 30, obs: "Avaliação Oficial SPAECE" },
  { mes: "Dezembro", letivos: 16, totalDias: 31, obs: "Fim do 4º Bimestre (18/12) & Recuperação Final" },
];

const BIMESTRES_INFO = [
  {
    bimestre: "1º Bimestre",
    periodo: "02/02/2026 a 30/04/2026",
    diasLetivos: 51,
    conselho: "30/04/2026",
    entregaResultados: "08/05/2026",
    cor: "border-l-blue-600 bg-blue-50/40",
  },
  {
    bimestre: "2º Bimestre",
    periodo: "04/05/2026 a 30/06/2026",
    diasLetivos: 50,
    conselho: "30/06/2026",
    entregaResultados: "07/08/2026",
    cor: "border-l-teal-600 bg-teal-50/40",
  },
  {
    bimestre: "3º Bimestre",
    periodo: "03/08/2026 a 30/09/2026",
    diasLetivos: 50,
    conselho: "30/09/2026",
    entregaResultados: "09/10/2026",
    cor: "border-l-amber-600 bg-amber-50/40",
  },
  {
    bimestre: "4º Bimestre",
    periodo: "01/10/2026 a 18/12/2026",
    diasLetivos: 49,
    conselho: "18/12/2026",
    entregaResultados: "22/12/2026",
    cor: "border-l-purple-600 bg-purple-50/40",
  },
];

const TURNOS_INFO = [
  {
    turno: "Tempo Integral (EEEP)",
    icone: Sun,
    horario: "07:30 às 17:00",
    cor: "text-amber-600 bg-amber-50 border-amber-200",
    tempos: "9 aulas de 50min",
    detalhes: [
      "07:30 - Acolhimento e Café da Manhã",
      "07:50 às 12:00 - 5 tempos de aula matutinos com intervalo de lanche às 09:30",
      "12:00 às 13:20 - Almoço Escolar & Descanso",
      "13:20 às 16:40 - 4 tempos de aula vespertinos com lanche da tarde às 15:00",
      "16:40 às 17:00 - Atividades complementares, mentoria PDT e saída",
    ],
  },
  {
    turno: "Turno Regular Manhã",
    icone: Sunrise,
    horario: "07:30 às 11:50",
    cor: "text-blue-600 bg-blue-50 border-blue-200",
    tempos: "5 tempos de 50min",
    detalhes: [
      "07:30 - Entrada e café dos alunos",
      "07:50 às 11:50 - Aulas do turno matutino com recreio às 09:30",
    ],
  },
  {
    turno: "Turno Regular Tarde",
    icone: Sun,
    horario: "13:00 às 17:20",
    cor: "text-orange-600 bg-orange-50 border-orange-200",
    tempos: "5 tempos de 50min",
    detalhes: [
      "13:00 - Entrada e acolhimento",
      "13:10 às 17:20 - Aulas do turno vespertino com recreio às 15:00",
    ],
  },
  {
    turno: "Turno Regular Noite",
    icone: Moon,
    horario: "18:30 às 22:00",
    cor: "text-indigo-600 bg-indigo-50 border-indigo-200",
    tempos: "4 tempos de 50min",
    detalhes: [
      "18:30 - Entrada e lanche",
      "18:45 às 22:00 - Aulas do turno noturno com intervalo às 20:15",
    ],
  },
];

const MESES_NOMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

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
  const [activeTab, setActiveTab] = useState("ESTRUTURA");
  const [selectedMonth, setSelectedMonth] = useState<number>(2); // Fevereiro (index 2)
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
        description: description.trim() || undefined,
        type,
        startDate,
        endDate: endDate || undefined,
        bimester: bimester ? Number(bimester) : undefined,
        isNonSchoolDay,
      });

      if (res.success) {
        toast.success("Evento adicionado ao calendário!");
        setIsNewEventOpen(false);
        setTitle("");
        setDescription("");
        setEndDate("");
        // Reload events
        const reload = await getSchoolEvents();
        if (reload.success) {
          setEvents(reload.events || []);
          if (reload.stats) setStats(reload.stats);
        }
      } else {
        toast.error(res.error || "Erro ao criar evento.");
      }
    } catch (e) {
      toast.error("Erro ao salvar evento.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este evento do calendário?")) return;
    try {
      const res = await deleteSchoolEvent(id);
      if (res.success) {
        toast.success("Evento removido com sucesso!");
        setEvents(events.filter((e) => e.id !== id));
      } else {
        toast.error(res.error || "Erro ao excluir evento.");
      }
    } catch (e) {
      toast.error("Erro ao excluir.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Compute month days for the interactive month grid
  const getDaysInMonth = (year: number, month1Indexed: number) => {
    const daysInMonth = new Date(year, month1Indexed, 0).getDate();
    const firstDayOfWeek = new Date(year, month1Indexed - 1, 1).getDay(); // 0 = Sunday
    return { daysInMonth, firstDayOfWeek };
  };

  const currentMonthData = getDaysInMonth(2026, selectedMonth);
  const monthEvents = events.filter((e) => {
    if (!e.startDate) return false;
    const evDate = new Date(e.startDate);
    return evDate.getUTCFullYear() === 2026 && evDate.getUTCMonth() + 1 === selectedMonth;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-blue-700" />
            Calendário do Ano Letivo 2026
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            EEEP Professor Luís Felipe • SEDUC Ceará • 200 Dias Letivos • Turnos, Conselhos e Feriados Oficiais
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial h-11 text-xs sm:text-sm font-semibold border-slate-300 hover:bg-slate-50 shadow-xs"
          >
            <Printer className="mr-2 h-4 w-4 text-blue-800" />
            Imprimir Calendário
          </Button>

          <Button
            onClick={() => setIsNewEventOpen(true)}
            className="flex-1 sm:flex-initial h-11 text-xs sm:text-sm font-bold bg-blue-800 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/70 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Total de Dias Letivos</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-950 mt-1">200</h3>
              <p className="text-[10px] text-slate-500 font-semibold">Garantia LDB 9.394/96</p>
            </div>
            <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-purple-50/70 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Bimestres Letivos</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-950 mt-1">4</h3>
              <p className="text-[10px] text-slate-500 font-semibold">4 Conselhos de Turma (PDT)</p>
            </div>
            <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-red-50/70 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Feriados & Recessos</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-red-900 mt-1">{stats?.holidaysCount || 12}</h3>
              <p className="text-[10px] text-slate-500 font-semibold">+ 31 dias férias em Julho</p>
            </div>
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-teal-50/70 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Eventos & Feiras</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-teal-950 mt-1">{stats?.eventsCount || 8}</h3>
              <p className="text-[10px] text-slate-500 font-semibold">Ceará Científico, SPAECE, etc.</p>
            </div>
            <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 print:hidden">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1 bg-slate-100/90 rounded-xl">
          <TabsTrigger value="ESTRUTURA" className="text-xs font-bold py-2.5">
            🏛️ Estrutura & Horários
          </TabsTrigger>
          <TabsTrigger value="EVENTOS" className="text-xs font-bold py-2.5">
            📋 Linha do Tempo ({events.length})
          </TabsTrigger>
          <TabsTrigger value="MENSAL" className="text-xs font-bold py-2.5">
            🗓️ Visão Mensal (Grid)
          </TabsTrigger>
          <TabsTrigger value="IMPRESSAO" className="text-xs font-bold py-2.5">
            🖨️ Documento Oficial
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ESTRUTURA DO ANO LETIVO E HORÁRIOS */}
        <TabsContent value="ESTRUTURA" className="space-y-6">
          {/* Bimestres Cards */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              Quadro Oficial dos 4 Bimestres do Ano Letivo 2026
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {BIMESTRES_INFO.map((bim) => (
                <Card key={bim.bimestre} className={`border-l-4 ${bim.cor} shadow-xs`}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-black text-slate-900">{bim.bimestre}</CardTitle>
                      <Badge className="bg-blue-800 text-white text-[10px]">{bim.diasLetivos} Dias</Badge>
                    </div>
                    <CardDescription className="text-xs font-semibold text-slate-600 mt-1">
                      {bim.periodo}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                      <span className="text-slate-500 font-medium">Conselho de Turma:</span>
                      <strong className="text-purple-800">{bim.conselho}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Boletins / Família:</span>
                      <strong className="text-blue-900">{bim.entregaResultados}</strong>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tabela de 200 Dias Letivos */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-blue-700" />
                    Distribuição dos 200 Dias Letivos por Mês
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Garantia do cumprimento do mínimo de 200 dias de efetivo trabalho escolar e 800 horas anuais.
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-black text-xs self-start sm:self-auto px-3 py-1">
                  Total: 200 Dias Letivos
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3">Mês / Período</th>
                    <th className="px-4 py-3 text-center">Dias do Mês</th>
                    <th className="px-4 py-3 text-center">Dias Letivos</th>
                    <th className="px-4 py-3">Observações Pedagógicas / Feriados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DIAS_LETIVOS_MESES.map((m) => (
                    <tr key={m.mes} className={m.letivos === 0 ? "bg-amber-50/40" : "hover:bg-slate-50/60"}>
                      <td className="px-4 py-2.5 font-bold text-slate-900">{m.mes} 2026</td>
                      <td className="px-4 py-2.5 text-center text-slate-500 font-mono">{m.totalDias}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-black text-xs ${
                          m.letivos === 0
                            ? "bg-amber-100 text-amber-900 font-bold"
                            : "bg-blue-100 text-blue-900"
                        }`}>
                          {m.letivos} {m.letivos === 1 ? 'dia' : 'dias'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 font-medium">{m.obs}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="px-4 py-3">TOTAL GERAL ANUAL</td>
                    <td className="px-4 py-3 text-center font-mono">365 dias</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-1 rounded bg-blue-800 text-white font-extrabold text-xs">
                        200 Dias Letivos
                      </span>
                    </td>
                    <td className="px-4 py-3 text-blue-900">Ano Letivo Homologado SEDUC-CE</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Quadro de Horários dos Turnos */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-700" />
              Horários de Funcionamento e Turnos Escolares
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TURNOS_INFO.map((turno) => {
                const Icon = turno.icone;
                return (
                  <Card key={turno.turno} className="border-slate-200 shadow-xs">
                    <CardHeader className="p-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg border ${turno.cor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold text-slate-900">{turno.turno}</CardTitle>
                            <CardDescription className="text-xs font-semibold text-blue-800">
                              {turno.horario} • {turno.tempos}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {turno.detalhes.map((det, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{det}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LINHA DO TEMPO DE EVENTOS */}
        <TabsContent value="EVENTOS" className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { bim: 0, label: "Todos os Bimestres" },
                { bim: 1, label: "1º Bimestre" },
                { bim: 2, label: "2º Bimestre" },
                { bim: 3, label: "3º Bimestre" },
                { bim: 4, label: "4º Bimestre" },
              ].map((b) => (
                <button
                  key={b.bim}
                  onClick={() => handleFilter(b.bim, selectedType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedBimester === b.bim
                      ? "bg-blue-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-slate-600 hidden sm:inline">Tipo:</Label>
              <select
                value={selectedType}
                onChange={(e) => handleFilter(selectedBimester, e.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800"
              >
                <option value="TODOS">Todos os Tipos</option>
                <option value="BIMESTRE">Bimestres</option>
                <option value="FERIADO">Feriados</option>
                <option value="CONSELHO">Conselhos de Turma</option>
                <option value="RECESSO">Recessos</option>
                <option value="EVENTO">Eventos & Feiras</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {events.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-white rounded-xl border">
                Nenhum evento encontrado para o filtro selecionado.
              </div>
            ) : (
              events.map((ev) => {
                const meta = EVENT_TYPE_COLORS[ev.type] || {
                  bg: "bg-slate-50",
                  border: "border-slate-200",
                  text: "text-slate-800",
                  label: ev.type,
                  badgeColor: "bg-slate-100 text-slate-800",
                };
                const startFormatted = ev.startDate ? format(new Date(ev.startDate), 'dd/MM/yyyy') : '';
                const endFormatted = ev.endDate ? format(new Date(ev.endDate), 'dd/MM/yyyy') : '';

                return (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-xl border ${meta.border} ${meta.bg} flex flex-col justify-between space-y-3 transition-all hover:shadow-xs`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className={`${meta.badgeColor} font-bold text-[10px]`}>
                          {meta.label} {ev.bimester ? `• ${ev.bimester}º Bimestre` : ''}
                        </Badge>
                        {ev.isNonSchoolDay && (
                          <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                            Dia Não Letivo
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
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{startFormatted} {endFormatted ? `até ${endFormatted}` : ''}</span>
                      </div>

                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold p-1 hover:bg-white/60 rounded transition-colors"
                        title="Excluir evento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* TAB 3: VISÃO MENSAL INTERATIVA */}
        <TabsContent value="MENSAL" className="space-y-4">
          {/* Month Picker Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth((m) => Math.max(2, m - 1))}
              disabled={selectedMonth <= 2}
              className="h-9"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Mês Anterior
            </Button>

            <div className="text-center">
              <h3 className="text-base sm:text-lg font-black text-blue-900">
                {MESES_NOMES[selectedMonth - 1]} de 2026
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                {DIAS_LETIVOS_MESES.find(m => m.mes.toLowerCase() === MESES_NOMES[selectedMonth - 1].toLowerCase())?.letivos || 0} Dias Letivos
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth((m) => Math.min(12, m + 1))}
              disabled={selectedMonth >= 12}
              className="h-9"
            >
              Próximo Mês
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Interactive Calendar Grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, idx) => (
                <div key={d} className={`py-2 text-xs font-bold rounded-lg ${idx === 0 || idx === 6 ? "text-slate-400 bg-slate-50" : "text-blue-900 bg-blue-50/50"}`}>
                  {d}
                </div>
              ))}

              {/* Leading Empty Cells */}
              {Array.from({ length: currentMonthData.firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[56px] sm:min-h-[72px] rounded-lg bg-slate-50/40 border border-slate-100"></div>
              ))}

              {/* Day Cells */}
              {Array.from({ length: currentMonthData.daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = monthEvents.filter((e) => {
                  const d = new Date(e.startDate).getUTCDate();
                  return d === day;
                });
                const isHoliday = dayEvents.some((e) => e.type === "FERIADO" || e.isNonSchoolDay);
                const isCouncil = dayEvents.some((e) => e.type === "CONSELHO");

                return (
                  <div
                    key={`day-${day}`}
                    className={`min-h-[56px] sm:min-h-[72px] p-1.5 rounded-lg border flex flex-col justify-between transition-all ${
                      isHoliday
                        ? "bg-red-50/70 border-red-200 text-red-900"
                        : isCouncil
                        ? "bg-purple-50/70 border-purple-200 text-purple-900"
                        : dayEvents.length > 0
                        ? "bg-blue-50/70 border-blue-200 text-blue-900"
                        : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-black self-start">{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="text-[9px] font-bold px-1 py-0.5 rounded truncate text-left bg-white/90 shadow-2xs"
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold pt-4 border-t border-slate-100 text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block"></span>
                <span>Dia Letivo / Evento</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block"></span>
                <span>Feriado / Não Letivo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-100 border border-purple-300 inline-block"></span>
                <span>Conselho de Turma (PDT)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block"></span>
                <span>Férias Escolares (Julho)</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: DOCUMENTO OFICIAL PARA IMPRESSÃO */}
        <TabsContent value="IMPRESSAO" className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Abaixo está o modelo timbrado oficial do Calendário Escolar 2026 pronto para impressão ou geração de PDF.
            </p>
            <Button onClick={handlePrint} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-9">
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Imprimir Agora
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* TIMBRADO OFICIAL PARA IMPRESSÃO (Visível na impressão ou na aba de impressão) */}
      <div
        id="printable-calendar"
        className={`${activeTab === "IMPRESSAO" ? "block" : "hidden"} print:block bg-white p-6 sm:p-10 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6`}
      >
        {/* Cabeçalho Oficial do Governo do Estado do Ceará */}
        <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
          <p className="text-[11px] uppercase tracking-widest text-slate-600 font-bold">
            Governo do Estado do Ceará • Secretaria da Educação (SEDUC)
          </p>
          <p className="text-[10px] text-slate-500 font-medium uppercase">
            Coordenadoria Regional de Desenvolvimento da Educação — CREDE
          </p>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight pt-1">
            EEEP PROFESSOR LUÍS FELIPE
          </h2>
          <h3 className="text-sm sm:text-base font-bold text-blue-900">
            CALENDÁRIO ESCOLAR OFICIAL — ANO LETIVO 2026
          </h3>
          <p className="text-[11px] text-slate-600 font-semibold">
            Ensino Médio Integrado à Educação Profissional • 200 Dias Letivos • Tempo Integral
          </p>
        </div>

        {/* Resumo de Bimestres no Documento */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            1. Períodos e Bimestres Letivos
          </h4>
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
              <tr>
                <th className="p-2">Bimestre</th>
                <th className="p-2">Período de Realização</th>
                <th className="p-2 text-center">Dias Letivos</th>
                <th className="p-2">Conselho de Turma (PDT)</th>
                <th className="p-2">Entrega de Resultados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {BIMESTRES_INFO.map((b) => (
                <tr key={b.bimestre}>
                  <td className="p-2 font-bold text-slate-900">{b.bimestre}</td>
                  <td className="p-2 text-slate-700">{b.periodo}</td>
                  <td className="p-2 text-center font-bold">{b.diasLetivos} dias</td>
                  <td className="p-2 text-slate-800 font-semibold">{b.conselho}</td>
                  <td className="p-2 text-slate-700">{b.entregaResultados}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold border-t border-slate-300">
                <td className="p-2" colSpan={2}>TOTAL DE DIAS LETIVOS HOMOLOGADOS</td>
                <td className="p-2 text-center font-black text-blue-900">200 DIAS</td>
                <td className="p-2" colSpan={2}>Cumprimento integral da LDB 9.394/96</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quadro Mensal de Dias Letivos no Documento */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            2. Cômputo Mensal de Dias Letivos (Fevereiro a Dezembro de 2026)
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center text-xs">
            {DIAS_LETIVOS_MESES.map((m) => (
              <div key={m.mes} className="p-2 rounded border border-slate-200 bg-slate-50">
                <p className="font-bold text-slate-800 text-[11px]">{m.mes}</p>
                <p className="text-sm font-black text-blue-900 mt-0.5">{m.letivos} dias</p>
              </div>
            ))}
          </div>
        </div>

        {/* Horários Oficiais dos Turnos no Documento */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            3. Regime e Horário de Funcionamento dos Turnos
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <p className="font-bold text-slate-800">Tempo Integral (EEEP)</p>
              <p className="text-blue-900 font-black mt-1">07:30 às 17:00</p>
              <p className="text-[10px] text-slate-500 mt-0.5">9 tempos (Almoço 12h-13h20)</p>
            </div>
            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <p className="font-bold text-slate-800">Turno Manhã</p>
              <p className="text-blue-900 font-black mt-1">07:30 às 11:50</p>
              <p className="text-[10px] text-slate-500 mt-0.5">5 tempos de 50min</p>
            </div>
            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <p className="font-bold text-slate-800">Turno Tarde</p>
              <p className="text-blue-900 font-black mt-1">13:00 às 17:20</p>
              <p className="text-[10px] text-slate-500 mt-0.5">5 tempos de 50min</p>
            </div>
            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <p className="font-bold text-slate-800">Turno Noite</p>
              <p className="text-blue-900 font-black mt-1">18:30 às 22:00</p>
              <p className="text-[10px] text-slate-500 mt-0.5">4 tempos de 50min</p>
            </div>
          </div>
        </div>

        {/* Assinaturas Oficiais da Gestão Escolar */}
        <div className="pt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="border-t border-slate-800 mx-auto mb-1.5 w-40"></div>
            <p className="text-xs font-bold text-slate-900">Direção Geral</p>
            <p className="text-[10px] text-slate-500">EEEP Professor Luís Felipe</p>
          </div>
          <div>
            <div className="border-t border-slate-800 mx-auto mb-1.5 w-40"></div>
            <p className="text-xs font-bold text-slate-900">Coordenação Pedagógica</p>
            <p className="text-[10px] text-slate-500">EEEP Professor Luís Felipe</p>
          </div>
          <div>
            <div className="border-t border-slate-800 mx-auto mb-1.5 w-40"></div>
            <p className="text-xs font-bold text-slate-900">Secretaria Escolar</p>
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
          #printable-calendar, #printable-calendar * {
            visibility: visible;
          }
          #printable-calendar {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
          }
        }
      `}} />

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
