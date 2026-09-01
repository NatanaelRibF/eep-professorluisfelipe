"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Clock, 
  Calendar, 
  UserCheck, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  FileText,
  School,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cancelStudentExitPass, getStudentExitPasses } from "@/actions/liberacao.actions";
import { toast } from "sonner";
import { format } from "date-fns";

export default function LiberacaoClient({
  initialPasses,
  classes,
}: {
  initialPasses: any[];
  classes: any[];
}) {
  const [passes, setPasses] = useState(initialPasses);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("todas");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [loading, setLoading] = useState(false);

  // Print Pass Modal
  const [printPass, setPrintPass] = useState<any | null>(null);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const res = await getStudentExitPasses({
        classGroupId: selectedClass,
        date: selectedDate || undefined,
        status: selectedStatus,
        search: search || undefined,
      });
      if (res.success) {
        setPasses(res.passes || []);
      }
    } catch (error) {
      toast.error("Erro ao filtrar liberações.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPass = async (id: string) => {
    if (!confirm("Deseja realmente cancelar esta autorização de saída?")) return;
    try {
      const res = await cancelStudentExitPass(id);
      if (res.success) {
        toast.success("Liberação cancelada com sucesso.");
        setPasses(prev => prev.map(p => p.id === id ? { ...p, status: 'CANCELADO' } : p));
      } else {
        toast.error("Erro ao cancelar liberação.");
      }
    } catch (e) {
      toast.error("Erro ao cancelar liberação.");
    }
  };

  const handlePrintModal = (pass: any) => {
    setPrintPass(pass);
  };

  const triggerPrint = () => {
    window.print();
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const passesToday = passes.filter(p => {
    const pDate = p.date ? format(new Date(p.date), 'yyyy-MM-dd') : '';
    return pDate === todayStr && p.status === 'LIBERADO';
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <LogOut className="h-7 w-7 text-blue-600 rotate-180" />
            Liberação de Alunos & Passes de Saída
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Controle oficial de saídas antecipadas, entradas tardias e emissão de passes de portaria.
          </p>
        </div>

        <Link href="/liberacao/novo">
          <Button className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10 shadow-sm w-full sm:w-auto">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Liberação de Aluno
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Liberações Hoje</p>
              <h3 className="text-2xl font-bold text-blue-900 mt-1">{passesToday.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Saídas Autorizadas (Total)</p>
              <h3 className="text-2xl font-bold text-emerald-800 mt-1">
                {passes.filter(p => p.status === 'LIBERADO').length}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Turmas Atendidas</p>
              <h3 className="text-2xl font-bold text-purple-900 mt-1">
                {new Set(passes.map(p => p.student?.enrollments?.[0]?.classGroup?.name).filter(Boolean)).size}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
              <School className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Buscar por Aluno / Motivo</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Nome, matrícula, motivo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Turma</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas as Turmas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Data da Saída</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleFilter}
                disabled={loading}
                className="w-full h-10 bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passes List (Table & Mobile Cards) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {passes.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhuma liberação de aluno encontrada com os filtros atuais.
            </div>
          ) : (
            passes.map((pass) => {
              const currentClass = pass.student?.enrollments?.[0]?.classGroup?.name || "Sem Turma";
              const isCancelled = pass.status === "CANCELADO";

              return (
                <div key={pass.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                        {pass.student?.photoUrl ? (
                          <img src={pass.student.photoUrl} alt={pass.student.name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{pass.student?.name?.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{pass.student?.name}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{currentClass} • Mat: {pass.student?.registrationNumber}</p>
                      </div>
                    </div>
                    <Badge variant={isCancelled ? "secondary" : "default"} className={isCancelled ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-800 border-transparent"}>
                      {isCancelled ? "Cancelado" : "Liberado"}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1 text-slate-700">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Horário: <strong>{pass.time}</strong></span>
                      <span>{pass.date ? format(new Date(pass.date), 'dd/MM/yyyy') : ''}</span>
                    </div>
                    <div>Motivo: <span className="font-medium text-slate-900">{pass.reason}</span></div>
                    <div>Autorizado por: <span className="font-medium text-slate-900">{pass.authorizedBy}</span></div>
                    {pass.accompaniedBy && <div>Acompanhado por: <span className="font-medium text-slate-900">{pass.accompaniedBy}</span></div>}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {!isCancelled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintModal(pass)}
                        className="text-xs h-8 text-blue-800 border-blue-200 hover:bg-blue-50"
                      >
                        <Printer className="mr-1.5 h-3.5 w-3.5" />
                        Imprimir Passe
                      </Button>
                    )}
                    {!isCancelled && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancelPass(pass.id)}
                        className="text-xs h-8 text-red-600 hover:bg-red-50"
                      >
                        Cancelar
                      </Button>
                    )}
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
                <th className="py-3 px-3">Turma</th>
                <th className="py-3 px-3">Data & Horário</th>
                <th className="py-3 px-4">Motivo da Saída</th>
                <th className="py-3 px-4">Autorização & Responsável</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {passes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhum registro de liberação de aluno encontrado.
                  </td>
                </tr>
              ) : (
                passes.map((pass) => {
                  const currentClass = pass.student?.enrollments?.[0]?.classGroup?.name || "Sem Turma";
                  const isCancelled = pass.status === "CANCELADO";

                  return (
                    <tr key={pass.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                            {pass.student?.photoUrl ? (
                              <img src={pass.student.photoUrl} alt={pass.student.name} className="h-full w-full object-cover" />
                            ) : (
                              <span>{pass.student?.name?.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{pass.student?.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">Mat: {pass.student?.registrationNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {currentClass}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{pass.time}</div>
                        <div className="text-[11px] text-slate-500">
                          {pass.date ? format(new Date(pass.date), 'dd/MM/yyyy') : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate" title={pass.reason}>
                        <span className="font-medium text-slate-800">{pass.reason}</span>
                        {pass.observation && (
                          <div className="text-[11px] text-slate-400 truncate">{pass.observation}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{pass.authorizedBy}</div>
                        {pass.guardianContact && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {pass.guardianContact}
                          </div>
                        )}
                        {pass.accompaniedBy && (
                          <div className="text-[11px] text-emerald-700">Acomp: {pass.accompaniedBy}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge 
                          variant={isCancelled ? "secondary" : "default"} 
                          className={isCancelled ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-800 border-transparent font-bold text-[11px]"}
                        >
                          {isCancelled ? "Cancelado" : "Liberado"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCancelled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintModal(pass)}
                              className="h-8 text-xs font-semibold text-blue-800 border-blue-200 hover:bg-blue-50"
                            >
                              <Printer className="w-3.5 h-3.5 mr-1" />
                              Passe
                            </Button>
                          )}
                          {!isCancelled && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelPass(pass.id)}
                              className="h-8 text-xs text-red-600 hover:bg-red-50"
                            >
                              Cancelar
                            </Button>
                          )}
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

      {/* PRINT PASSE DE SAÍDA MODAL */}
      <Dialog open={!!printPass} onOpenChange={(open) => !open && setPrintPass(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white">
          <div className="p-6 space-y-4 print:p-0">
            {/* Printable Pass Layout */}
            <div className="border-2 border-slate-800 p-6 rounded-xl space-y-4 bg-white text-slate-900">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600">Governo do Estado do Ceará • SEDUC</p>
                <h2 className="text-base font-extrabold uppercase tracking-tight">EEEP Professor Luís Felipe</h2>
                <h3 className="text-xs font-bold text-blue-900 mt-0.5 bg-blue-50 py-1 rounded">
                  PASSE OFICIAL DE LIBERAÇÃO DE ESTUDANTE (PORTARIA)
                </h3>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Estudante:</span>
                  <span className="font-bold text-sm">{printPass?.student?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Matrícula / Turma:</span>
                  <span className="font-semibold">{printPass?.student?.registrationNumber} • {printPass?.student?.enrollments?.[0]?.classGroup?.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Data da Saída:</span>
                  <span className="font-bold">{printPass?.date ? format(new Date(printPass.date), 'dd/MM/yyyy') : ''}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Horário Autorizado:</span>
                  <span className="font-bold text-sm text-blue-900">{printPass?.time}</span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Motivo Declarado:</span>
                  <span className="font-medium">{printPass?.reason}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Autorizado por:</span>
                  <span className="font-semibold">{printPass?.authorizedBy} {printPass?.guardianContact ? `(${printPass.guardianContact})` : ''}</span>
                </div>
                {printPass?.accompaniedBy && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Acompanhante / Quem Retirou:</span>
                    <span className="font-medium">{printPass.accompaniedBy}</span>
                  </div>
                )}
                {printPass?.observation && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Observação:</span>
                    <span className="text-slate-600">{printPass.observation}</span>
                  </div>
                )}
              </div>

              {/* Signature Lines */}
              <div className="pt-6 grid grid-cols-3 gap-2 text-center text-[10px] border-t border-slate-300">
                <div>
                  <div className="border-t border-slate-800 mx-auto mb-1"></div>
                  <span className="font-bold">Responsável</span>
                </div>
                <div>
                  <div className="border-t border-slate-800 mx-auto mb-1"></div>
                  <span className="font-bold">Coordenação / Direção</span>
                </div>
                <div>
                  <div className="border-t border-slate-800 mx-auto mb-1"></div>
                  <span className="font-bold">Visto Portaria</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t flex flex-row items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => setPrintPass(null)} className="text-xs">
              Fechar
            </Button>
            <Button onClick={triggerPrint} className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs h-9 shadow-sm">
              <Printer className="mr-1.5 h-4 w-4" />
              Imprimir Passe de Portaria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
