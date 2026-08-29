import { getEquipments } from "@/actions/equipment.actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ImobilizadosClient from "./imobilizados-client";

export default async function ImobilizadosPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const equipments = await getEquipments();

  return <ImobilizadosClient initialEquipments={equipments} user={session.user} />;
}
