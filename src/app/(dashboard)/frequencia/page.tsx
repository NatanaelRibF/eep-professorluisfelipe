import { getClassesForAttendance, getSubjects } from "@/actions/class.actions";
import { getMyProfile } from "@/actions/operator.actions";
import FrequenciaClient from "./frequencia-client";

export const dynamic = "force-dynamic";

export default async function FrequenciaPage() {
  const [classes, subjects, profile] = await Promise.all([
    getClassesForAttendance(),
    getSubjects(),
    getMyProfile(),
  ]);

  const mySubjectIds = profile?.teacherSubjects?.map((ts: any) => ts.subjectId) || [];
  const userRole = profile?.role?.name || "";

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">Lançamento de Frequência</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          {userRole === "Professor"
            ? "Selecione uma das suas turmas atribuídas e a disciplina para registrar a chamada."
            : "Selecione a turma e a disciplina para registrar a chamada da aula."}
        </p>
      </div>
      <FrequenciaClient 
        classes={classes} 
        subjects={subjects} 
        mySubjectIds={mySubjectIds} 
        userRole={userRole} 
      />
    </div>
  );
}
