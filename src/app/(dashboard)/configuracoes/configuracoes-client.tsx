"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2, BookOpen, FileText, AlertTriangle, Calendar, Check, Edit, Search, Power, RotateCcw } from "lucide-react";
import {
  createSubject,
  toggleSubjectStatus,
  createSchoolYear,
  updateSchoolYear,
  setCurrentSchoolYear,
} from "@/actions/class.actions";
import {
  createRACType,
  toggleRACTypeStatus,
  createOccurrenceType,
  toggleOccurrenceTypeStatus,
} from "@/actions/config.actions";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ConfiguracoesClient({
  subjects,
  racTypes,
  occurrenceTypes,
  schoolYears,
}: {
  subjects: any[];
  racTypes: any[];
  occurrenceTypes: any[];
  schoolYears: any[];
}) {
  const router = useRouter();

  // Subject Modal State
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectAbbr, setSubjectAbbr] = useState("");
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // RAC Type Modal State
  const [racOpen, setRacOpen] = useState(false);
  const [racName, setRacName] = useState("");
  const [racDesc, setRacDesc] = useState("");
  const [racSeverity, setRacSeverity] = useState("LEVE");
  const [racLoading, setRacLoading] = useState(false);
  const [racSearch, setRacSearch] = useState("");
  const [racFilter, setRacFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Occurrence Type Modal State
  const [occOpen, setOccOpen] = useState(false);
  const [occName, setOccName] = useState("");
  const [occDesc, setOccDesc] = useState("");
  const [occSeverity, setOccSeverity] = useState("LEVE");
  const [occLoading, setOccLoading] = useState(false);
  const [occSearch, setOccSearch] = useState("");
  const [occFilter, setOccFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Confirmation Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    type: "subject" | "rac" | "occurrence";
    id: string;
    name: string;
    currentStatus: boolean;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // School Year Create Modal State
  const [yearOpen, setYearOpen] = useState(false);
  const [newYear, setNewYear] = useState(new Date().getFullYear() + 1);
  const [yearStartDate, setYearStartDate] = useState(`${new Date().getFullYear() + 1}-02-01`);
  const [yearEndDate, setYearEndDate] = useState(`${new Date().getFullYear() + 1}-12-15`);
  const [yearIsCurrent, setYearIsCurrent] = useState(false);
  const [yearLoading, setYearLoading] = useState(false);

  // School Year Edit Modal State
  const [editYearOpen, setEditYearOpen] = useState(false);
  const [editingYearObj, setEditingYearObj] = useState<any>(null);
  const [editYearNumber, setEditYearNumber] = useState<number>(2026);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsCurrent, setEditIsCurrent] = useState(false);
  const [editYearLoading, setEditYearLoading] = useState(false);

  // Handlers
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    setSubjectLoading(true);
    try {
      await createSubject({ name: subjectName.trim(), abbreviation: subjectAbbr.trim() });
      toast.success("Disciplina cadastrada com sucesso!");
      setSubjectOpen(false);
      setSubjectName("");
      setSubjectAbbr("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar disciplina.");
    } finally {
      setSubjectLoading(false);
    }
  };

  const openConfirmDialog = (
    type: "subject" | "rac" | "occurrence",
    id: string,
    name: string,
    currentStatus: boolean
  ) => {
    setConfirmTarget({ type, id, name, currentStatus });
    setConfirmOpen(true);
  };

  const handleExecuteToggle = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      if (confirmTarget.type === "subject") {
        const res = await toggleSubjectStatus(confirmTarget.id);
        if (res.success) {
          toast.success(
            confirmTarget.currentStatus
              ? `Disciplina "${confirmTarget.name}" desativada com sucesso!`
              : `Disciplina "${confirmTarget.name}" reativada com sucesso!`
          );
        } else {
          toast.error(res.error || "Erro ao alterar status.");
        }
      } else if (confirmTarget.type === "rac") {
        const res = await toggleRACTypeStatus(confirmTarget.id);
        if (res.success) {
          toast.success(
            confirmTarget.currentStatus
              ? `Tipo de RAC "${confirmTarget.name}" desativado com sucesso!`
              : `Tipo de RAC "${confirmTarget.name}" reativado com sucesso!`
          );
        } else {
          toast.error(res.error || "Erro ao alterar status.");
        }
      } else if (confirmTarget.type === "occurrence") {
        const res = await toggleOccurrenceTypeStatus(confirmTarget.id);
        if (res.success) {
          toast.success(
            confirmTarget.currentStatus
              ? `Tipo de Ocorrência "${confirmTarget.name}" desativado com sucesso!`
              : `Tipo de Ocorrência "${confirmTarget.name}" reativado com sucesso!`
          );
        } else {
          toast.error(res.error || "Erro ao alterar status.");
        }
      }
      setConfirmOpen(false);
      setConfirmTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao alterar status.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCreateRACType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!racName.trim()) return;
    setRacLoading(true);
    try {
      await createRACType({ name: racName.trim(), description: racDesc.trim(), severity: racSeverity });
      toast.success("Tipo de RAC cadastrado com sucesso!");
      setRacOpen(false);
      setRacName("");
      setRacDesc("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar tipo de RAC.");
    } finally {
      setRacLoading(false);
    }
  };

  const handleCreateOccurrenceType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occName.trim()) return;
    setOccLoading(true);
    try {
      await createOccurrenceType({ name: occName.trim(), description: occDesc.trim(), severity: occSeverity });
      toast.success("Tipo de ocorrência cadastrado com sucesso!");
      setOccOpen(false);
      setOccName("");
      setOccDesc("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar tipo de ocorrência.");
    } finally {
      setOccLoading(false);
    }
  };

  const handleCreateSchoolYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear) return;
    setYearLoading(true);
    try {
      const res = await createSchoolYear({
        year: Number(newYear),
        startDate: yearStartDate,
        endDate: yearEndDate,
        isCurrent: yearIsCurrent,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao cadastrar ano letivo.");
        return;
      }

      toast.success(`Ano Letivo ${newYear} cadastrado com sucesso!`);
      setYearOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar ano letivo.");
    } finally {
      setYearLoading(false);
    }
  };

  const handleOpenEditSchoolYear = (yearObj: any) => {
    setEditingYearObj(yearObj);
    setEditYearNumber(yearObj.year);
    setEditStartDate(yearObj.startDate ? format(new Date(yearObj.startDate), "yyyy-MM-dd") : "");
    setEditEndDate(yearObj.endDate ? format(new Date(yearObj.endDate), "yyyy-MM-dd") : "");
    setEditIsCurrent(!!yearObj.isCurrent);
    setEditYearOpen(true);
  };

  const handleUpdateSchoolYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingYearObj) return;
    setEditYearLoading(true);
    try {
      const res = await updateSchoolYear(editingYearObj.id, {
        year: editYearNumber,
        startDate: editStartDate,
        endDate: editEndDate,
        isCurrent: editIsCurrent,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao atualizar ano letivo.");
        return;
      }

      toast.success(`Ano Letivo ${editYearNumber} atualizado com sucesso!`);
      setEditYearOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar.");
    } finally {
      setEditYearLoading(false);
    }
  };

  const handleSetCurrentYear = async (id: string, yearNumber: number) => {
    try {
      const res = await setCurrentSchoolYear(id);
      if (res.success) {
        toast.success(`Ano Letivo ${yearNumber} definido como atual!`);
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Erro ao definir ano letivo atual.");
    }
  };

  // Filtered Lists
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        (sub.abbreviation && sub.abbreviation.toLowerCase().includes(subjectSearch.toLowerCase()));
      const matchesFilter =
        subjectFilter === "ALL" ||
        (subjectFilter === "ACTIVE" && sub.isActive) ||
        (subjectFilter === "INACTIVE" && !sub.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [subjects, subjectSearch, subjectFilter]);

  const filteredRACTypes = useMemo(() => {
    return racTypes.filter((rac) => {
      const matchesSearch = rac.name.toLowerCase().includes(racSearch.toLowerCase());
      const matchesFilter =
        racFilter === "ALL" ||
        (racFilter === "ACTIVE" && rac.isActive) ||
        (racFilter === "INACTIVE" && !rac.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [racTypes, racSearch, racFilter]);

  const filteredOccTypes = useMemo(() => {
    return occurrenceTypes.filter((occ) => {
      const matchesSearch = occ.name.toLowerCase().includes(occSearch.toLowerCase());
      const matchesFilter =
        occFilter === "ALL" ||
        (occFilter === "ACTIVE" && occ.isActive) ||
        (occFilter === "INACTIVE" && !occ.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [occurrenceTypes, occSearch, occFilter]);

  const activeSubjectsCount = subjects.filter((s) => s.isActive).length;
  const inactiveSubjectsCount = subjects.filter((s) => !s.isActive).length;

  const activeRacCount = racTypes.filter((r) => r.isActive).length;
  const inactiveRacCount = racTypes.filter((r) => !r.isActive).length;

  const activeOccCount = occurrenceTypes.filter((o) => o.isActive).length;
  const inactiveOccCount = occurrenceTypes.filter((o) => !o.isActive).length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">Configurações do Sistema</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Gerencie disciplinas, categorias de RAC, ocorrências e calendário de anos letivos da escola.
        </p>
      </div>

      <Tabs defaultValue="disciplinas" className="w-full">
        <TabsList className="flex w-full overflow-x-auto justify-start border-b rounded-none h-12 p-0 space-x-4 sm:space-x-6">
          <TabsTrigger
            value="disciplinas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-900 py-3 px-1 text-xs sm:text-sm font-semibold whitespace-nowrap"
          >
            Disciplinas ({subjects.length})
          </TabsTrigger>
          <TabsTrigger
            value="rac"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-900 py-3 px-1 text-xs sm:text-sm font-semibold whitespace-nowrap"
          >
            Tipos de RAC ({racTypes.length})
          </TabsTrigger>
          <TabsTrigger
            value="ocorrencias"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-900 py-3 px-1 text-xs sm:text-sm font-semibold whitespace-nowrap"
          >
            Ocorrências ({occurrenceTypes.length})
          </TabsTrigger>
          <TabsTrigger
            value="ano-letivo"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-900 py-3 px-1 text-xs sm:text-sm font-semibold whitespace-nowrap"
          >
            Ano Letivo ({schoolYears.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. Disciplinas */}
        <TabsContent value="disciplinas" className="mt-4 sm:mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center text-blue-900">
                  <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                  Grade de Disciplinas ({activeSubjectsCount} ativas / {inactiveSubjectsCount} inativas)
                </CardTitle>
                <CardDescription className="text-xs">
                  Disciplinas da matriz curricular da escola. As matérias inativas permanecem arquivadas e podem ser reativadas a qualquer momento.
                </CardDescription>
              </div>

              <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-xs font-semibold h-10 w-full sm:w-auto">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Nova Disciplina
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleCreateSubject}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Nova Disciplina</DialogTitle>
                      <DialogDescription>Adicione uma matéria à grade curricular da EEEP.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="subName" className="text-xs font-semibold text-slate-700">Nome da Disciplina *</Label>
                        <Input
                          id="subName"
                          value={subjectName}
                          onChange={(e) => setSubjectName(e.target.value)}
                          placeholder="Ex: Desenvolvimento Web"
                          required
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="subAbbr" className="text-xs font-semibold text-slate-700">Sigla / Abreviação</Label>
                        <Input
                          id="subAbbr"
                          value={subjectAbbr}
                          onChange={(e) => setSubjectAbbr(e.target.value)}
                          placeholder="Ex: WEB"
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setSubjectOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={subjectLoading} className="bg-blue-800 hover:bg-blue-700 font-bold">
                        {subjectLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Salvar Disciplina
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            {/* Filter Bar */}
            <div className="p-4 border-b bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou sigla..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant={subjectFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setSubjectFilter("ALL")}
                  className={`text-xs h-8 ${subjectFilter === "ALL" ? "bg-blue-800" : ""}`}
                >
                  Todas ({subjects.length})
                </Button>
                <Button
                  size="sm"
                  variant={subjectFilter === "ACTIVE" ? "default" : "outline"}
                  onClick={() => setSubjectFilter("ACTIVE")}
                  className={`text-xs h-8 ${subjectFilter === "ACTIVE" ? "bg-emerald-700" : ""}`}
                >
                  Ativas ({activeSubjectsCount})
                </Button>
                <Button
                  size="sm"
                  variant={subjectFilter === "INACTIVE" ? "default" : "outline"}
                  onClick={() => setSubjectFilter("INACTIVE")}
                  className={`text-xs h-8 ${subjectFilter === "INACTIVE" ? "bg-slate-700" : ""}`}
                >
                  Inativas ({inactiveSubjectsCount})
                </Button>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6">
              {filteredSubjects.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhuma disciplina encontrada com os filtros selecionados.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-3.5 rounded-xl border transition-all shadow-sm flex items-center justify-between gap-2 ${
                        sub.isActive
                          ? "bg-white border-slate-200"
                          : "bg-slate-50/80 border-dashed border-slate-300 opacity-80"
                      }`}
                    >
                      <div className="min-w-0">
                        <h4 className={`font-bold text-sm truncate ${sub.isActive ? "text-slate-900" : "text-slate-500 line-through"}`}>
                          {sub.name}
                        </h4>
                        {sub.abbreviation && (
                          <span className={`text-xs font-mono font-semibold ${sub.isActive ? "text-blue-700" : "text-slate-400"}`}>
                            Sigla: {sub.abbreviation}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={sub.isActive ? "outline" : "default"}
                        onClick={() => openConfirmDialog("subject", sub.id, sub.name, sub.isActive)}
                        className={`shrink-0 h-8 px-2.5 text-xs font-semibold ${
                          sub.isActive
                            ? "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                            : "bg-slate-700 hover:bg-slate-800 text-white"
                        }`}
                        title={sub.isActive ? "Clique para desativar com confirmação" : "Clique para reativar"}
                      >
                        {sub.isActive ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
                            Ativa
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reativar
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Tipos de RAC */}
        <TabsContent value="rac" className="mt-4 sm:mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center text-amber-900">
                  <FileText className="mr-2 h-5 w-5 text-amber-600" />
                  Tipos de Registro de Acompanhamento (RAC)
                </CardTitle>
                <CardDescription className="text-xs">
                  Categorias de condutas e apontamentos pedagógicos em sala ({activeRacCount} ativas / {inactiveRacCount} inativas).
                </CardDescription>
              </div>

              <Dialog open={racOpen} onOpenChange={setRacOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-10 w-full sm:w-auto">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Novo Tipo RAC
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleCreateRACType}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Tipo de RAC</DialogTitle>
                      <DialogDescription>Adicione uma categoria para anotações em sala de aula.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="racTitle" className="text-xs font-semibold text-slate-700">Título / Conduta *</Label>
                        <Input
                          id="racTitle"
                          value={racName}
                          onChange={(e) => setRacName(e.target.value)}
                          placeholder="Ex: Fone de Ouvido em Aula"
                          required
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="racGravidade" className="text-xs font-semibold text-slate-700">Gravidade Padrão</Label>
                        <Select value={racSeverity} onValueChange={setRacSeverity}>
                          <SelectTrigger id="racGravidade" className="h-10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LEVE">Leve</SelectItem>
                            <SelectItem value="MODERADO">Moderado</SelectItem>
                            <SelectItem value="GRAVE">Grave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="racDesc" className="text-xs font-semibold text-slate-700">Descrição / Orientação</Label>
                        <Input
                          id="racDesc"
                          value={racDesc}
                          onChange={(e) => setRacDesc(e.target.value)}
                          placeholder="Orientações aos professores"
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setRacOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={racLoading} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                        {racLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Salvar Tipo de RAC
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            {/* Filter Bar */}
            <div className="p-4 border-b bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar tipo de RAC..."
                  value={racSearch}
                  onChange={(e) => setRacSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant={racFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setRacFilter("ALL")}
                  className={`text-xs h-8 ${racFilter === "ALL" ? "bg-amber-700" : ""}`}
                >
                  Todos ({racTypes.length})
                </Button>
                <Button
                  size="sm"
                  variant={racFilter === "ACTIVE" ? "default" : "outline"}
                  onClick={() => setRacFilter("ACTIVE")}
                  className={`text-xs h-8 ${racFilter === "ACTIVE" ? "bg-emerald-700" : ""}`}
                >
                  Ativos ({activeRacCount})
                </Button>
                <Button
                  size="sm"
                  variant={racFilter === "INACTIVE" ? "default" : "outline"}
                  onClick={() => setRacFilter("INACTIVE")}
                  className={`text-xs h-8 ${racFilter === "INACTIVE" ? "bg-slate-700" : ""}`}
                >
                  Inativos ({inactiveRacCount})
                </Button>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6">
              {filteredRACTypes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum tipo de RAC encontrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredRACTypes.map((rac) => (
                    <div
                      key={rac.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-sm ${
                        rac.isActive ? "bg-white border-slate-200" : "bg-slate-50/80 border-dashed border-slate-300 opacity-80"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`font-bold text-sm ${rac.isActive ? "text-slate-900" : "text-slate-500 line-through"}`}>
                            {rac.name}
                          </h4>
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              rac.severity === "GRAVE"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : rac.severity === "MODERADO"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}
                          >
                            {rac.severity}
                          </Badge>
                        </div>
                        {rac.description && <p className="text-xs text-slate-500">{rac.description}</p>}
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Status</span>
                        <Button
                          size="sm"
                          variant={rac.isActive ? "outline" : "default"}
                          onClick={() => openConfirmDialog("rac", rac.id, rac.name, rac.isActive)}
                          className={`h-7 px-2.5 text-xs font-semibold ${
                            rac.isActive
                              ? "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                              : "bg-slate-700 hover:bg-slate-800 text-white"
                          }`}
                        >
                          {rac.isActive ? (
                            <>
                              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reativar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Tipos de Ocorrência */}
        <TabsContent value="ocorrencias" className="mt-4 sm:mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center text-red-900">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                  Tipos de Ocorrência Disciplinar
                </CardTitle>
                <CardDescription className="text-xs">
                  Classificação de infrações disciplinares ({activeOccCount} ativas / {inactiveOccCount} inativas).
                </CardDescription>
              </div>

              <Dialog open={occOpen} onOpenChange={setOccOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold h-10 w-full sm:w-auto">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Novo Tipo Ocorrência
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleCreateOccurrenceType}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Tipo de Ocorrência</DialogTitle>
                      <DialogDescription>Adicione uma categoria para registros disciplinares formais.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="occTitle" className="text-xs font-semibold text-slate-700">Título da Infração *</Label>
                        <Input
                          id="occTitle"
                          value={occName}
                          onChange={(e) => setOccName(e.target.value)}
                          placeholder="Ex: Agressão Verbal"
                          required
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="occGravidade" className="text-xs font-semibold text-slate-700">Gravidade Padrão</Label>
                        <Select value={occSeverity} onValueChange={setOccSeverity}>
                          <SelectTrigger id="occGravidade" className="h-10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LEVE">Leve</SelectItem>
                            <SelectItem value="MODERADO">Moderado</SelectItem>
                            <SelectItem value="GRAVE">Grave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="occDesc" className="text-xs font-semibold text-slate-700">Descrição / Medida Sugerida</Label>
                        <Input
                          id="occDesc"
                          value={occDesc}
                          onChange={(e) => setOccDesc(e.target.value)}
                          placeholder="Ex: Advertência escrita e chamada dos responsáveis"
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setOccOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={occLoading} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                        {occLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Salvar Tipo
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            {/* Filter Bar */}
            <div className="p-4 border-b bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar tipo de ocorrência..."
                  value={occSearch}
                  onChange={(e) => setOccSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant={occFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setOccFilter("ALL")}
                  className={`text-xs h-8 ${occFilter === "ALL" ? "bg-red-800" : ""}`}
                >
                  Todos ({occurrenceTypes.length})
                </Button>
                <Button
                  size="sm"
                  variant={occFilter === "ACTIVE" ? "default" : "outline"}
                  onClick={() => setOccFilter("ACTIVE")}
                  className={`text-xs h-8 ${occFilter === "ACTIVE" ? "bg-emerald-700" : ""}`}
                >
                  Ativos ({activeOccCount})
                </Button>
                <Button
                  size="sm"
                  variant={occFilter === "INACTIVE" ? "default" : "outline"}
                  onClick={() => setOccFilter("INACTIVE")}
                  className={`text-xs h-8 ${occFilter === "INACTIVE" ? "bg-slate-700" : ""}`}
                >
                  Inativos ({inactiveOccCount})
                </Button>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6">
              {filteredOccTypes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum tipo de ocorrência encontrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredOccTypes.map((occ) => (
                    <div
                      key={occ.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-sm ${
                        occ.isActive ? "bg-white border-slate-200" : "bg-slate-50/80 border-dashed border-slate-300 opacity-80"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`font-bold text-sm ${occ.isActive ? "text-slate-900" : "text-slate-500 line-through"}`}>
                            {occ.name}
                          </h4>
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              occ.severity === "GRAVE"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : occ.severity === "MODERADO"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}
                          >
                            {occ.severity}
                          </Badge>
                        </div>
                        {occ.description && <p className="text-xs text-slate-500">{occ.description}</p>}
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Status</span>
                        <Button
                          size="sm"
                          variant={occ.isActive ? "outline" : "default"}
                          onClick={() => openConfirmDialog("occurrence", occ.id, occ.name, occ.isActive)}
                          className={`h-7 px-2.5 text-xs font-semibold ${
                            occ.isActive
                              ? "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                              : "bg-slate-700 hover:bg-slate-800 text-white"
                          }`}
                        >
                          {occ.isActive ? (
                            <>
                              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reativar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Ano Letivo */}
        <TabsContent value="ano-letivo" className="mt-4 sm:mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center text-indigo-900">
                  <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
                  Calendário de Anos Letivos
                </CardTitle>
                <CardDescription className="text-xs">
                  Cadastre novos períodos acadêmicos ou edite as datas de início e término.
                </CardDescription>
              </div>

              <Dialog open={yearOpen} onOpenChange={setYearOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-indigo-800 hover:bg-indigo-700 text-xs font-semibold h-10 w-full sm:w-auto">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Novo Ano Letivo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleCreateSchoolYear}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Ano Letivo</DialogTitle>
                      <DialogDescription>Defina o ano e os períodos de vigência acadêmica.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="anoNum" className="text-xs font-semibold text-slate-700">Ano *</Label>
                        <Input
                          id="anoNum"
                          type="number"
                          value={newYear}
                          onChange={(e) => setNewYear(Number(e.target.value))}
                          required
                          className="h-10 text-sm font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="startDate" className="text-xs font-semibold text-slate-700">Início das Aulas</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={yearStartDate}
                            onChange={(e) => setYearStartDate(e.target.value)}
                            className="h-10 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="endDate" className="text-xs font-semibold text-slate-700">Término do Ano</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={yearEndDate}
                            onChange={(e) => setYearEndDate(e.target.value)}
                            className="h-10 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id="isCurrent"
                          checked={yearIsCurrent}
                          onChange={(e) => setYearIsCurrent(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Label htmlFor="isCurrent" className="text-xs font-medium text-slate-700 cursor-pointer">
                          Definir como Ano Letivo Atual imediatamente
                        </Label>
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setYearOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={yearLoading} className="bg-indigo-800 hover:bg-indigo-700 font-bold">
                        {yearLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Cadastrar Ano Letivo
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schoolYears.map((sy) => (
                  <div
                    key={sy.id}
                    className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
                      sy.isCurrent
                        ? "bg-indigo-50/50 border-indigo-300 shadow-sm ring-2 ring-indigo-500/20"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900">{sy.year}</span>
                        {sy.isCurrent ? (
                          <Badge className="bg-indigo-600 text-white font-bold text-xs">
                            Ano Vigente
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 text-xs">
                            Histórico
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <p>
                          📅 Início:{" "}
                          <span className="font-semibold text-slate-800">
                            {sy.startDate ? format(new Date(sy.startDate), "dd/MM/yyyy") : "Não definido"}
                          </span>
                        </p>
                        <p>
                          🏁 Término:{" "}
                          <span className="font-semibold text-slate-800">
                            {sy.endDate ? format(new Date(sy.endDate), "dd/MM/yyyy") : "Não definido"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditSchoolYear(sy)}
                        className="flex-1 text-xs font-semibold h-9"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Editar
                      </Button>
                      {!sy.isCurrent && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetCurrentYear(sy.id, sy.year)}
                          className="flex-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 h-9"
                        >
                          Definir Atual
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Power className="h-5 w-5 text-amber-600" />
              {confirmTarget?.currentStatus ? "Confirmar Desativação" : "Confirmar Reativação"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 pt-2">
              {confirmTarget?.currentStatus ? (
                <span>
                  Você tem certeza que deseja <strong>desativar</strong> o item{" "}
                  <strong className="text-slate-900">"{confirmTarget?.name}"</strong>?
                  <br />
                  <br />
                  Ele não aparecerá em novos lançamentos, mas continuará <strong>salvo no sistema</strong> e listado na aba <strong>Inativas</strong>, podendo ser reativado a qualquer momento.
                </span>
              ) : (
                <span>
                  Deseja <strong>reativar</strong> o item{" "}
                  <strong className="text-slate-900">"{confirmTarget?.name}"</strong>?
                  <br />
                  <br />
                  Ele voltará a ficar disponível imediatamente para seleção em novos registros e chamadas.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                setConfirmTarget(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={confirmLoading}
              onClick={handleExecuteToggle}
              className={`font-bold ${
                confirmTarget?.currentStatus
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {confirmLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : confirmTarget?.currentStatus ? (
                "Sim, Desativar"
              ) : (
                "Sim, Reativar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit School Year Modal */}
      <Dialog open={editYearOpen} onOpenChange={setEditYearOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateSchoolYear}>
            <DialogHeader>
              <DialogTitle>Editar Ano Letivo {editYearNumber}</DialogTitle>
              <DialogDescription>Altere as datas de vigência do período letivo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="editAnoNum" className="text-xs font-semibold text-slate-700">Ano *</Label>
                <Input
                  id="editAnoNum"
                  type="number"
                  value={editYearNumber}
                  onChange={(e) => setEditYearNumber(Number(e.target.value))}
                  required
                  className="h-10 text-sm font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="editStartDate" className="text-xs font-semibold text-slate-700">Início das Aulas</Label>
                  <Input
                    id="editStartDate"
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editEndDate" className="text-xs font-semibold text-slate-700">Término do Ano</Label>
                  <Input
                    id="editEndDate"
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="editIsCurrent"
                  checked={editIsCurrent}
                  onChange={(e) => setEditIsCurrent(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="editIsCurrent" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Definir como Ano Letivo Atual
                </Label>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setEditYearOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editYearLoading} className="bg-indigo-800 hover:bg-indigo-700 font-bold">
                {editYearLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
