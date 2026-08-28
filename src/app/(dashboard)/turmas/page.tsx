import Link from "next/link";
import { PlusCircle, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data
const turmas = [
  { id: 1, nome: "1º Ano A", serie: "1ª Série", turno: "Manhã", alunos: 35, professores: 8 },
  { id: 2, nome: "1º Ano B", serie: "1ª Série", turno: "Tarde", alunos: 32, professores: 7 },
  { id: 3, nome: "2º Ano A", serie: "2ª Série", turno: "Manhã", alunos: 30, professores: 9 },
  { id: 4, nome: "3º Ano A", serie: "3ª Série", turno: "Manhã", alunos: 28, professores: 9 },
];

export default function TurmasPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-blue-900">Turmas e Séries</h2>
        <Link href="/turmas/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {turmas.map((turma) => (
          <Card key={turma.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-blue-800">{turma.nome}</CardTitle>
                <Badge variant="outline" className="bg-slate-50 text-slate-700">
                  {turma.turno}
                </Badge>
              </div>
              <CardDescription>{turma.serie} - Ano Letivo 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-6 mt-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-slate-700">{turma.alunos}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Alunos</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-slate-700">{turma.professores}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Professores</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t space-x-2">
              <Button variant="outline" className="flex-1 text-xs" size="sm">
                <BookOpen className="mr-2 h-3 w-3" />
                Disciplinas
              </Button>
              <Button variant="outline" className="flex-1 text-xs" size="sm">
                <Users className="mr-2 h-3 w-3" />
                Alunos
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
