import { Suspense } from "react";
import { getClassGroups } from "@/actions/class.actions";
import { getRACTypes } from "@/actions/config.actions";
import RacFormClient from "./rac-form-client";

export const dynamic = "force-dynamic";

export default async function NovoRacPage() {
  const classes = await getClassGroups();
  const racTypes = await getRACTypes();

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">Novo Registro RAC</h1>
        <p className="text-slate-500 text-xs sm:text-sm">Registre uma ocorrência de acompanhamento em sala de aula.</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Carregando formulário...</div>}>
        <RacFormClient classes={classes} racTypes={racTypes} />
      </Suspense>
    </div>
  );
}
