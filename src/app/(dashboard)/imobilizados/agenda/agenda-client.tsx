"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Projector,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  User,
  RotateCcw,
  Play,
  XCircle,
  Loader2,
  Check,
  MapPin,
  LayoutGrid,
  ListFilter,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  createEquipmentBooking,
  cancelEquipmentBooking,
  checkOutEquipment,
  checkInEquipment,
} from "@/actions/equipment.actions";
import { toast } from "sonner";

interface AgendaClientProps {
  initialData: {
    date: string;
    equipments: any[];
    bookings: any[];
    slots: any[];
  };
  user: any;
}

export default function AgendaClient({ initialData, user }: AgendaClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialData.date);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"MOBILE_CARDS" | "TABLE">("MOBILE_CARDS");

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [modalEquipment, setModalEquipment] = useState<any>(null);
  const [modalSlot, setModalSlot] = useState<any>(null);
  const [classGroupName, setClassGroupName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Detail / Action Modal State
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [returnNotes, setReturnNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    router.push(`/imobilizados/agenda?data=${newDate}`);
  };

  const handleShiftDate = (days: number) => {
    const d = new Date(`${selectedDate}T00:00:00.000Z`);
    d.setDate(d.getDate() + days);
    const newDateStr = d.toISOString().split("T")[0];
    handleDateChange(newDateStr);
  };

  const handleOpenBookingModal = (equipment: any, slot: any) => {
    setModalEquipment(equipment);
    setModalSlot(slot);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEquipment || !modalSlot || !selectedDate) return;

    setSubmittingBooking(true);
    try {
      const res = await createEquipmentBooking({
        equipmentId: modalEquipment.id,
        date: selectedDate,
        classNumber: modalSlot.number,
        classGroupName,
        purpose,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao reservar horário.");
        return;
      }

      toast.success(`Reserva confirmada para ${modalSlot.label}!`);
      setIsBookingOpen(false);
      setClassGroupName("");
      setPurpose("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao realizar reserva.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleOpenDetailModal = (booking: any) => {
    setSelectedBooking(booking);
    setReturnNotes("");
    setIsDetailOpen(true);
  };

  const handleCheckOut = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const res = await checkOutEquipment(selectedBooking.id);
      if (res.success) {
        toast.success("Retirada registrada! Equipamento agora está 'Em Uso'.");
        setIsDetailOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao registrar retirada.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar retirada.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const res = await checkInEquipment(selectedBooking.id, returnNotes);
      if (res.success) {
        toast.success("Devolução registrada com sucesso! Equipamento liberado.");
        setIsDetailOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao registrar devolução.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar devolução.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    if (!confirm("Deseja realmente cancelar esta reserva de equipamento?")) return;

    setActionLoading(true);
    try {
      const res = await cancelEquipmentBooking(selectedBooking.id);
      if (res.success) {
        toast.success("Reserva cancelada com sucesso!");
        setIsDetailOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao cancelar reserva.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar reserva.");
    } finally {
      setActionLoading(false);
    }
  };

  // Find booking for specific equipment and slot number
  const getBookingForSlot = (equipmentId: string, slotNumber: number) => {
    return initialData.bookings.find(
      (b) => b.equipmentId === equipmentId && b.classNumber === slotNumber
    );
  };

  const formatDateDisplay = (dateString: string) => {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const currentSlotObj = initialData.slots.find(s => s.number === selectedSlotNumber) || initialData.slots[0];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/imobilizados">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
              <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
              Grade de Horários por Aula
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Disponibilidade, agendamento e liberação de equipamentos por aula.
            </p>
          </div>
        </div>

        {/* View Toggle (Mobile / Full Table) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewMode("MOBILE_CARDS")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "MOBILE_CARDS" ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Por Aula
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "TABLE" ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grade Completa
            </button>
          </div>

          <Link href="/imobilizados">
            <Button variant="outline" size="sm" className="text-xs h-8">
              Catálogo
            </Button>
          </Link>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="icon" onClick={() => handleShiftDate(-1)} className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-36 sm:w-44 font-semibold text-slate-800 text-xs sm:text-sm h-9"
            />
            <Button variant="outline" size="icon" onClick={() => handleShiftDate(1)} className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDateChange(new Date().toISOString().split("T")[0])}
              className="text-xs ml-auto sm:ml-2 h-9"
            >
              Hoje
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
              <span>Livre</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span>
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
              <span>Em Uso</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VIEW MODE 1: MOBILE TOUCH CARDS BY CLASS SLOT (Ultra Fast on Phones!) */}
      {viewMode === "MOBILE_CARDS" && (
        <div className="space-y-4">
          {/* Class Slot Horizontal Selector Pills (Swipeable on mobile) */}
          <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max">
              {initialData.slots.map((slot) => {
                const isSelected = slot.number === selectedSlotNumber;
                return (
                  <button
                    key={slot.number}
                    onClick={() => setSelectedSlotNumber(slot.number)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center ${
                      isSelected
                        ? "bg-blue-800 text-white shadow-md shadow-blue-800/30 ring-2 ring-blue-800"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{slot.label}</span>
                    <span className={`text-[10px] mt-0.5 font-normal ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                      {slot.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot Header Banner */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-900 uppercase">
                {currentSlotObj.label} ({currentSlotObj.time}) — {currentSlotObj.shift}
              </p>
              <p className="text-[11px] text-blue-700">
                Data: {formatDateDisplay(selectedDate)}
              </p>
            </div>
            <Badge className="bg-blue-800 text-white text-xs">
              {initialData.equipments.length} Equipamentos
            </Badge>
          </div>

          {/* Equipment Cards List for the Selected Slot */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {initialData.equipments.map((equipment) => {
              const booking = getBookingForSlot(equipment.id, selectedSlotNumber);
              const isReserved = !!booking;
              const isEmUso = booking?.status === "EM_USO";
              const isMaintenance = equipment.status === "MANUTENCAO";

              return (
                <Card 
                  key={equipment.id} 
                  className={`border shadow-sm transition-all ${
                    isEmUso ? "border-amber-300 bg-amber-50/20" :
                    isReserved ? "border-blue-300 bg-blue-50/20" :
                    isMaintenance ? "border-red-200 bg-red-50/20 opacity-70" :
                    "border-emerald-200 bg-white"
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{equipment.name}</h4>
                        <p className="text-xs font-mono text-blue-700 font-semibold">{equipment.code}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {equipment.location}
                        </p>
                      </div>

                      <div>
                        {isMaintenance ? (
                          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Manutenção</Badge>
                        ) : isEmUso ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs font-bold">Em Uso</Badge>
                        ) : isReserved ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs font-bold">Reservado</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold">Disponível</Badge>
                        )}
                      </div>
                    </div>

                    {/* Booking Details if occupied */}
                    {booking && (
                      <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200 text-xs space-y-1">
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          {booking.operator?.name || "Professor"}
                        </p>
                        {booking.classGroupName && (
                          <p className="text-slate-600">Turma: {booking.classGroupName}</p>
                        )}
                        {booking.purpose && (
                          <p className="text-slate-500 italic truncate">Finalidade: {booking.purpose}</p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-1">
                      {isMaintenance ? (
                        <p className="text-xs text-red-600 italic">Equipamento indisponível no momento.</p>
                      ) : isEmUso ? (
                        <Button
                          size="sm"
                          onClick={() => handleOpenDetailModal(booking)}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-10 shadow-sm"
                        >
                          <RotateCcw className="w-4 h-4 mr-1.5" />
                          Registrar Devolução / Liberar
                        </Button>
                      ) : isReserved ? (
                        <Button
                          size="sm"
                          onClick={() => handleOpenDetailModal(booking)}
                          className="w-full bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold h-10 shadow-sm"
                        >
                          <Play className="w-4 h-4 mr-1.5" />
                          Gerenciar / Retirar Equipamento
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOpenBookingModal(equipment, currentSlotObj)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 shadow-sm"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Reservar para {currentSlotObj.label}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FULL SCHEDULE MATRIX TABLE (With Smooth Touch Scroll) */}
      {viewMode === "TABLE" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-900 text-white text-xs">
                  <th className="p-3.5 font-bold uppercase w-60 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                    Equipamento / Patrimônio
                  </th>
                  {initialData.slots.map((slot) => (
                    <th key={slot.number} className="p-2.5 text-center border-l border-slate-800 font-medium">
                      <div className="font-bold text-white text-xs">{slot.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{slot.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {initialData.equipments.map((equipment) => (
                  <tr key={equipment.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Equipment Column (Sticky Left) */}
                    <td className="p-3.5 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-sm font-medium">
                      <div className="font-bold text-slate-900 text-sm">{equipment.name}</div>
                      <div className="text-xs font-mono text-blue-700 font-semibold">{equipment.code}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{equipment.location}</span>
                      </div>
                    </td>

                    {/* Slot Columns (1ª to 9ª Aula) */}
                    {initialData.slots.map((slot) => {
                      const booking = getBookingForSlot(equipment.id, slot.number);

                      if (booking) {
                        const isEmUso = booking.status === "EM_USO";
                        return (
                          <td key={slot.number} className="p-1.5 border-l border-slate-200 align-middle">
                            <button
                              onClick={() => handleOpenDetailModal(booking)}
                              className={`w-full h-16 p-2 rounded-lg text-left text-white shadow-sm transition-all hover:opacity-90 flex flex-col justify-between ${
                                isEmUso
                                  ? "bg-amber-600 border-amber-700"
                                  : "bg-blue-800 border-blue-900"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-bold truncate text-[11px]">
                                  {booking.operator?.name?.split(" ")[0] || "Prof."}
                                </span>
                                <Badge className={`text-[9px] px-1 py-0 ${isEmUso ? "bg-amber-800" : "bg-blue-950"}`}>
                                  {isEmUso ? "Em Uso" : "Reservado"}
                                </Badge>
                              </div>
                              <div className="text-[10px] text-blue-100 truncate">
                                {booking.classGroupName || "Turma não informada"}
                              </div>
                            </button>
                          </td>
                        );
                      }

                      // Available Slot
                      return (
                        <td key={slot.number} className="p-1.5 border-l border-slate-200 align-middle">
                          <button
                            onClick={() => handleOpenBookingModal(equipment, slot)}
                            disabled={equipment.status === "MANUTENCAO"}
                            className="w-full h-16 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 transition-colors flex flex-col items-center justify-center gap-1 group disabled:opacity-40 disabled:cursor-not-allowed"
                            title={`Reservar para ${slot.label}`}
                          >
                            <Plus className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-semibold text-emerald-700">Livre</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Agendamento Rápido Direto */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmBooking}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-900">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Reservar {modalSlot?.label}
              </DialogTitle>
              <DialogDescription>
                Reserva de <strong>{modalEquipment?.name}</strong> em{" "}
                <strong>{formatDateDisplay(selectedDate)}</strong> ({modalSlot?.time}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agendaClass">Turma / Local de Uso *</Label>
                <Input
                  id="agendaClass"
                  placeholder="Ex: 2º Ano B - Manhã, Auditório, etc."
                  value={classGroupName}
                  onChange={(e) => setClassGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agendaPurpose">Disciplina / Finalidade</Label>
                <Input
                  id="agendaPurpose"
                  placeholder="Ex: Exibição de documentário de Geografia"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
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

      {/* Modal: Detalhes e Ações da Reserva (Retirar / Devolver / Cancelar) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center justify-between">
              <span>Detalhes da Reserva</span>
              <Badge className={selectedBooking?.status === "EM_USO" ? "bg-amber-600" : "bg-blue-700"}>
                {selectedBooking?.status === "EM_USO" ? "Em Uso" : "Reservado"}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-2 text-sm">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <p>
                  <strong>Equipamento:</strong> {selectedBooking.equipment?.name} (
                  {selectedBooking.equipment?.code})
                </p>
                <p>
                  <strong>Professor/Solicitante:</strong> {selectedBooking.operator?.name}
                </p>
                <p>
                  <strong>Horário:</strong> {selectedBooking.classNumber}ª Aula ({formatDateDisplay(selectedDate)})
                </p>
                {selectedBooking.classGroupName && (
                  <p>
                    <strong>Turma/Local:</strong> {selectedBooking.classGroupName}
                  </p>
                )}
                {selectedBooking.purpose && (
                  <p>
                    <strong>Finalidade:</strong> {selectedBooking.purpose}
                  </p>
                )}
              </div>

              {selectedBooking.status === "EM_USO" ? (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="modalReturnNotes">Observações na Devolução (Opcional)</Label>
                  <Input
                    id="modalReturnNotes"
                    placeholder="Ex: Entregue sem avarias e com todos os cabos."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                  />
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            {selectedBooking?.status === "RESERVADO" && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelBooking}
                  disabled={actionLoading}
                  className="w-full sm:w-auto"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar Reserva
                </Button>
                <Button
                  size="sm"
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Registrar Retirada (Em Uso)
                </Button>
              </>
            )}

            {selectedBooking?.status === "EM_USO" && (
              <Button
                size="sm"
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Confirmar Devolução
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
