"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createPDTCouncil } from "@/actions/pdt.actions";
import { toast } from "sonner";

export default function NovoConselhoClient({ classes }: { classes: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [classGroupId, setClassGroupId] = useState("");
  const [bimester, setBimester] = useState("1");
  const [highlights, setHighlights] = useState("");
  const [concerns, setConcerns] = useState("");
  const [interventions, setInterventions] = useState("");
  const [minutes, setMinutes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classGroupId) {
      toast.error("Selecione a turma.");
      return;
    }

    setLoading(true);
    try {
      const res = await createPDTCouncil({
        classGroupId,
        bimester: Number(bimester) || 1,
        highlights,
        concerns,
        interventions,
        minutes,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao salvar ata do conselho.");
        return;
      }

      toast.success("Ata do Conselho de Turma registrada com sucesso!");
      router.push("/pdt");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao registrar conselho.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2">
        <Link href="/pdt">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            Nova Ata do Conselho de Turma
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Registro bimestral das avaliações coletivas, destaques e encaminhamentos pedagógicos.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Deliberações do Conselho</CardTitle>
            <CardDescription className="text-xs">
              Preencha o diagnóstico da turma e as decisões pactuadas com os professores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="turma" className="text-xs font-semibold text-slate-700">Turma *</Label>
                <select
                  id="turma"
                  value={classGroupId}
                  onChange={(e) => setClassGroupId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione a turma...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade?.name || ""})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bimester" className="text-xs font-semibold text-slate-700">Bimestre Letivo *</Label>
                <select
                  id="bimester"
                  value={bimester}
                  onChange={(e) => setBimester(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="1">1º Bimestre</option>
                  <option value="2">2º Bimestre</option>
                  <option value="3">3º Bimestre</option>
                  <option value="4">4º Bimestre</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="highlights" className="text-xs font-semibold text-emerald-800">
                🌟 Destaques Positivos da Turma
              </Label>
              <Textarea
                id="highlights"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Ex: Bom envolvimento nos projetos, melhoria no índice de frequência..."
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="concerns" className="text-xs font-semibold text-red-800">
                ⚠️ Alunos com Risco de Reprovação / Casos Especiais
              </Label>
              <Textarea
                id="concerns"
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="Liste estudantes que necessitam de intervenção ou busca ativa..."
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interventions" className="text-xs font-semibold text-blue-900">
                🎯 Ações de Intervenção Pedagógica Pactuadas
              </Label>
              <Textarea
                id="interventions"
                value={interventions}
                onChange={(e) => setInterventions(e.target.value)}
                placeholder="Ex: Aulas de recomposição às quartas, convocação dos pais na próxima semana..."
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="minutes" className="text-xs font-semibold text-slate-700">
                Texto Completo da Ata do Conselho (Opcional)
              </Label>
              <Textarea
                id="minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="Aos vinte e nove dias do mês de agosto, reuniu-se o conselho de classe..."
                rows={4}
                className="text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Link href="/pdt">
              <Button variant="outline" type="button" className="text-xs">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Salvar Ata do Conselho
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
