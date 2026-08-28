import { getClassGroups } from "@/actions/class.actions";
import { getRACTypes } from "@/actions/config.actions";
import RacFormClient from "./rac-form-client";

export default async function NovoRacPage() {
  const classes = await getClassGroups();
  const racTypes = await getRACTypes();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Novo Registro RAC</h1>
        <p className="text-slate-600">Registre uma ocorrência de acompanhamento em sala de aula.</p>
      </div>
      <RacFormClient classes={classes} racTypes={racTypes} />
    </div>
  );
}
