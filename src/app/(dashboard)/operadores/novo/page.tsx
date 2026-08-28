import { getOperatorRoles } from "@/actions/operator.actions";
import OperadorFormClient from "./operador-form-client";

export const dynamic = "force-dynamic";

export default async function NovoOperadorPage() {
  const roles = await getOperatorRoles();

  return <OperadorFormClient roles={roles} />;
}
