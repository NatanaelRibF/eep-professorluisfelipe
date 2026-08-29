import { getSubjects, getSchoolYears } from "@/actions/class.actions";
import { getRACTypes, getOccurrenceTypes } from "@/actions/config.actions";
import ConfiguracoesClient from "./configuracoes-client";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const [subjects, racTypes, occurrenceTypes, schoolYears] = await Promise.all([
    getSubjects(true),
    getRACTypes(true),
    getOccurrenceTypes(true),
    getSchoolYears(),
  ]);

  return (
    <ConfiguracoesClient
      subjects={subjects}
      racTypes={racTypes}
      occurrenceTypes={occurrenceTypes}
      schoolYears={schoolYears}
    />
  );
}
