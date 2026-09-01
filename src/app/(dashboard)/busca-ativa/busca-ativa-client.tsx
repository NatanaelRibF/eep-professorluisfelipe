"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  UserSearch, 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  Home, 
  Users, 
  Printer, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Send,
  Loader2,
  FileText,
  School,
  Sparkles,
  ChevronRight,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createBuscaAtivaAction, getBuscaAtivaData } from "@/actions/busca-ativa.actions";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BuscaAtivaClient({
  initialStudents,
  initialStats,
  classes,
}: {
  initialStudents: any[];
  initialStats: any;
  classes: any[];
}) {
  const [students, setStudents] = useState(initialStudents);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("todas");
  const [selectedRisk, setSelectedRisk] = useState("TODOS");
  const [minAbsences, setMinAbsences] = useState(3);
  const [loading, setLoading] = useState(false);

  // Contact Registration Modal
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<any | null>(null);
  const [contactType, setContactType] = useState("WHATSAPP");
  const [contactPerson, setContactPerson] = useState("");
  const [phoneUsed, setPhoneUsed] = useState("");
  const [summary, setSummary] = useState("");
  const [reasonForAbsence, setReasonForAbsence] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [actionStatus, setActionStatus] = useState("EM_ANDAMENTO");
  const [savingAction, setSavingAction] = useState(false);

  // Official Notification Print Modal
  const [notificationStudent, setNotificationStudent] = useState<any | null>(null);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const res = await getBuscaAtivaData({
        classGroupId: selectedClass,
        riskLevel: selectedRisk,
        search: search || undefined,
        minAbsences,
      });
      if (res.success) {
        setStudents(res.students || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (e) {
      toast.error("Erro ao filtrar dados de busca ativa.");
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (student: any) => {
    setSelectedStudentForAction(student);
    setContactPerson(student.guardianName || "");
    setPhoneUsed(student.guardianPhone || "");
    setSummary("");
    setReasonForAbsence("");
    setReturnDate("");
    setActionStatus("EM_ANDAMENTO");
  };

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAction || !summary.trim() || !contactPerson.trim()) {
      toast.error("Preencha o responsável contatado e o resumo da conversa.");
      return;
    }

    setSavingAction(true);
    try {
      const res = await createBuscaAtivaAction({
        studentId: selectedStudentForAction.studentId,
        contactType,
        contactPerson: contactPerson.trim(),
        phoneUsed: phoneUsed.trim() || undefined,
        summary: summary.trim(),
        reasonForAbsence: reasonForAbsence.trim() || undefined,
        returnDate: returnDate || undefined,
        status: actionStatus,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao salvar ação.");
        return;
      }

      toast.success("✅ Ação de Busca Ativa registrada com sucesso!");
      setSelectedStudentForAction(null);
      // Reload list
      handleFilter();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar ação de busca ativa.");
    } finally {
      setSavingAction(false);
    }
  };

  const triggerPrintNotification = () => {
    window.print();
  };

  const formatPhoneForWhatsapp = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <UserSearch className="h-7 w-7 text-amber-600" />
            Busca Ativa Escolar & Prevenção à Evasão
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Monitoramento de infrequência, contatos com famílias, visitas domiciliares e termos de comparecimento.
          </p>
        </div>

        <Link href="/frequencia">
          <Button variant="outline" size="sm" className="text-xs h-9">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
            Ir para Lançamento de Frequência
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-red-50/60 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Risco Crítico (10+ Faltas)</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-red-900 mt-1">{stats?.criticos || 0}</h3>
            </div>
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-amber-50/60 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Risco Médio (5 a 9)</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{stats?.medios || 0}</h3>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/60 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Alerta Inicial (3 a 4)</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">{stats?.alertas || 0}</h3>
            </div>
            <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
              <UserSearch className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/60 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Ações Registradas</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{stats?.actionsTaken || 0}</h3>
            </div>
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Turma (Busca Ativa por Turma)</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas as Turmas da Escola</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.shift === "MANHA" ? "Manhã" : cls.shift === "TARDE" ? "Tarde" : "Noite"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Nível de Risco</label>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos os Níveis de Risco</option>
                <option value="CRITICO">🔴 Risco Crítico (10+ Faltas)</option>
                <option value="MEDIO">🟠 Risco Médio (5 a 9 Faltas)</option>
                <option value="ALERTA">🟡 Alerta Inicial (3 a 4 Faltas)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Buscar por Aluno / Responsável</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Nome do aluno, matrícula, responsável..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleFilter}
                disabled={loading}
                className="w-full h-10 bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students in Active Search List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {students.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhum aluno em situação de risco de faltas encontrado para os filtros selecionados.
            </div>
          ) : (
            students.map((st) => {
              const riskBadgeClass = 
                st.riskLevel === 'CRITICO' ? 'bg-red-100 text-red-800 border-red-200' :
                st.riskLevel === 'MEDIO' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                'bg-blue-100 text-blue-900 border-blue-200';

              const cleanPhone = formatPhoneForWhatsapp(st.guardianPhone);

              return (
                <div key={st.enrollmentId} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                        {st.photoUrl ? (
                          <img src={st.photoUrl} alt={st.studentName} className="h-full w-full object-cover" />
                        ) : (
                          <span>{st.studentName?.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{st.studentName}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{st.className} • PDT: {st.pdtName}</p>
                      </div>
                    </div>
                    <Badge className={`${riskBadgeClass} font-bold text-[10px]`}>
                      {st.riskLevel === 'CRITICO' ? 'CRÍTICO' : st.riskLevel === 'MEDIO' ? 'MÉDIO' : 'ALERTA'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Total de Faltas</span>
                      <span className="font-bold text-base text-red-600">{st.totalAbsences} faltas</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Assiduidade</span>
                      <span className="font-bold text-base text-slate-800">{st.presenceRate}%</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-200 pt-1.5 mt-0.5 space-y-0.5">
                      <div>Responsável: <strong className="text-slate-900">{st.guardianName}</strong></div>
                      <div>Contato: <strong className="text-slate-900 font-mono">{st.guardianPhone}</strong></div>
                      {st.consecutiveAbsences > 0 && (
                        <div className="text-red-700 font-semibold">⚠️ {st.consecutiveAbsences} faltas consecutivas recentes</div>
                      )}
                    </div>
                  </div>

                  {st.latestAction && (
                    <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-2 text-xs text-blue-950 space-y-0.5">
                      <div className="font-bold flex items-center justify-between text-[11px]">
                        <span>Último Contato: {st.latestAction.contactType}</span>
                        <span>{format(new Date(st.latestAction.createdAt), 'dd/MM/yyyy')}</span>
                      </div>
                      <p className="text-slate-600 truncate">{st.latestAction.summary}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%2C+somos+da+EEEP+Professor+Lu%C3%ADs+Felipe.+Gostar%C3%ADamos+de+conversar+sobre+a+frequ%C3%AAncia+do+estudante+${encodeURIComponent(st.studentName)}.`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="sm" variant="outline" className="text-xs h-8 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                          <MessageSquare className="mr-1 h-3.5 w-3.5" />
                          WhatsApp
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNotificationStudent(st)}
                      className="text-xs h-8 text-blue-800 border-blue-200 hover:bg-blue-50"
                    >
                      <Printer className="mr-1 h-3.5 w-3.5" />
                      Notificação
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openActionModal(st)}
                      className="text-xs h-8 bg-blue-800 hover:bg-blue-700 text-white font-semibold shadow-sm"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Registrar Ação
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3 px-4">Estudante</th>
                <th className="py-3 px-3">Turma & PDT</th>
                <th className="py-3 px-3 text-center">Faltas Reais</th>
                <th className="py-3 px-3 text-center">Assiduidade</th>
                <th className="py-3 px-3 text-center">Nível de Risco</th>
                <th className="py-3 px-4">Responsável & Contato</th>
                <th className="py-3 px-3 text-center">Ações</th>
                <th className="py-3 px-4 text-right">Intervenção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhum aluno em situação de risco de infrequência encontrado.
                  </td>
                </tr>
              ) : (
                students.map((st) => {
                  const riskBadgeClass = 
                    st.riskLevel === 'CRITICO' ? 'bg-red-100 text-red-800 border-red-200' :
                    st.riskLevel === 'MEDIO' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                    'bg-blue-100 text-blue-900 border-blue-200';

                  const cleanPhone = formatPhoneForWhatsapp(st.guardianPhone);

                  return (
                    <tr key={st.enrollmentId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                            {st.photoUrl ? (
                              <img src={st.photoUrl} alt={st.studentName} className="h-full w-full object-cover" />
                            ) : (
                              <span>{st.studentName?.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{st.studentName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">Mat: {st.registrationNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{st.className}</div>
                        <div className="text-[11px] text-slate-500">PDT: {st.pdtName}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-extrabold text-base text-red-600">{st.totalAbsences}</span>
                        {st.consecutiveAbsences > 0 && (
                          <div className="text-[10px] text-red-700 font-semibold">{st.consecutiveAbsences} consec.</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-800">{st.presenceRate}%</span>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                          <div
                            className={`h-full ${st.presenceRate < 75 ? 'bg-red-500' : st.presenceRate < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${st.presenceRate}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge className={`${riskBadgeClass} font-bold text-[11px]`}>
                          {st.riskLevel === 'CRITICO' ? 'CRÍTICO' : st.riskLevel === 'MEDIO' ? 'MÉDIO' : 'ALERTA'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{st.guardianName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {st.guardianPhone}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-semibold text-slate-700">{st.actionsCount} contatos</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%2C+somos+da+EEEP+Professor+Lu%C3%ADs+Felipe.+Gostar%C3%ADamos+de+conversar+sobre+a+frequ%C3%AAncia+do+estudante+${encodeURIComponent(st.studentName)}.`}
                              target="_blank"
                              rel="noreferrer"
                              title="Conversar no WhatsApp"
                            >
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setNotificationStudent(st)}
                            title="Imprimir Notificação Oficial"
                            className="h-8 text-xs font-semibold text-blue-800 border-blue-200 hover:bg-blue-50"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Notificação
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openActionModal(st)}
                            className="h-8 text-xs bg-blue-800 hover:bg-blue-700 text-white font-semibold shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Ação
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRAR AÇÃO DE BUSCA ATIVA MODAL */}
      <Dialog open={!!selectedStudentForAction} onOpenChange={(open) => !open && setSelectedStudentForAction(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <UserSearch className="w-5 h-5 text-amber-600" />
              Registrar Ação de Busca Ativa
            </DialogTitle>
            <DialogDescription className="text-xs">
              Aluno: <strong>{selectedStudentForAction?.studentName}</strong> • Turma: <strong>{selectedStudentForAction?.className}</strong> ({selectedStudentForAction?.totalAbsences} faltas registradas)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAction} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Tipo de Contato / Ação</Label>
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="LIGACAO">Ligação Telefônica</option>
                  <option value="VISITA_DOMICILIAR">Visita Domiciliar</option>
                  <option value="REUNIAO_PRESENCIAL">Reunião Presencial na Escola</option>
                  <option value="CONSELHO_TUTELAR">Ofício ao Conselho Tutelar</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Status do Caso</Label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EM_ANDAMENTO">Em Andamento (Família Notificada)</option>
                  <option value="RETORNOU">Estudante Retornou às Aulas</option>
                  <option value="VISITA_NECESSARIA">Visita Domiciliar Necessária</option>
                  <option value="CONSELHO_TUTELAR">Encaminhado ao Conselho Tutelar</option>
                  <option value="TRANSFERIDO">Transferência / Desistência Formal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Responsável Contatado *</Label>
                <Input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Ex: Maria (Mãe)"
                  className="h-10 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Telefone Utilizado</Label>
                <Input
                  value={phoneUsed}
                  onChange={(e) => setPhoneUsed(e.target.value)}
                  placeholder="(88) 99999-9999"
                  className="h-10 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Motivo Declarado das Faltas</Label>
                <Input
                  value={reasonForAbsence}
                  onChange={(e) => setReasonForAbsence(e.target.value)}
                  placeholder="Ex: Problema de saúde, transporte..."
                  className="h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Previsão de Retorno às Aulas</Label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Resumo da Conversa / Providências *</Label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Descreva o que foi conversado com a família, justificativas e compromissos assumidos..."
                rows={3}
                className="text-xs sm:text-sm"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedStudentForAction(null)} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" disabled={savingAction} className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs shadow-sm">
                {savingAction ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Salvar Ação de Busca Ativa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* NOTIFICAÇÃO OFICIAL DE BUSCA ATIVA (PRINT MODAL) */}
      <Dialog open={!!notificationStudent} onOpenChange={(open) => !open && setNotificationStudent(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white">
          <div className="p-6 sm:p-8 space-y-6 print:p-0">
            {/* Official Letterhead */}
            <div className="text-center border-b-2 border-slate-800 pb-4">
              <p className="text-xs uppercase font-bold tracking-widest text-slate-600">Governo do Estado do Ceará • Secretaria da Educação (SEDUC)</p>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900 mt-1">EEEP Professor Luís Felipe</h2>
              <h3 className="text-sm font-bold text-blue-900 mt-1 bg-blue-50 py-1 rounded">
                NOTIFICAÇÃO OFICIAL DE INFREQUÊNCIA ESCOLAR • BUSCA ATIVA
              </h3>
            </div>

            <div className="text-xs text-justify space-y-3 leading-relaxed text-slate-800">
              <p>
                Ao(À) Sr.(a) <strong>{notificationStudent?.guardianName || "Responsável Legal"}</strong>,
              </p>
              <p>
                Comunicamos que o(a) estudante <strong>{notificationStudent?.studentName}</strong>, regularmente matriculado(a) na turma <strong>{notificationStudent?.className}</strong> sob o código de matrícula <strong>{notificationStudent?.registrationNumber}</strong>, apresenta até a presente data um total acumulado de <strong className="text-red-700">{notificationStudent?.totalAbsences} faltas escolares</strong>, correspondendo a uma taxa de assiduidade de apenas <strong>{notificationStudent?.presenceRate}%</strong>.
              </p>
              <p>
                Em conformidade com a Lei de Diretrizes e Bases da Educação Nacional (Lei Federal nº 9.394/96) e com as diretrizes da Busca Ativa Escolar do Estado do Ceará, solicitamos o comparecimento urgente do responsável à sede da escola no prazo de <strong>48 horas</strong> a contar do recebimento desta notificação, a fim de regularizar a situação pedagógica e pactuar o plano de frequência do estudante.
              </p>
              <p className="text-[11px] text-slate-500 italic">
                Ressaltamos que a infrequência superior a 25% acarreta reprovação direta e o dever legal de notificação ao Conselho Tutelar e ao Ministério Público da Infância e Juventude.
              </p>
            </div>

            {/* Signature Lines */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs border-t border-slate-300">
              <div>
                <div className="border-t border-slate-800 mx-auto mb-1.5 w-48"></div>
                <span className="font-bold block">Assinatura do Pai / Mãe ou Responsável</span>
                <span className="text-[10px] text-slate-500 block">CPF: ______________________ Data: ___/___/2026</span>
              </div>
              <div>
                <div className="border-t border-slate-800 mx-auto mb-1.5 w-48"></div>
                <span className="font-bold block">Coordenação Pedagógica / Direção</span>
                <span className="text-[10px] text-slate-500 block">EEEP Professor Luís Felipe</span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t flex flex-row items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => setNotificationStudent(null)} className="text-xs">
              Fechar
            </Button>
            <Button onClick={triggerPrintNotification} className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs h-9 shadow-sm">
              <Printer className="mr-1.5 h-4 w-4" />
              Imprimir Notificação Oficial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
