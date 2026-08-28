'use client';

import { useState } from "react";
import { getStudents } from "@/actions/student.actions";
import { saveAttendance, getAttendanceByClassAndSubject } from "@/actions/attendance.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function FrequenciaClient({ classes, subjects }: { classes: any[], subjects: any[] }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, { status: string, observation: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadClass = async () => {
    if (!selectedClass || !selectedSubject || !date) {
      toast.error("Preencha todos os campos para carregar a turma.");
      return;
    }
    setLoading(true);
    try {
      const result = await getStudents({ classGroupId: selectedClass, pageSize: 100 });
      const previousAttendance = await getAttendanceByClassAndSubject(selectedClass, selectedSubject, date);
      
      const attMap: Record<string, any> = {};
      previousAttendance.forEach((a: any) => {
        attMap[a.enrollmentId] = { status: a.status, observation: a.observation || "" };
      });

      result.students.forEach(st => {
        const enrollment = st.enrollments?.[0];
        if (enrollment && !attMap[enrollment.id]) {
          attMap[enrollment.id] = { status: "", observation: "" };
        }
      });
      
      setStudents(result.students);
      setAttendance(attMap);
      if(result.students.length === 0) {
        toast.info("Nenhum aluno encontrado para esta turma.");
      }
    } catch (error) {
      toast.error("Erro ao carregar turma.");
    } finally {
      setLoading(false);
    }
  };

  const markAll = (status: string) => {
    const newAtt = { ...attendance };
    Object.keys(newAtt).forEach(key => {
      newAtt[key].status = status;
    });
    setAttendance(newAtt);
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject || !date) return;
    setSaving(true);
    try {
      const records = Object.entries(attendance)
        .filter(([_, data]) => data.status !== "")
        .map(([enrollmentId, data]) => ({
          enrollmentId,
          status: data.status,
          observation: data.observation
        }));

      if (records.length === 0) {
        toast.error("Nenhuma frequência preenchida.");
        setSaving(false);
        return;
      }

      await saveAttendance({
        classGroupId: selectedClass,
        subjectId: selectedSubject,
        date,
        records
      });
      toast.success("Frequência salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar frequência.");
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    presentes: Object.values(attendance).filter(a => a.status === 'PRESENTE').length,
    ausentes: Object.values(attendance).filter(a => a.status === 'AUSENTE').length,
    justificados: Object.values(attendance).filter(a => a.status === 'JUSTIFICADO').length,
    total: students.length
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Turma</label>
          <select 
            className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          >
            <option value="">Selecione...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Disciplina</label>
          <select 
            className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
          >
            <option value="">Selecione...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button onClick={loadClass} disabled={loading} className="w-full bg-blue-800 hover:bg-blue-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Carregar Turma"}
          </Button>
        </div>
      </div>

      {students.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-4 rounded-lg mb-6 border">
            <div className="flex space-x-4 mb-4 sm:mb-0">
              <Button variant="outline" size="sm" onClick={() => markAll('PRESENTE')} className="text-green-600 border-green-200 hover:bg-green-50">
                Marcar Todos como Presentes
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll('')} className="text-slate-600">
                Limpar Todos
              </Button>
            </div>
            <div className="text-sm font-medium flex gap-3">
              <span className="text-green-600">{stats.presentes} Presentes</span>
              <span className="text-red-600">{stats.ausentes} Ausentes</span>
              <span className="text-amber-600">{stats.justificados} Justificados</span>
              <span className="text-slate-500">de {stats.total} Alunos</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold">Aluno</th>
                  <th className="px-4 py-3 font-semibold w-64 text-center">Status</th>
                  <th className="px-4 py-3 font-semibold w-1/3">Observação</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const enrollment = student.enrollments?.[0];
                  if (!enrollment) return null;
                  const att = attendance[enrollment.id] || { status: '', observation: '' };
                  
                  return (
                    <tr key={student.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.registration}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setAttendance(prev => ({...prev, [enrollment.id]: { ...att, status: 'PRESENTE' }}))}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${att.status === 'PRESENTE' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-green-100'}`}
                            title="Presente"
                          >P</button>
                          <button
                            onClick={() => setAttendance(prev => ({...prev, [enrollment.id]: { ...att, status: 'AUSENTE' }}))}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${att.status === 'AUSENTE' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-red-100'}`}
                            title="Ausente"
                          >F</button>
                          <button
                            onClick={() => setAttendance(prev => ({...prev, [enrollment.id]: { ...att, status: 'JUSTIFICADO' }}))}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${att.status === 'JUSTIFICADO' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-amber-100'}`}
                            title="Justificado"
                          >J</button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          placeholder="Ex: Atestado médico" 
                          value={att.observation}
                          onChange={(e) => setAttendance(prev => ({...prev, [enrollment.id]: { ...att, observation: e.target.value }}))}
                          className="text-sm"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end sticky bottom-4">
            <Button onClick={handleSave} disabled={saving} size="lg" className="bg-blue-800 hover:bg-blue-700 shadow-lg">
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
              Salvar Lançamento de Frequência
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
