import { getOperatorRoles } from "@/actions/operator.actions";
import { getSubjects, getClassGroups } from "@/actions/class.actions";
import OperadorFormClient from "./operador-form-client";

export const dynamic = "force-dynamic";

export default async function NovoOperadorPage() {
  const [roles, subjects, classes] = await Promise.all([
    getOperatorRoles(),
    getSubjects(),
    getClassGroups(),
  ]);

  return <OperadorFormClient roles={roles} subjects={subjects} classes={classes} />;
}
