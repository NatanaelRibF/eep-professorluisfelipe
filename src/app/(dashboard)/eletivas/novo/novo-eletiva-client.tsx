"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createElective } from "@/actions/eletivas.actions";
import { toast } from "sonner";

export default function NovoEletivaClient({ operators }: { operators: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [themeArea, setThemeArea] = useState("Tecnologia");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(35);
  const [semester, setSemester] = useState(1);
  const [year, setYear] = useState(2026);
  const [roomLocation, setRoomLocation] = useState("");

  const teachers = operators.filter((o) => o.role?.name === "Professor" || o.role?.name === "Diretor" || o.role?.name === "Coordenador");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !operatorId) {
      toast.error("Preencha o nome da eletiva, ementa e professor responsável.");
      return;
    }

    setLoading(true);
    try {
      const res = await createElective({
        name,
        themeArea,
        description,
        goals,
        operatorId,
        maxCapacity: Number(maxCapacity) || 35,
        semester: Number(semester) || 1,
        year: Number(year) || 2026,
        roomLocation,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao cadastrar eletiva.");
        return;
      }

      toast.success("Disciplina Eletiva criada com sucesso!");
      router.push("/eletivas");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao salvar eletiva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2">
        <Link href="/eletivas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-amber-500" />
            Cadastrar Nova Disciplina Eletiva
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Adicione uma nova proposta de componente diversificado para o Feirão de Eletivas.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Ementa e Informações da Disciplina</CardTitle>
            <CardDescription className="text-xs">
              Defina o tema, professor responsável e quantidade de vagas disponíveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Título da Eletiva *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Robótica e Automação Sustentável, Redação Nota 1000..."
                required
                className="h-11 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="themeArea" className="text-xs font-semibold text-slate-700">Área do Conhecimento *</Label>
                <select
                  id="themeArea"
                  value={themeArea}
                  onChange={(e) => setThemeArea(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="Tecnologia">Tecnologia & Inovação</option>
                  <option value="Linguagens">Linguagens & Artes</option>
                  <option value="Matemática">Matemática & Finanças</option>
                  <option value="Natureza">Ciências da Natureza</option>
                  <option value="Humanas">Ciências Humanas & Sociais</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="operatorId" className="text-xs font-semibold text-slate-700">Professor Responsável *</Label>
                <select
                  id="operatorId"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="">Selecione o professor...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.nickname ? `(${t.nickname})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="capacity" className="text-xs font-semibold text-slate-700">Limite de Vagas *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  required
                  min={5}
                  max={60}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="semester" className="text-xs font-semibold text-slate-700">Semestre *</Label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value={1}>1º Semestre</option>
                  <option value={2}>2º Semestre</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room" className="text-xs font-semibold text-slate-700">Espaço / Sala</Label>
                <Input
                  id="room"
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  placeholder="Ex: LEI 1, Lab Ciências..."
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Ementa / Descrição da Eletiva *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Apresente um resumo atrativo do conteúdo para os estudantes..."
                rows={3}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goals" className="text-xs font-semibold text-slate-700">Objetivos e Culminância Esperada</Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Quais competências os alunos irão desenvolver e qual o produto final da eletiva..."
                rows={2}
                className="text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Link href="/eletivas">
              <Button variant="outline" type="button" className="text-xs">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Publicar Eletiva
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
