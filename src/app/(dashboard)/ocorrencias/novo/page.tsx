import { getClassGroups } from "@/actions/class.actions";
import { getOccurrenceTypes } from "@/actions/config.actions";
import OcorrenciaFormClient from "./ocorrencia-form-client";

export default async function NovaOcorrenciaPage() {
  const classes = await getClassGroups();
  const occurrenceTypes = await getOccurrenceTypes();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Nova Ocorrência Disciplinar</h1>
        <p className="text-slate-600">Registre os detalhes da ocorrência e a medida disciplinar adotada.</p>
      </div>
      <OcorrenciaFormClient classes={classes} occurrenceTypes={occurrenceTypes} />
    </div>
  );
}
