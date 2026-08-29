"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Projector,
  Speaker,
  Mic,
  Laptop,
  Tv,
  Plus,
  CalendarDays,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  User,
  MapPin,
  CalendarCheck,
  Check,
  RotateCcw,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLASS_SLOTS } from "@/lib/constants";
import { createEquipmentBooking, checkInEquipment, checkOutEquipment } from "@/actions/equipment.actions";
import { toast } from "sonner";

interface ImobilizadosClientProps {
  initialEquipments: any[];
  user: any;
}

export default function ImobilizadosClient({ initialEquipments, user }: ImobilizadosClientProps) {
  const router = useRouter();
  const [equipments, setEquipments] = useState(initialEquipments);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedEquipmentForBooking, setSelectedEquipmentForBooking] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookingClassNumber, setBookingClassNumber] = useState("1");
  const [bookingClassGroup, setBookingClassGroup] = useState("");
  const [bookingPurpose, setBookingPurpose] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Return / CheckIn Modal State
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState<any>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "projetor":
        return <Projector className="h-5 w-5 text-blue-600" />;
      case "caixa de som":
        return <Speaker className="h-5 w-5 text-purple-600" />;
      case "microfone":
        return <Mic className="h-5 w-5 text-amber-600" />;
      case "notebook":
        return <Laptop className="h-5 w-5 text-emerald-600" />;
      case "televisor":
      case "tv":
        return <Tv className="h-5 w-5 text-indigo-600" />;
      default:
        return <Layers className="h-5 w-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISPONIVEL":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Disponível
          </Badge>
        );
      case "EM_USO":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-medium">
            <Clock className="w-3 h-3 mr-1" /> Em Uso Agora
          </Badge>
        );
      case "MANUTENCAO":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 font-medium">
            <AlertTriangle className="w-3 h-3 mr-1" /> Em Manutenção
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filtered equipments
  const filteredEquipments = equipments.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Statistics
  const totalCount = equipments.length;
  const availableCount = equipments.filter((e) => e.status === "DISPONIVEL").length;
  const inUseCount = equipments.filter((e) => e.status === "EM_USO").length;
  const maintenanceCount = equipments.filter((e) => e.status === "MANUTENCAO").length;

  const handleOpenBooking = (equipment: any) => {
    setSelectedEquipmentForBooking(equipment);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipmentForBooking || !bookingDate || !bookingClassNumber) {
      toast.error("Preencha todos os campos da reserva.");
      return;
    }

    setSubmittingBooking(true);
    try {
      const res = await createEquipmentBooking({
        equipmentId: selectedEquipmentForBooking.id,
        date: bookingDate,
        classNumber: Number(bookingClassNumber),
        classGroupName: bookingClassGroup,
        purpose: bookingPurpose,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao realizar reserva.");
        return;
      }

      toast.success("Reserva realizada com sucesso!");
      setIsBookingOpen(false);
      setBookingPurpose("");
      setBookingClassGroup("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao realizar reserva.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    try {
      const res = await checkOutEquipment(bookingId);
      if (res.success) {
        toast.success("Retirada do equipamento registrada com sucesso!");
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao registrar retirada.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar retirada.");
    }
  };

  const handleOpenReturn = (booking: any) => {
    setSelectedBookingForReturn(booking);
    setIsReturnOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedBookingForReturn) return;
    setSubmittingReturn(true);
    try {
      const res = await checkInEquipment(selectedBookingForReturn.id, returnNotes);
      if (res.success) {
        toast.success("Devolução registrada com sucesso!");
        setIsReturnOpen(false);
        setReturnNotes("");
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao registrar devolução.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar devolução.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <Projector className="h-8 w-8 text-blue-600" />
            Imobilizados & Equipamentos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Controle de patrimônio, status de uso em tempo real e agendamento por aula para professores.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Link href="/imobilizados/agenda" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-blue-600 text-blue-700 hover:bg-blue-50">
              <CalendarDays className="mr-2 h-4 w-4 text-blue-600" />
              Grade de Horários por Aula
            </Button>
          </Link>
          <Link href="/imobilizados/novo" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-blue-800 hover:bg-blue-700 shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Equipamento
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Total de Itens</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Layers className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700 uppercase">Disponíveis</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{availableCount}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700 uppercase">Em Uso Agora</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">{inUseCount}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-700 uppercase">Em Manutenção</p>
              <p className="text-2xl font-bold text-red-800 mt-1">{maintenanceCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, patrimônio ou local..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as Categorias</SelectItem>
                <SelectItem value="Projetor">Projetor</SelectItem>
                <SelectItem value="Caixa de Som">Caixa de Som</SelectItem>
                <SelectItem value="Microfone">Microfone</SelectItem>
                <SelectItem value="Notebook">Notebook</SelectItem>
                <SelectItem value="Televisor">Televisor / Monitor</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Status</SelectItem>
                <SelectItem value="DISPONIVEL">🟢 Disponível</SelectItem>
                <SelectItem value="EM_USO">🟡 Em Uso</SelectItem>
                <SelectItem value="MANUTENCAO">🔴 Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipments.map((equipment) => {
          const lastBooking = equipment.bookings?.[0];
          const isCurrentlyInUse = equipment.status === "EM_USO";

          return (
            <Card key={equipment.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 rounded-lg">
                        {getCategoryIcon(equipment.category)}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                          {equipment.name}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono text-blue-700 font-semibold mt-0.5">
                          {equipment.code}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(equipment.status)}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3 text-sm">
                  <div className="flex items-center text-slate-600 gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{equipment.location}</span>
                  </div>

                  {equipment.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                      {equipment.description}
                    </p>
                  )}

                  {/* Real-time usage / Last user info */}
                  <div className="mt-3 p-3 rounded-lg border text-xs space-y-1.5 bg-slate-50/70 border-slate-200">
                    <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                      {isCurrentlyInUse ? "Em uso no momento por:" : "Último registro de uso:"}
                    </p>
                    {lastBooking ? (
                      <div>
                        <p className="font-medium text-slate-900">
                          {lastBooking.operator?.name || "Operador"}
                        </p>
                        <p className="text-slate-500">
                          {lastBooking.classNumber}ª Aula {lastBooking.classGroupName ? `(${lastBooking.classGroupName})` : ""}
                          {lastBooking.purpose ? ` • ${lastBooking.purpose}` : ""}
                        </p>
                        {isCurrentlyInUse && (
                          <div className="mt-2 pt-2 border-t border-slate-200 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReturn(lastBooking)}
                              className="w-full text-xs h-7 bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Registrar Devolução
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Sem registros de agendamento recentes</p>
                    )}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link href={`/imobilizados/${equipment.id}`} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-slate-700">
                    Ver Histórico
                  </Button>
                </Link>

                <Button
                  size="sm"
                  onClick={() => handleOpenBooking(equipment)}
                  disabled={equipment.status === "MANUTENCAO"}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-xs shadow-sm"
                >
                  <CalendarCheck className="h-3.5 w-3.5 mr-1" />
                  Reservar Aula
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredEquipments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-8">
          <Projector className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">Nenhum equipamento encontrado</h3>
          <p className="text-slate-500 text-sm mt-1">Tente ajustar os filtros ou cadastre um novo item.</p>
        </div>
      )}

      {/* Modal: Reserva de Aula */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmBooking}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-900">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
                Agendar Uso de Equipamento
              </DialogTitle>
              <DialogDescription>
                Selecione o dia e o horário de aula para reservar <strong>{selectedEquipmentForBooking?.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bookDate">Data do Uso *</Label>
                <Input
                  id="bookDate"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookSlot">Horário / Aula *</Label>
                <Select value={bookingClassNumber} onValueChange={setBookingClassNumber} required>
                  <SelectTrigger id="bookSlot">
                    <SelectValue placeholder="Selecione a aula" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_SLOTS.map((slot) => (
                      <SelectItem key={slot.number} value={slot.number.toString()}>
                        {slot.label} ({slot.time}) - {slot.shift}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookClass">Turma / Local de Uso</Label>
                <Input
                  id="bookClass"
                  placeholder="Ex: 1º Ano A - Redes, Auditório, etc."
                  value={bookingClassGroup}
                  onChange={(e) => setBookingClassGroup(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookPurpose">Finalidade / Disciplina</Label>
                <Input
                  id="bookPurpose"
                  placeholder="Ex: Apresentação de seminário de História"
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsBookingOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={submittingBooking}>
                {submittingBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Confirmar Reserva
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Devolução de Equipamento */}
      <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              Registrar Devolução de Equipamento
            </DialogTitle>
            <DialogDescription>
              Confirme a devolução do item e registre qualquer observação sobre o estado do equipamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="returnNotes">Observações do Estado / Acessórios (Opcional)</Label>
              <Input
                id="returnNotes"
                placeholder="Ex: Devolvido com cabo HDMI e controle em perfeito estado."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmReturn}
              className="bg-emerald-700 hover:bg-emerald-800"
              disabled={submittingReturn}
            >
              {submittingReturn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Confirmar Devolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
