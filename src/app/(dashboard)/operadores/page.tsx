import Link from "next/link";
import { PlusCircle, Search, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getOperators } from "@/actions/operator.actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function OperadoresPage() {
  const operadores = await getOperators();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-blue-900">Operadores do Sistema</h2>
          <p className="text-slate-500">Total de {operadores.length} operadores cadastrados</p>
        </div>
        <Link href="/operadores/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Operador
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cargo / Perfil</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum operador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              operadores.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-semibold text-slate-900">{op.name}</TableCell>
                  <TableCell className="text-slate-600">{op.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                      {op.role?.name || "Operador"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {op.createdAt ? format(new Date(op.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                  </TableCell>
                  <TableCell>
                    {op.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
