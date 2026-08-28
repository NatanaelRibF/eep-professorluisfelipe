import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getClassGroups } from "@/actions/class.actions";

export const dynamic = "force-dynamic";

export default async function TurmasPage() {
  const turmas = await getClassGroups();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-blue-900">Turmas e Séries</h2>
          <p className="text-slate-500">Total de {turmas.length} turmas ativas</p>
        </div>
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
                <CardTitle className="text-xl text-blue-800">{turma.name}</CardTitle>
                <Badge variant="outline" className="bg-slate-50 text-slate-700">
                  {turma.shift === "MANHA" ? "Manhã" : turma.shift === "TARDE" ? "Tarde" : "Noite"}
                </Badge>
              </div>
              <CardDescription>{turma.grade?.name || "Ensino Médio"} - Ano {turma.schoolYear?.year || "2026"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-6 mt-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-slate-700">{turma._count?.enrollments || 0}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Alunos Matriculados</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t space-x-2">
              <Link href={`/alunos?classGroupId=${turma.id}`} className="w-full">
                <Button variant="outline" className="w-full text-xs" size="sm">
                  <Users className="mr-2 h-3 w-3" />
                  Ver Alunos
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
