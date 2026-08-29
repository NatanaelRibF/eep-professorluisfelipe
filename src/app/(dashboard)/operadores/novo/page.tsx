import { getOperatorRoles } from "@/actions/operator.actions";
import { getSubjects } from "@/actions/class.actions";
import OperadorFormClient from "./operador-form-client";

export const dynamic = "force-dynamic";

export default async function NovoOperadorPage() {
  const [roles, subjects] = await Promise.all([
    getOperatorRoles(),
    getSubjects(),
  ]);

  return <OperadorFormClient roles={roles} subjects={subjects} />;
}
