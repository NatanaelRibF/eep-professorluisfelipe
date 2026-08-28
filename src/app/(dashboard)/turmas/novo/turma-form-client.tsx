"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createClassGroup } from "@/actions/class.actions";
import { toast } from "sonner";

export default function TurmaFormClient({
  grades,
  schoolYears,
}: {
  grades: any[];
  schoolYears: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [gradeId, setGradeId] = useState(grades[0]?.id || "");
  const [shift, setShift] = useState("MANHA");
  const [schoolYearId, setSchoolYearId] = useState(schoolYears[0]?.id || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gradeId || !shift || !schoolYearId) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      await createClassGroup({
        name,
        gradeId,
        shift,
        schoolYearId,
      });
      toast.success("Turma criada com sucesso!");
      router.push("/turmas");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao salvar turma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Link href="/turmas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-blue-900">Nova Turma</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados da Turma</CardTitle>
            <CardDescription>
              Crie uma nova turma definindo sua série, turno e ano letivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Turma (Ex: 1º Ano C)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: 1º Ano C"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Série</Label>
                <Select value={gradeId} onValueChange={setGradeId} required>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Selecione a série" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift">Turno</Label>
                <Select value={shift} onValueChange={setShift} required>
                  <SelectTrigger id="shift">
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANHA">Manhã</SelectItem>
                    <SelectItem value="TARDE">Tarde</SelectItem>
                    <SelectItem value="NOITE">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Ano Letivo</Label>
                <Select value={schoolYearId} onValueChange={setSchoolYearId} required>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolYears.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.year} {y.isCurrent ? "(Atual)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/turmas">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {loading ? "Salvando..." : "Salvar Turma"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
