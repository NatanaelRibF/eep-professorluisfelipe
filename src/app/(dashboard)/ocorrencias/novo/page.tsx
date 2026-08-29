import { Suspense } from "react";
import { getClassGroups } from "@/actions/class.actions";
import { getOccurrenceTypes } from "@/actions/config.actions";
import OcorrenciaFormClient from "./ocorrencia-form-client";

export const dynamic = "force-dynamic";

export default async function NovaOcorrenciaPage() {
  const classes = await getClassGroups();
  const occurrenceTypes = await getOccurrenceTypes();

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">Nova Ocorrência Disciplinar</h1>
        <p className="text-slate-500 text-xs sm:text-sm">Registro formal de infração disciplinar e providências adotadas.</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Carregando formulário...</div>}>
        <OcorrenciaFormClient classes={classes} occurrenceTypes={occurrenceTypes} />
      </Suspense>
    </div>
  );
}
