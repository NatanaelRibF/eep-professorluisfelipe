'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudents } from "@/actions/student.actions";
import { createRAC } from "@/actions/rac.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RacFormClient({ classes, racTypes }: { classes: any[], racTypes: any[] }) {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [enrollmentId, setEnrollmentId] = useState("");
  const [racTypeId, setRacTypeId] = useState("");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
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
      } catch (error) {
        toast.error("Erro ao carregar alunos.");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentId || !racTypeId || !date) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      await createRAC({
        enrollmentId,
        racTypeId,
        date,
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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Turma *</label>
          <select 
            className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            required
          >
            <option value="">Selecione a turma...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Aluno *</label>
          <select 
            className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={enrollmentId} onChange={e => setEnrollmentId(e.target.value)}
            required
            disabled={!selectedClass || loadingStudents}
          >
            <option value="">
              {loadingStudents ? "Carregando..." : !selectedClass ? "Selecione uma turma primeiro" : "Selecione o aluno..."}
            </option>
            {students.map(s => {
              const enrollment = s.enrollments?.[0];
              if (!enrollment) return null;
              return <option key={enrollment.id} value={enrollment.id}>{s.name} ({s.registration})</option>
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de RAC *</label>
          <select 
            className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={racTypeId} onChange={e => setRacTypeId(e.target.value)}
            required
          >
            <option value="">Selecione o tipo...</option>
            {racTypes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.severity})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data *</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição da Conduta</label>
        <Textarea 
          placeholder="Descreva com detalhes a ocorrência..." 
          value={description} onChange={e => setDescription(e.target.value)}
          rows={5}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting} className="bg-blue-800 hover:bg-blue-700">
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Registro
        </Button>
      </div>
    </form>
  );
}
