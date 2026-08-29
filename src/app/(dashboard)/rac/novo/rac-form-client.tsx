'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStudents } from "@/actions/student.actions";
import { createRAC } from "@/actions/rac.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function RacFormClient({ classes, racTypes }: { classes: any[], racTypes: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const paramTurmaId = searchParams.get('turmaId') || "";
  const paramEnrollmentId = searchParams.get('enrollmentId') || "";
  const paramAlunoId = searchParams.get('alunoId') || "";

  const [selectedClass, setSelectedClass] = useState(paramTurmaId);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State (with Date and Time)
  const [enrollmentId, setEnrollmentId] = useState(paramEnrollmentId);
  const [racTypeId, setRacTypeId] = useState("");
  const [dateTime, setDateTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setEnrollmentId("");
      return;
    }
    
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const result = await getStudents({ classGroupId: selectedClass, pageSize: 100 });
        setStudents(result.students);

        // Auto-select student if param is present
        if (paramEnrollmentId) {
          setEnrollmentId(paramEnrollmentId);
        } else if (paramAlunoId) {
          const found = result.students.find(s => s.id === paramAlunoId);
          if (found?.enrollments?.[0]?.id) {
            setEnrollmentId(found.enrollments[0].id);
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar alunos.");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedClass, paramEnrollmentId, paramAlunoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentId || !racTypeId || !dateTime) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      await createRAC({
        enrollmentId,
        racTypeId,
        date: dateTime,
        description
      });
      toast.success("RAC registrado com sucesso!");
      router.push("/rac");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao registrar RAC.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Turma *</label>
          <select 
            className="w-full flex h-11 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
            required
          >
            <option value="">Selecione a turma...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Aluno *</label>
          <select 
            className="w-full flex h-11 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            value={enrollmentId} 
            onChange={e => setEnrollmentId(e.target.value)}
            required
            disabled={!selectedClass || loadingStudents}
          >
            <option value="">
              {loadingStudents ? "Carregando alunos..." : !selectedClass ? "Selecione uma turma primeiro" : "Selecione o aluno..."}
            </option>
            {students.map(s => {
              const enrollment = s.enrollments?.[0];
              if (!enrollment) return null;
              return <option key={enrollment.id} value={enrollment.id}>{s.name} ({s.registrationNumber || s.registration})</option>
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo de RAC *</label>
          <select 
            className="w-full flex h-11 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            value={racTypeId} 
            onChange={e => setRacTypeId(e.target.value)}
            required
          >
            <option value="">Selecione o tipo de conduta...</option>
            {racTypes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.severity})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Data e Hora do Fato *</label>
          <Input 
            type="datetime-local" 
            value={dateTime} 
            onChange={e => setDateTime(e.target.value)} 
            className="h-11 font-mono text-sm" 
            required 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Descrição Detalhada da Conduta</label>
        <Textarea 
          placeholder="Descreva com detalhes o acompanhamento em sala de aula..." 
          value={description} 
          onChange={e => setDescription(e.target.value)}
          rows={4}
          className="text-sm"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting} className="h-11">
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting} className="bg-blue-800 hover:bg-blue-700 h-11 font-bold">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Salvar Registro RAC
        </Button>
      </div>
    </form>
  );
}
