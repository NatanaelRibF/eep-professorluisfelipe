import { getClassGroups, getSubjects } from "@/actions/class.actions";
import FrequenciaClient from "./frequencia-client";

export default async function FrequenciaPage() {
  const classes = await getClassGroups();
  const subjects = await getSubjects();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Lançamento de Frequência</h1>
        <p className="text-slate-600">Selecione a turma e disciplina para registrar a chamada do dia.</p>
      </div>
      <FrequenciaClient classes={classes} subjects={subjects} />
    </div>
  );
}
