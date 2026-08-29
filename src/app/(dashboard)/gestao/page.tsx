import { getStrategicManagementData } from "@/actions/gestao.actions";
import GestaoClient from "./gestao-client";

export const dynamic = "force-dynamic";

export default async function GestaoPage() {
  const data = await getStrategicManagementData();

  return <GestaoClient data={data} />;
}
