import Link from "next/link";
import { PlusCircle, UserCheck, UserX, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getOperators } from "@/actions/operator.actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function OperadoresPage() {
  const operadores = await getOperators();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-blue-900">Operadores do Sistema</h2>
          <p className="text-slate-500 text-sm">Total de {operadores.length} operadores cadastrados</p>
        </div>
        <Link href="/operadores/novo">
          <Button className="bg-blue-800 hover:bg-blue-700 shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Operador
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email de Acesso</TableHead>
              <TableHead>Cargo / Perfil</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhum operador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              operadores.map((op) => (
                <TableRow key={op.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <Avatar className="h-10 w-10 border border-slate-200">
                      {op.avatarUrl && <AvatarImage src={op.avatarUrl} alt={op.name} />}
                      <AvatarFallback className="bg-blue-100 text-blue-800 font-bold text-xs">
                        {getInitials(op.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">{op.name}</TableCell>
                  <TableCell className="text-slate-600 font-mono text-xs">{op.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 font-medium">
                      {op.role?.name || "Operador"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {op.createdAt ? format(new Date(op.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                  </TableCell>
                  <TableCell>
                    {op.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 font-medium">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 font-medium">
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
