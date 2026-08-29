import Link from "next/link";
import { PlusCircle, Edit, User, Mail, Shield, Calendar, BookOpen } from "lucide-react";
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">Operadores do Sistema</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Total de {operadores.length} usuários, professores e funcionários cadastrados</p>
        </div>
        <Link href="/operadores/novo" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-blue-800 hover:bg-blue-700 shadow-sm font-semibold text-sm h-11 sm:h-10">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Operador
          </Button>
        </Link>
      </div>

      {/* MOBILE CARD VIEW (block md:hidden) */}
      <div className="block md:hidden space-y-3">
        {operadores.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed">
            Nenhum operador encontrado.
          </div>
        ) : (
          operadores.map((op) => (
            <div key={op.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                    {op.avatarUrl ? (
                      <img src={op.avatarUrl} alt={op.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{getInitials(op.name)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{op.name}</h4>
                    {op.nickname && (
                      <p className="text-xs text-blue-700 font-semibold mt-0.5">
                        &quot;{op.nickname}&quot;
                      </p>
                    )}
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{op.email}</p>
                  </div>
                </div>

                {op.isActive ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold">
                    Ativo
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs font-semibold">
                    Inativo
                  </Badge>
                )}
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1.5 text-slate-600">
                <p className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  Cargo: <span className="font-bold text-slate-900">{op.role?.name || "Operador"}</span>
                </p>

                {op.teacherSubjects && op.teacherSubjects.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-blue-600" /> Disciplinas:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {op.teacherSubjects.map((ts: any) => (
                        <span key={ts.id} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-medium">
                          {ts.subject?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {op.createdAt && (
                  <p className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1">
                    <Calendar className="w-3 h-3" />
                    Cadastrado em {format(new Date(op.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <Link href={`/operadores/${op.id}/editar`} className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 h-9">
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Editar Dados & Senha
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW (hidden md:block) */}
      <div className="hidden md:block rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Nome & Apelido</TableHead>
              <TableHead>Email de Acesso</TableHead>
              <TableHead>Cargo / Perfil</TableHead>
              <TableHead>Disciplinas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Nenhum operador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              operadores.map((op) => (
                <TableRow key={op.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xs">
                      {op.avatarUrl ? (
                        <img src={op.avatarUrl} alt={op.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{getInitials(op.name)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{op.name}</div>
                    {op.nickname && (
                      <div className="text-xs text-blue-700 font-semibold">&quot;{op.nickname}&quot;</div>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono text-xs">{op.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 font-medium">
                      <Shield className="mr-1 h-3 w-3 text-blue-600" />
                      {op.role?.name || "Operador"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {op.teacherSubjects && op.teacherSubjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {op.teacherSubjects.map((ts: any) => (
                          <span key={ts.id} className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded text-[11px] font-medium">
                            {ts.subject?.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {op.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/operadores/${op.id}/editar`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50">
                        <Edit className="mr-1 h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </Link>
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
