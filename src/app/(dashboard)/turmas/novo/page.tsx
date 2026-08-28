import { getGrades, getSchoolYears } from "@/actions/class.actions";
import TurmaFormClient from "./turma-form-client";

export const dynamic = "force-dynamic";

export default async function NovaTurmaPage() {
  const [grades, schoolYears] = await Promise.all([
    getGrades(),
    getSchoolYears(),
  ]);

  return <TurmaFormClient grades={grades} schoolYears={schoolYears} />;
}
