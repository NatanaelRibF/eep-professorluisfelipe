"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  User, 
  Phone, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  School,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createStudentExitPass } from "@/actions/liberacao.actions";
import { toast } from "sonner";
import { format } from "date-fns";

const QUICK_REASONS = [
  "Consulta Médica / Exames",
  "Mal-estar / Enfermidade",
  "Assunto Familiar Urgente",
  "Autorização dos Pais via Contato Telefônico",
  "Compromisso Pessoal Justificado",
  "Liberação Antecipada da Turma",
];

export default function LiberacaoFormClient({
  classes,
  students,
}: {
  classes: any[];
  students: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [type, setType] = useState("SAIDA_ANTECIPADA");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  // Current time in HH:mm format
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [time, setTime] = useState(defaultTime);

  const [reason, setReason] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [accompaniedBy, setAccompaniedBy] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [observation, setObservation] = useState("");

  // Filter students based on class selection
  const filteredStudents = selectedClassId
    ? students.filter((s) => s.enrollments?.some((e: any) => e.classGroupId === selectedClassId))
    : students;

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    const student = students.find((s) => s.id === studentId);
    if (student) {
      if (student.guardianName && !authorizedBy) {
        setAuthorizedBy(student.guardianName);
      }
      if (student.guardianPhone && !guardianContact) {
        setGuardianContact(student.guardianPhone);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Por favor, selecione um estudante.");
      return;
    }
    if (!reason.trim() || !authorizedBy.trim() || !time) {
      toast.error("Preencha o motivo, horário e quem autorizou a saída.");
      return;
    }

    setLoading(true);
    try {
      const res = await createStudentExitPass({
        studentId: selectedStudentId,
        type,
        date,
        time,
        reason: reason.trim(),
        authorizedBy: authorizedBy.trim(),
        accompaniedBy: accompaniedBy.trim() || undefined,
        guardianContact: guardianContact.trim() || undefined,
        observation: observation.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao emitir passe de liberação.");
        return;
      }

      toast.success("✅ Passe de liberação emitido com sucesso!");
      router.push("/liberacao");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar liberação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/liberacao">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-500">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-blue-900">
            Emitir Passe de Liberação de Aluno
          </h1>
          <p className="text-xs text-slate-500">
            Registre a autorização de saída para controle de portaria e histórico do estudante.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Student Selection */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="p-4 sm:p-6 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <User className="h-5 w-5 text-blue-600" />
              1. Seleção do Estudante
            </CardTitle>
            <CardDescription className="text-xs">
              Selecione a turma para filtrar e escolha o aluno a ser liberado.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Filtrar por Turma</Label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedStudentId("");
                  }}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as turmas...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.shift === "MANHA" ? "Manhã" : cls.shift === "TARDE" ? "Tarde" : "Noite"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Estudante <span className="text-red-500">*</span>
                </Label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione o estudante...</option>
                  {filteredStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} (Matrícula: {st.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Student Preview Badge */}
            {selectedStudent && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-3">
                <div className="h-12 w-12 rounded-full border border-blue-200 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                  {selectedStudent.photoUrl ? (
                    <img src={selectedStudent.photoUrl} alt={selectedStudent.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{selectedStudent.name?.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm">{selectedStudent.name}</div>
                  <div className="text-slate-600 font-mono">
                    Matrícula: {selectedStudent.registrationNumber} • Responsável: {selectedStudent.guardianName || "Não informado"}
                  </div>
                  {selectedStudent.guardianPhone && (
                    <div className="text-blue-800 font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Contato: {selectedStudent.guardianPhone}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Pass Details */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="p-4 sm:p-6 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <Clock className="h-5 w-5 text-blue-600" />
              2. Dados da Liberação e Autorização
            </CardTitle>
            <CardDescription className="text-xs">
              Informe data, horário, motivo e quem autorizou a saída do aluno.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Tipo de Liberação</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SAIDA_ANTECIPADA">Saída Antecipada</option>
                  <option value="ENTRADA_TARDIA">Entrada Tardia</option>
                  <option value="LIBERACAO_TURMA">Liberação Coletiva da Turma</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Data</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Horário Autorizado <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-10 text-xs sm:text-sm font-bold"
                  required
                />
              </div>
            </div>

            {/* Motivo & Quick Buttons */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Motivo da Saída <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Consulta médica, Mal-estar, Assunto familiar..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 text-xs sm:text-sm"
                required
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_REASONS.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => setReason(qr)}
                    className="text-[11px] bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
                  >
                    + {qr}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Autorizado por (Responsável) <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: Maria da Silva (Mãe)"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Telefone do Responsável
                </Label>
                <Input
                  placeholder="(88) 99999-9999"
                  value={guardianContact}
                  onChange={(e) => setGuardianContact(e.target.value)}
                  className="h-10 text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Acompanhante na Saída
                </Label>
                <Input
                  placeholder="Ex: Pai, Tio, Saiu desacompanhado..."
                  value={accompaniedBy}
                  onChange={(e) => setAccompaniedBy(e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-semibold text-slate-700">
                Observações Adicionais (Opcional)
              </Label>
              <Textarea
                placeholder="Detalhes adicionais, orientações para a portaria ou justificativas médicas..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={2}
                className="text-xs sm:text-sm"
              />
            </div>
          </CardContent>

          <CardFooter className="p-4 sm:p-6 bg-slate-50 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/liberacao" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto text-xs h-10">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-sm w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Emitindo Passe...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Emitir e Salvar Passe de Liberação
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
