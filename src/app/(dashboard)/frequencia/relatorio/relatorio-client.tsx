'use client';

import { useState } from "react";
import { getAttendanceReport } from "@/actions/attendance.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Printer, AlertTriangle, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function RelatorioClient({ classes, subjects }: { classes: any[], subjects: any[] }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleFilter = async () => {
    if (!selectedClass || !selectedSubject) {
      toast.error("Selecione Turma e Disciplina.");
      return;
    }
    setLoading(true);
    try {
      const attendances = await getAttendanceReport({
        classGroupId: selectedClass,
        subjectId: selectedSubject,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });

      // Process data by student
      const studentMap: Record<string, any> = {};
      let totalClasses = 0;
      const uniqueDates = new Set();

      attendances.forEach((a: any) => {
        uniqueDates.add(a.date.toString());
        const stu = a.enrollment.student;
        if (!studentMap[stu.id]) {
          studentMap[stu.id] = {
            id: stu.id,
            name: stu.name,
            registration: stu.registration,
            presentes: 0,
            ausentes: 0,
            justificados: 0,
            total: 0
          };
        }
        studentMap[stu.id].total++;
        if (a.status === 'PRESENTE') studentMap[stu.id].presentes++;
        else if (a.status === 'AUSENTE') studentMap[stu.id].ausentes++;
        else if (a.status === 'JUSTIFICADO') studentMap[stu.id].justificados++;
      });

      totalClasses = uniqueDates.size;

      const studentList = Object.values(studentMap).map(s => {
        const rate = s.total > 0 ? (s.presentes / s.total) * 100 : 0;
        return { ...s, rate };
      });

      const avgRate = studentList.length > 0 
        ? studentList.reduce((acc, curr) => acc + curr.rate, 0) / studentList.length 
        : 0;

      const critical = studentList.filter(s => s.rate < 75).length;

      setData({
        students: studentList.sort((a, b) => a.name.localeCompare(b.name)),
        avgRate,
        critical,
        totalClasses
      });
    } catch (error) {
      toast.error("Erro ao carregar relatório.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Turma *</label>
            <select 
              className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            >
              <option value="">Selecione...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Disciplina *</label>
            <select 
              className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">Selecione...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Button onClick={handleFilter} disabled={loading} className="w-full bg-blue-800 hover:bg-blue-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gerar Relatório"}
          </Button>
        </div>
      </div>

      {data && (
        <div className="space-y-6 print:m-0">
          <div className="flex justify-between items-center print:hidden">
            <h2 className="text-xl font-semibold">Resultados do Relatório</h2>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Taxa Média da Turma</p>
                <p className="text-2xl font-bold text-slate-900">{data.avgRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Aulas Registradas</p>
                <p className="text-2xl font-bold text-slate-900">{data.totalClasses}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Alunos em Risco (&lt;75%)</p>
                <p className="text-2xl font-bold text-slate-900">{data.critical}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Aluno</th>
                  <th className="px-6 py-4 font-semibold text-center">Presenças (P)</th>
                  <th className="px-6 py-4 font-semibold text-center">Faltas (F)</th>
                  <th className="px-6 py-4 font-semibold text-center">Justificadas (J)</th>
                  <th className="px-6 py-4 font-semibold w-1/4">Taxa de Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.students.map((student: any) => {
                  const rateColor = student.rate >= 85 ? 'bg-green-500' : student.rate >= 75 ? 'bg-amber-400' : 'bg-red-500';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.registration}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-green-600">{student.presentes}</td>
                      <td className="px-6 py-4 text-center font-medium text-red-600">{student.ausentes}</td>
                      <td className="px-6 py-4 text-center font-medium text-amber-600">{student.justificados}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${rateColor}`} style={{ width: `${student.rate}%` }}></div>
                          </div>
                          <span className="font-medium text-slate-700 min-w-12">{student.rate.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {data.students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhum registro encontrado para o período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
