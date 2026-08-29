"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Projector,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
  User,
  History,
  RotateCcw,
  Check,
  CalendarCheck,
  Tag,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEquipment } from "@/actions/equipment.actions";
import { toast } from "sonner";

interface ImobilizadoDetailClientProps {
  equipment: any;
  user: any;
}

export default function ImobilizadoDetailClient({
  equipment,
  user,
}: ImobilizadoDetailClientProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(equipment.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    setUpdatingStatus(true);
    try {
      const res = await updateEquipment(equipment.id, { status: newStatus });
      if (res.success) {
        toast.success(`Status alterado para ${newStatus}!`);
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao atualizar status.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISPONIVEL":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Disponível
          </Badge>
        );
      case "EM_USO":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-medium">
            <Clock className="w-3.5 h-3.5 mr-1" /> Em Uso no Momento
          </Badge>
        );
      case "MANUTENCAO":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Em Manutenção
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateDisplay = (dateString: string | Date) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDateTimeDisplay = (dateString: string | Date) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/imobilizados">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">
                {equipment.name}
              </h1>
              {getStatusBadge(currentStatus)}
            </div>
            <p className="text-xs sm:text-sm font-mono text-blue-700 font-semibold mt-0.5">
              Patrimônio: {equipment.code} • Categoria: {equipment.category}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href={`/imobilizados/agenda`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-blue-800 hover:bg-blue-700 shadow-sm text-xs">
              <CalendarDays className="mr-1.5 h-4 w-4" />
              Ver na Grade de Horários
            </Button>
          </Link>
        </div>
      </div>

      {/* Equipment Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 md:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-800 flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" />
              Especificações e Guarda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Local de Guarda</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {equipment.location}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Marca & Modelo</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {equipment.brand || "-"} {equipment.model ? `• ${equipment.model}` : ""}
                </p>
              </div>
            </div>

            {equipment.description && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground uppercase font-medium">Acessórios / Observações</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1">
                  {equipment.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Alterar Status Rápido
            </CardTitle>
            <CardDescription className="text-xs">
              Atualize a condição operacional deste equipamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="statusSelect">Status Operacional</Label>
              <Select value={currentStatus} onValueChange={handleStatusChange} disabled={updatingStatus}>
                <SelectTrigger id="statusSelect">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISPONIVEL">🟢 Disponível</SelectItem>
                  <SelectItem value="EM_USO">🟡 Em Uso</SelectItem>
                  <SelectItem value="MANUTENCAO">🔴 Em Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Ao alterar para 'Em Manutenção', o equipamento não aceitará novas reservas na grade.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage History Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Histórico Completo de Agendamentos & Utilização
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Registro cronológico de todos os professores que reservaram e utilizaram este patrimônio.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {equipment.bookings?.length || 0} registros
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="p-3">Data</th>
                  <th className="p-3">Horário / Aula</th>
                  <th className="p-3">Professor / Solicitante</th>
                  <th className="p-3">Turma / Local</th>
                  <th className="p-3">Finalidade</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Devolução / Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipment.bookings?.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-medium text-slate-900">
                      {formatDateDisplay(booking.date)}
                    </td>
                    <td className="p-3 font-semibold text-blue-700">
                      {booking.classNumber}ª Aula
                    </td>
                    <td className="p-3 text-slate-800 font-medium flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {booking.operator?.name}
                    </td>
                    <td className="p-3 text-slate-600">
                      {booking.classGroupName || "-"}
                    </td>
                    <td className="p-3 text-slate-600 max-w-[200px] truncate" title={booking.purpose}>
                      {booking.purpose || "-"}
                    </td>
                    <td className="p-3">
                      {booking.status === "CONCLUIDO" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Concluído</Badge>
                      ) : booking.status === "EM_USO" ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">Em Uso</Badge>
                      ) : booking.status === "CANCELADO" ? (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200">Cancelado</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Reservado</Badge>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      {booking.returnNotes ? (
                        <span className="text-slate-700">{booking.returnNotes}</span>
                      ) : booking.checkedInAt ? (
                        <span>Devolvido em {formatDateTimeDisplay(booking.checkedInAt)}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!equipment.bookings || equipment.bookings.length === 0) && (
            <div className="text-center py-10 text-slate-400">
              <History className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p>Nenhum registro de uso para este equipamento ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
