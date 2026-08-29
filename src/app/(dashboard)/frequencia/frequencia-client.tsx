'use client';

import { useState } from "react";
import { getStudents } from "@/actions/student.actions";
import { saveAttendance, getAttendanceByClassAndSubject } from "@/actions/attendance.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, CheckCircle, Check, X, AlertTriangle, Users, ClipboardCheck, Sparkles } from "lucide-react";
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
      toast.error("Preencha turma, disciplina e data para carregar.");
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
          attMap[enrollment.id] = { status: "PRESENTE", observation: "" }; // Default to PRESENTE for teacher speed
        }
      });
      
      setStudents(result.students);
      setAttendance(attMap);
      if (result.students.length === 0) {
        toast.info("Nenhum aluno encontrado para esta turma.");
      } else {
        toast.success(`${result.students.length} alunos carregados!`);
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
    toast.info(`Todos marcados como ${status === 'PRESENTE' ? 'Presentes' : status === 'AUSENTE' ? 'Ausentes' : 'Limpos'}`);
  };

  const setStudentStatus = (enrollmentId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        status,
      }
    }));
  };

  const setStudentObservation = (enrollmentId: string, observation: string) => {
    setAttendance(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        observation,
      }
    }));
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
      toast.success("✅ Frequência salva com sucesso!");
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Selector Card */}
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Turma *</label>
            <select 
              className="w-full flex h-11 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
            >
              <option value="">Selecione a turma...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Disciplina *</label>
            <select 
              className="w-full flex h-11 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">Selecione a disciplina...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Data da Aula *</label>
            <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="h-11 font-medium text-slate-800"
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={loadClass} 
              disabled={loading} 
              className="w-full h-11 bg-blue-800 hover:bg-blue-700 font-semibold shadow-sm text-sm"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
              Carregar Chamada
            </Button>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="space-y-4 pb-24">
          {/* Quick Actions & Live Counters */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAll('PRESENTE')} 
                className="flex-1 sm:flex-initial text-xs font-semibold text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 h-9"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Todos Presentes
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAll('')} 
                className="text-xs text-slate-600 h-9"
              >
                Limpar
              </Button>
            </div>

            {/* Counters Badges */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                {stats.presentes} P
              </span>
              <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-800">
                {stats.ausentes} F
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
                {stats.justificados} J
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                Total: {stats.total}
              </span>
            </div>
          </div>

          {/* MOBILE VIEW (Card-by-card with Big Touch Buttons) - Visible on Small Screens */}
          <div className="block lg:hidden space-y-3">
            {students.map((student, idx) => {
              const enrollment = student.enrollments?.[0];
              if (!enrollment) return null;
              const att = attendance[enrollment.id] || { status: '', observation: '' };
              const currentStatus = att.status;

              return (
                <div 
                  key={student.id} 
                  className={`bg-white p-3.5 rounded-xl border transition-all shadow-sm ${
                    currentStatus === 'PRESENTE' ? 'border-l-4 border-l-emerald-500' :
                    currentStatus === 'AUSENTE' ? 'border-l-4 border-l-red-500 bg-red-50/20' :
                    currentStatus === 'JUSTIFICADO' ? 'border-l-4 border-l-amber-500 bg-amber-50/20' :
                    'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono text-slate-400 font-bold w-5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <Avatar className="h-9 w-9 border border-slate-200 shrink-0">
                        <AvatarImage src={student.photoUrl || ''} alt={student.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-800 font-bold text-xs">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{student.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">Matrícula: {student.registrationNumber || student.registration}</p>
                      </div>
                    </div>
                  </div>

                  {/* 3-Way Segmented Touch Buttons (Large, minimum 44px height for thumb friendly tapping) */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStudentStatus(enrollment.id, 'PRESENTE')}
                      className={`h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                        currentStatus === 'PRESENTE'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600 ring-offset-1'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 active:bg-emerald-100'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Presente
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentStatus(enrollment.id, 'AUSENTE')}
                      className={`h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                        currentStatus === 'AUSENTE'
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-600 ring-offset-1'
                          : 'bg-slate-100 text-slate-700 hover:bg-red-50 active:bg-red-100'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      Falta
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentStatus(enrollment.id, 'JUSTIFICADO')}
                      className={`h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                        currentStatus === 'JUSTIFICADO'
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-500 ring-offset-1'
                          : 'bg-slate-100 text-slate-700 hover:bg-amber-50 active:bg-amber-100'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Justificada
                    </button>
                  </div>

                  {/* Observation Input (Shown if ausente or justificado, or when tapped) */}
                  {(currentStatus === 'AUSENTE' || currentStatus === 'JUSTIFICADO' || att.observation) && (
                    <div className="mt-2.5">
                      <Input
                        placeholder="Motivo da falta ou observação (opcional)..."
                        value={att.observation}
                        onChange={(e) => setStudentObservation(enrollment.id, e.target.value)}
                        className="h-9 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW - Visible on large screens */}
          <div className="hidden lg:block bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">Nº</th>
                  <th className="px-4 py-3 font-semibold">Estudante</th>
                  <th className="px-4 py-3 font-semibold w-64 text-center">Status de Presença</th>
                  <th className="px-4 py-3 font-semibold">Observação / Justificativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  const enrollment = student.enrollments?.[0];
                  if (!enrollment) return null;
                  const att = attendance[enrollment.id] || { status: '', observation: '' };
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200 shrink-0">
                            <AvatarImage src={student.photoUrl || ''} alt={student.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-800 font-bold text-xs">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-900">{student.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{student.registrationNumber || student.registration}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setStudentStatus(enrollment.id, 'PRESENTE')}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                              att.status === 'PRESENTE'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                            title="Presente"
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(enrollment.id, 'AUSENTE')}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                              att.status === 'AUSENTE'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-800'
                            }`}
                            title="Ausente (Falta)"
                          >
                            F
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(enrollment.id, 'JUSTIFICADO')}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                              att.status === 'JUSTIFICADO'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-800'
                            }`}
                            title="Falta Justificada"
                          >
                            J
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          placeholder="Ex: Atestado médico, atraso..." 
                          value={att.observation}
                          onChange={(e) => setStudentObservation(enrollment.id, e.target.value)}
                          className="text-xs h-9"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FLOATING STICKY SAVE BAR (Perfect for Mobile Thumb Reachability!) */}
          <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-30 flex items-center justify-between gap-3 max-w-7xl mx-auto md:pl-72">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span>{stats.presentes} Presentes</span>
              <span>•</span>
              <span className="text-red-600">{stats.ausentes} Ausentes</span>
              <span>•</span>
              <span className="text-amber-600">{stats.justificados} Justificados</span>
            </div>

            <div className="sm:hidden text-xs font-bold text-slate-800">
              <span className="text-emerald-700">{stats.presentes}P</span> / <span className="text-red-600">{stats.ausentes}F</span> / <span className="text-amber-600">{stats.justificados}J</span>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving} 
              size="lg" 
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-blue-800/30 flex-1 sm:flex-initial"
            >
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
              Salvar Chamada
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
