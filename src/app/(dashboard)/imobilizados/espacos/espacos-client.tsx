"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, Clock, Plus, MapPin, Users, CheckCircle, Save, Loader2, FileSpreadsheet, Projector } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createSpaceBooking } from "@/actions/spaces.actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface EspacosClientProps {
  spaces: any[];
  bookings: any[];
}

export default function EspacosClient({ spaces, bookings }: EspacosClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [spaceId, setSpaceId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [classNumber, setClassNumber] = useState("1");
  const [classGroupName, setClassGroupName] = useState("");
  const [purpose, setPurpose] = useState("");

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceId || !date || !purpose) {
      toast.error("Preencha o espaço, data e finalidade.");
      return;
    }

    setLoading(true);
    try {
      const res = await createSpaceBooking({
        spaceId,
        date,
        classNumber: Number(classNumber) || 1,
        classGroupName,
        purpose,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao agendar espaço.");
        return;
      }

      toast.success("Espaço pedagógico reservado com sucesso!");
      setShowModal(false);
      setPurpose("");
      setClassGroupName("");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao agendar espaço.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Link href="/imobilizados">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
              <Building2 className="h-7 w-7 text-blue-600" />
              Reserva de Espaços Pedagógicos & Laboratórios
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Agendamento de LEI, Laboratório de Ciências, Biblioteca, Auditório e Quadra.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/imobilizados/relatorio">
            <Button size="sm" variant="outline" className="font-semibold text-xs border-blue-200 text-blue-800 hover:bg-blue-50">
              <FileSpreadsheet className="mr-1.5 h-4 w-4" />
              Relatório Geral de Reservas
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowModal(true)} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs">
            <Plus className="mr-1.5 h-4 w-4" />
            Reservar Espaço
          </Button>
        </div>
      </div>

      {/* Modal / Form */}
      {showModal && (
        <Card className="border-blue-200 bg-blue-50/50 shadow-md">
          <form onSubmit={handleBooking}>
            <CardHeader className="pb-3 border-b border-blue-100">
              <CardTitle className="text-base text-blue-950">Nova Reserva de Espaço</CardTitle>
              <CardDescription className="text-xs">
                Selecione o ambiente, data e horário de aula desejado.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="space" className="text-xs font-semibold text-slate-700">Espaço / Laboratório *</Label>
                  <select
                    id="space"
                    value={spaceId}
                    onChange={(e) => setSpaceId(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                  >
                    <option value="">Selecione o espaço...</option>
                    {spaces.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name} ({sp.category} - {sp.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-semibold text-slate-700">Data da Aula *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="aula" className="text-xs font-semibold text-slate-700">Horário da Aula *</Label>
                  <select
                    id="aula"
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}ª Aula ({n <= 4 ? "Manhã" : n <= 8 ? "Tarde" : "Noite"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="turma" className="text-xs font-semibold text-slate-700">Turma Atendida</Label>
                  <Input
                    id="turma"
                    value={classGroupName}
                    onChange={(e) => setClassGroupName(e.target.value)}
                    placeholder="Ex: 3º Ano B - Informática"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purpose" className="text-xs font-semibold text-slate-700">Finalidade da Reserva *</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Ex: Aula prática de Biologia, Pesquisa orientada no LEI..."
                  required
                  className="h-10 text-xs"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} size="sm" className="bg-blue-800 hover:bg-blue-700 font-bold text-xs">
                {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                Confirmar Agendamento
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Spaces Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((sp) => (
          <Card key={sp.id} className="border-slate-200 shadow-sm hover:border-blue-300 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge className="bg-blue-100 text-blue-800 text-[10px]">
                  {sp.category}
                </Badge>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Users className="w-3 h-3 text-slate-400" />
                  Capacidade: {sp.capacity} alunos
                </span>
              </div>
              <CardTitle className="text-base font-bold text-slate-900 mt-1">
                {sp.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Local: {sp.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 border-t border-slate-100 space-y-2">
              {sp.resources && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border">
                  <strong>Recursos:</strong> {sp.resources}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings Timeline */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Agendamentos de Espaços Recentes ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhuma reserva de espaço registrada para este período.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.map((b: any) => (
                <div key={b.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{b.space?.name}</span>
                      <Badge className="bg-blue-100 text-blue-800 text-[10px]">
                        {b.classNumber}ª Aula
                      </Badge>
                      {b.classGroupName && (
                        <span className="text-xs text-slate-500">({b.classGroupName})</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Finalidade: <strong>{b.purpose}</strong> • Solicitado por: {b.operator?.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-mono">
                      {format(new Date(b.date), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <div className="text-[10px] text-emerald-700 font-bold">
                      {b.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
