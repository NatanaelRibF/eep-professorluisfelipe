import { getClassGroups, getSubjects } from "@/actions/class.actions";
import RelatorioClient from "./relatorio-client";

export default async function FrequenciaRelatorioPage() {
  const classes = await getClassGroups();
  const subjects = await getSubjects();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatório de Frequência</h1>
          <p className="text-slate-600">Acompanhamento e análise de faltas por disciplina.</p>
        </div>
      </div>
      <RelatorioClient classes={classes} subjects={subjects} />
    </div>
  );
}
