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
import { PlusCircle, Loader2, BookOpen, FileText, AlertTriangle, Calendar } from "lucide-react";
import { createSubject, toggleSubjectStatus } from "@/actions/class.actions";
import { createRACType, toggleRACTypeStatus, createOccurrenceType, toggleOccurrenceTypeStatus } from "@/actions/config.actions";
import { toast } from "sonner";

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-blue-900">Configurações do Sistema</h2>
          <p className="text-slate-500">Gerencie disciplinas, categorias de RAC, ocorrências e calendário escolar.</p>
        </div>
      </div>

      <Tabs defaultValue="disciplinas" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[650px]">
          <TabsTrigger value="disciplinas">Disciplinas ({subjects.length})</TabsTrigger>
          <TabsTrigger value="rac">Tipos de RAC ({racTypes.length})</TabsTrigger>
          <TabsTrigger value="ocorrencias">Ocorrências ({occurrenceTypes.length})</TabsTrigger>
          <TabsTrigger value="ano-letivo">Ano Letivo ({schoolYears.length})</TabsTrigger>
        </TabsList>

        {/* 1. Disciplinas */}
        <TabsContent value="disciplinas" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center text-xl">
                  <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                  Disciplinas
                </CardTitle>
                <CardDescription>Disciplinas da matriz curricular da escola.</CardDescription>
              </div>

              <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova Disciplina
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateSubject}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Nova Disciplina</DialogTitle>
                      <DialogDescription>Adicione uma matéria à grade curricular.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="subName">Nome da Disciplina</Label>
                        <Input
                          id="subName"
                          value={subjectName}
                          onChange={(e) => setSubjectName(e.target.value)}
                          placeholder="Ex: Robótica Educacional"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subAbbr">Sigla / Abreviação</Label>
                        <Input
                          id="subAbbr"
                          value={subjectAbbr}
                          onChange={(e) => setSubjectAbbr(e.target.value)}
                          placeholder="Ex: ROB"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setSubjectOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={subjectLoading} className="bg-blue-600 hover:bg-blue-700">
                        {subjectLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Salvar Disciplina
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {subjects.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-lg border bg-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{sub.name}</h4>
                      {sub.abbreviation && <span className="text-xs text-slate-500 font-mono">Sigla: {sub.abbreviation}</span>}
                    </div>
                    <Badge className={sub.isActive ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-700"}>
                      {sub.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Tipos de RAC */}
        <TabsContent value="rac" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center text-xl">
                  <FileText className="mr-2 h-5 w-5 text-amber-500" />
                  Tipos de Registro de Acompanhamento (RAC)
                </CardTitle>
                <CardDescription>Categorias de condutas e ocorrências pedagógicas em sala.</CardDescription>
              </div>

              <Dialog open={racOpen} onOpenChange={setRacOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Tipo RAC
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateRACType}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Tipo de RAC</DialogTitle>
                      <DialogDescription>Adicione uma categoria para anotações de sala de aula.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="racTitle">Título / Conduta</Label>
                        <Input
                          id="racTitle"
                          value={racName}
                          onChange={(e) => setRacName(e.target.value)}
                          placeholder="Ex: Fone de Ouvido em Aula"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="racGravidade">Gravidade Padrão</Label>
                        <Select value={racSeverity} onValueChange={setRacSeverity}>
                          <SelectTrigger id="racGravidade">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LEVE">Leve</SelectItem>
                            <SelectItem value="MODERADO">Moderado</SelectItem>
                            <SelectItem value="GRAVE">Grave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="racDesc">Descrição / Orientação</Label>
                        <Input
                          id="racDesc"
                          value={racDesc}
                          onChange={(e) => setRacDesc(e.target.value)}
                          placeholder="Descrição opcional"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setRacOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={racLoading} className="bg-amber-600 hover:bg-amber-700">
                        {racLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Salvar Tipo
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {racTypes.map((rac) => (
                  <div key={rac.id} className="p-4 rounded-lg border bg-white shadow-sm space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-900">{rac.name}</h4>
                      <Badge className={rac.severity === "LEVE" ? "bg-green-100 text-green-800" : rac.severity === "MODERADO" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
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
        <TabsContent value="ocorrencias" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center text-xl">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Tipos de Ocorrências Disciplinares
                </CardTitle>
                <CardDescription>Categorias de ocorrências formais com registro de providências.</CardDescription>
              </div>

              <Dialog open={occOpen} onOpenChange={setOccOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Tipo de Ocorrência
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateOccurrenceType}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Tipo de Ocorrência</DialogTitle>
                      <DialogDescription>Defina uma infração disciplinar.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="occTitle">Nome da Infração</Label>
                        <Input
                          id="occTitle"
                          value={occName}
                          onChange={(e) => setOccName(e.target.value)}
                          placeholder="Ex: Danificar Material do Colega"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occGravidade">Gravidade</Label>
                        <Select value={occSeverity} onValueChange={setOccSeverity}>
                          <SelectTrigger id="occGravidade">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LEVE">Leve</SelectItem>
                            <SelectItem value="MODERADO">Moderado</SelectItem>
                            <SelectItem value="GRAVE">Grave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occDesc">Descrição</Label>
                        <Input
                          id="occDesc"
                          value={occDesc}
                          onChange={(e) => setOccDesc(e.target.value)}
                          placeholder="Descrição da conduta"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOccOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={occLoading} className="bg-red-600 hover:bg-red-700">
                        {occLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Salvar Tipo
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {occurrenceTypes.map((occ) => (
                  <div key={occ.id} className="p-4 rounded-lg border bg-white shadow-sm space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-900">{occ.name}</h4>
                      <Badge className={occ.severity === "LEVE" ? "bg-green-100 text-green-800" : occ.severity === "MODERADO" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
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

        {/* 4. Ano Letivo */}
        <TabsContent value="ano-letivo" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                  Ano Letivo
                </CardTitle>
                <CardDescription>Calendários escolares configurados no sistema.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schoolYears.map((year) => (
                  <div key={year.id} className="p-4 rounded-lg border bg-white flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">Ano Letivo {year.year}</h4>
                      <p className="text-xs text-slate-500">Período regular de aulas</p>
                    </div>
                    {year.isCurrent && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Ano Letivo Atual
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
