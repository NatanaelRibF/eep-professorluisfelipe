import Link from "next/link";
import { PlusCircle, Search, UserCheck, UserX, Pencil, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration
const operadores = [
  { id: 1, nome: "João Silva", email: "joao@escola.com", cargo: "Diretor", status: "Ativo", dataCadastro: "10/01/2026" },
  { id: 2, nome: "Maria Santos", email: "maria@escola.com", cargo: "Coordenador", status: "Ativo", dataCadastro: "15/01/2026" },
  { id: 3, nome: "Carlos Oliveira", email: "carlos@escola.com", cargo: "Secretário", status: "Inativo", dataCadastro: "20/01/2026" },
  { id: 4, nome: "Ana Costa", email: "ana@escola.com", cargo: "Professor", status: "Ativo", dataCadastro: "25/01/2026" },
];

export default function OperadoresPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-blue-900">Operadores do Sistema</h2>
        <Link href="/operadores/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Operador
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input placeholder="Buscar por nome ou email..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cargo / Perfil</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operadores.map((op) => (
              <TableRow key={op.id}>
                <TableCell className="font-medium">{op.nome}</TableCell>
                <TableCell>{op.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-100 text-slate-800">
                    {op.cargo}
                  </Badge>
                </TableCell>
                <TableCell>{op.dataCadastro}</TableCell>
                <TableCell>
                  {op.status === "Ativo" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" title="Editar">
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Redefinir Senha">
                    <Key className="h-4 w-4 text-amber-500" />
                  </Button>
                  {op.status === "Ativo" ? (
                    <Button variant="ghost" size="icon" title="Inativar">
                      <UserX className="h-4 w-4 text-red-500" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" title="Ativar">
                      <UserCheck className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
