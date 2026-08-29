"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createExam } from "@/actions/simulados.actions";
import { format } from "date-fns";
import { toast } from "sonner";

export default function NovoSimuladoClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("SPAECE");
  const [targetGrade, setTargetGrade] = useState("3ª Série");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");

  // Answer Key Builder (Default 10 sample questions, expandable)
  const [answerKey, setAnswerKey] = useState<Array<{ q: number; answer: string; descriptor: string }>>([
    { q: 1, answer: "A", descriptor: "D01" },
    { q: 2, answer: "B", descriptor: "D03" },
    { q: 3, answer: "C", descriptor: "D04" },
    { q: 4, answer: "D", descriptor: "D06" },
    { q: 5, answer: "A", descriptor: "D14" },
    { q: 6, answer: "C", descriptor: "D18" },
    { q: 7, answer: "B", descriptor: "D20" },
    { q: 8, answer: "D", descriptor: "D26" },
    { q: 9, answer: "A", descriptor: "D28" },
    { q: 10, answer: "B", descriptor: "D35" },
  ]);

  const handleAddQuestion = () => {
    const nextQ = answerKey.length + 1;
    setAnswerKey([...answerKey, { q: nextQ, answer: "A", descriptor: "D01" }]);
  };

  const handleUpdateQuestion = (idx: number, field: "answer" | "descriptor", val: string) => {
    const updated = [...answerKey];
    updated[idx][field] = val.toUpperCase().trim();
    setAnswerKey(updated);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (answerKey.length <= 1) return;
    const updated = answerKey.filter((_, i) => i !== idx).map((item, i) => ({ ...item, q: i + 1 }));
    setAnswerKey(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || answerKey.length === 0) {
      toast.error("Preencha o título, a data e adicione ao menos uma questão no gabarito.");
      return;
    }

    setLoading(true);
    try {
      const res = await createExam({
        title,
        category,
        targetGrade,
        date,
        totalQuestions: answerKey.length,
        answerKey,
        description,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao salvar simulado.");
        return;
      }

      toast.success("Simulado cadastrado com sucesso!");
      router.push("/simulados");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao cadastrar simulado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-2">
        <Link href="/simulados">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-blue-600" />
            Cadastrar Novo Simulado
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure a avaliação e a matriz de descritores SPAECE / ENEM para diagnóstico de aprendizagem.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Informações Básicas da Avaliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold text-slate-700">Título do Simulado *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 1º Simulado SPAECE 2026 - 3º Ano Médio..."
                required
                className="h-11 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold text-slate-700">Tipo de Avaliação *</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="SPAECE">SPAECE (LP & Matemática)</option>
                  <option value="ENEM">Simulado ENEM (4 Áreas)</option>
                  <option value="DIAGNOSTICA">Avaliação Diagnóstica</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="grade" className="text-xs font-semibold text-slate-700">Série Alvo *</Label>
                <select
                  id="grade"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="1ª Série">1ª Série EM</option>
                  <option value="2ª Série">2ª Série EM</option>
                  <option value="3ª Série">3ª Série EM</option>
                  <option value="TODAS">Todas as Séries</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-semibold text-slate-700">Data de Aplicação *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-11 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold text-slate-700">Descrição / Instruções</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Orientações aos professores aplicadores e estudantes..."
                rows={2}
                className="text-xs"
              />
            </div>

            {/* Answer Key Matrix */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Gabarito Oficial & Matriz de Descritores</h3>
                  <p className="text-[11px] text-slate-500">Defina a alternativa correta e o descritor de cada item.</p>
                </div>
                <Button type="button" onClick={handleAddQuestion} variant="outline" size="sm" className="text-xs font-bold border-blue-200 text-blue-800">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Adicionar Questão
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 max-h-72 overflow-y-auto p-1">
                {answerKey.map((item, idx) => (
                  <div key={item.q} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                      <span>Item {item.q}</span>
                      {answerKey.length > 1 && (
                        <button type="button" onClick={() => handleRemoveQuestion(idx)} className="text-slate-400 hover:text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <select
                        value={item.answer}
                        onChange={(e) => handleUpdateQuestion(idx, "answer", e.target.value)}
                        className="w-12 h-8 px-1 text-xs font-bold rounded border bg-white text-center text-blue-900"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                      <Input
                        value={item.descriptor}
                        onChange={(e) => handleUpdateQuestion(idx, "descriptor", e.target.value)}
                        placeholder="D01"
                        className="h-8 text-xs font-mono uppercase"
                        title="Descritor SPAECE/ENEM"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Link href="/simulados">
              <Button variant="outline" type="button" className="text-xs">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Salvar Simulado ({answerKey.length} Itens)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
