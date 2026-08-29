import { getOperators } from "@/actions/operator.actions";
import NovoEletivaClient from "./novo-eletiva-client";

export const dynamic = "force-dynamic";

export default async function NovaEletivaPage() {
  const operators = await getOperators();

  return <NovoEletivaClient operators={operators} />;
}
