"use client";

import { useState } from "react";
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
import { PlusCircle, Loader2, BookOpen, FileText, AlertTriangle, Calendar, Check, Edit, Star, Shield } from "lucide-react";
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

  // RAC Type Modal State
  const [racOpen, setRacOpen] = useState(false);
  const [racName, setRacName] = useState("");
  const [racDesc, setRacDesc] = useState("");
  const [racSeverity, setRacSeverity] = useState("LEVE");
  const [racLoading, setRacLoading] = useState(false);

  // Occurrence Type Modal State
  const [occOpen, setOccOpen] = useState(false);
  const [occName, setOccName] = useState("");
  const [occDesc, setOccDesc] = useState("");
  const [occSeverity, setOccSeverity] = useState("LEVE");
  const [occLoading, setOccLoading] = useState(false);

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
    if (!subjectName) return;
    setSubjectLoading(true);
    try {
      await createSubject({ name: subjectName, abbreviation: subjectAbbr });
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

  const handleToggleSubject = async (id: string) => {
    try {
      const res = await toggleSubjectStatus(id);
      if (res.success) {
        toast.success("Status da disciplina alterado!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Erro ao alterar status.");
    }
  };

  const handleCreateRACType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!racName) return;
    setRacLoading(true);
    try {
      await createRACType({ name: racName, description: racDesc, severity: racSeverity });
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

  const handleToggleRACType = async (id: string) => {
    try {
      const res = await toggleRACTypeStatus(id);
      if (res.success) {
        toast.success("Status do tipo de RAC alterado!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Erro ao alterar status.");
    }
  };

  const handleCreateOccurrenceType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occName) return;
    setOccLoading(true);
    try {
      await createOccurrenceType({ name: occName, description: occDesc, severity: occSeverity });
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

  const handleToggleOccurrenceType = async (id: string) => {
    try {
      const res = await toggleOccurrenceTypeStatus(id);
      if (res.success) {
        toast.success("Status da ocorrência alterado!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Erro ao alterar status.");
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

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">Configurações do Sistema</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Gerencie disciplinas, categorias de RAC, ocorrências e calendário de anos letivos.
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
                  Grade de Disciplinas
                </CardTitle>
                <CardDescription className="text-xs">
                  Disciplinas da matriz curricular da escola.
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
                      <DialogDescription>Adicione uma matéria à grade curricular.</DialogDescription>
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
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {subjects.map((sub) => (
                  <div key={sub.id} className="p-3.5 rounded-xl border bg-white shadow-sm flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{sub.name}</h4>
                      {sub.abbreviation && <span className="text-xs text-blue-700 font-mono font-semibold">Sigla: {sub.abbreviation}</span>}
                    </div>
                    <button
                      onClick={() => handleToggleSubject(sub.id)}
                      className="shrink-0"
                      title="Clique para alternar status"
                    >
                      <Badge className={`cursor-pointer text-[11px] ${sub.isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {sub.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </button>
                  </div>
                ))}
              </div>
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
                  Categorias de condutas e apontamentos pedagógicos em sala.
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
                        Salvar Tipo
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {racTypes.map((rac) => (
                  <div key={rac.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{rac.name}</h4>
                      <Badge className={rac.severity === "LEVE" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : rac.severity === "MODERADO" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-red-100 text-red-800 border-red-200"}>
                        {rac.severity}
                      </Badge>
                    </div>
                    {rac.description && <p className="text-xs text-slate-500">{rac.description}</p>}
                  </div>
                ))}
              </div>
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
                  Tipos de Ocorrências Disciplinares
                </CardTitle>
                <CardDescription className="text-xs">
                  Categorias de infrações formais com registro de providências.
                </CardDescription>
              </div>

              <Dialog open={occOpen} onOpenChange={setOccOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold h-10 w-full sm:w-auto">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Novo Tipo de Ocorrência
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleCreateOccurrenceType}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Tipo de Ocorrência</DialogTitle>
                      <DialogDescription>Defina uma infração disciplinar regulamentar.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="occTitle" className="text-xs font-semibold text-slate-700">Nome da Infração *</Label>
                        <Input
                          id="occTitle"
                          value={occName}
                          onChange={(e) => setOccName(e.target.value)}
                          placeholder="Ex: Danificar Patrimônio Escolar"
                          required
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="occGravidade" className="text-xs font-semibold text-slate-700">Gravidade</Label>
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
                        <Label htmlFor="occDesc" className="text-xs font-semibold text-slate-700">Descrição / Orientações</Label>
                        <Input
                          id="occDesc"
                          value={occDesc}
                          onChange={(e) => setOccDesc(e.target.value)}
                          placeholder="Descrição dos procedimentos"
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
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {occurrenceTypes.map((occ) => (
                  <div key={occ.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{occ.name}</h4>
                      <Badge className={occ.severity === "LEVE" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : occ.severity === "MODERADO" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-red-100 text-red-800 border-red-200"}>
                        {occ.severity}
                      </Badge>
                    </div>
                    {occ.description && <p className="text-xs text-slate-500">{occ.description}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Ano Letivo (CADASTRO & EDIÇÃO COMPLETA) */}
        <TabsContent value="ano-letivo" className="mt-4 sm:mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center text-blue-900">
                  <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                  Gestão de Anos Letivos
                </CardTitle>
                <CardDescription className="text-xs">
                  Cadastre novos períodos letivos, edite datas de início/término e defina o ano vigente.
                </CardDescription>
              </div>

              {/* Novo Ano Letivo Modal */}
              <Dialog open={yearOpen} onOpenChange={setYearOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold h-10 w-full sm:w-auto">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Novo Ano Letivo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleCreateSchoolYear}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Ano Letivo</DialogTitle>
                      <DialogDescription>Defina o ano e os períodos de vigência das aulas.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="yearNum" className="text-xs font-semibold text-slate-700">Ano (ex: 2026, 2027) *</Label>
                        <Input
                          id="yearNum"
                          type="number"
                          value={newYear}
                          onChange={(e) => setNewYear(Number(e.target.value))}
                          required
                          className="h-10 text-sm font-bold font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="yearStart" className="text-xs font-semibold text-slate-700">Data de Início</Label>
                          <Input
                            id="yearStart"
                            type="date"
                            value={yearStartDate}
                            onChange={(e) => setYearStartDate(e.target.value)}
                            className="h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="yearEnd" className="text-xs font-semibold text-slate-700">Data de Término</Label>
                          <Input
                            id="yearEnd"
                            type="date"
                            value={yearEndDate}
                            onChange={(e) => setYearEndDate(e.target.value)}
                            className="h-10 text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          id="isCurrentCheck"
                          type="checkbox"
                          checked={yearIsCurrent}
                          onChange={(e) => setYearIsCurrent(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="isCurrentCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                          Definir como Ano Letivo Atual Vigente
                        </Label>
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setYearOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={yearLoading} className="bg-blue-800 hover:bg-blue-700 text-white font-bold">
                        {yearLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Cadastrar Ano Letivo
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {schoolYears.map((year) => (
                  <div key={year.id} className="p-4 rounded-xl border bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-bold text-slate-900">Ano Letivo {year.year}</h4>
                        {year.isCurrent ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold">
                            🟢 Ano Vigente Atual
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 text-xs">
                            Encerrado / Futuro
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Período: {year.startDate ? format(new Date(year.startDate), "dd/MM/yyyy") : "01/02"} até {year.endDate ? format(new Date(year.endDate), "dd/MM/yyyy") : "15/12"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {!year.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetCurrentYear(year.id, year.year)}
                          className="flex-1 sm:flex-initial text-xs text-blue-700 border-blue-200 hover:bg-blue-50 h-9"
                        >
                          <Star className="w-3.5 h-3.5 mr-1 text-blue-600" />
                          Definir como Atual
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditSchoolYear(year)}
                        className="text-xs h-9"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit School Year Modal */}
      <Dialog open={editYearOpen} onOpenChange={setEditYearOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateSchoolYear}>
            <DialogHeader>
              <DialogTitle>Editar Ano Letivo {editYearNumber}</DialogTitle>
              <DialogDescription>Modifique datas ou status do ano letivo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="editYearNum" className="text-xs font-semibold text-slate-700">Ano *</Label>
                <Input
                  id="editYearNum"
                  type="number"
                  value={editYearNumber}
                  onChange={(e) => setEditYearNumber(Number(e.target.value))}
                  required
                  className="h-10 text-sm font-bold font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editYearStart" className="text-xs font-semibold text-slate-700">Data de Início</Label>
                  <Input
                    id="editYearStart"
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editYearEnd" className="text-xs font-semibold text-slate-700">Data de Término</Label>
                  <Input
                    id="editYearEnd"
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="editIsCurrentCheck"
                  type="checkbox"
                  checked={editIsCurrent}
                  onChange={(e) => setEditIsCurrent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="editIsCurrentCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Definir como Ano Letivo Atual Vigente
                </Label>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setEditYearOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editYearLoading} className="bg-blue-800 hover:bg-blue-700 text-white font-bold">
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
