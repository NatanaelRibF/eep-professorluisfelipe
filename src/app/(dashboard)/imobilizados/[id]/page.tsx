import { getEquipmentById } from "@/actions/equipment.actions";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ImobilizadoDetailClient from "./imobilizado-detail-client";

export default async function ImobilizadoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const equipment = await getEquipmentById(id);

  if (!equipment) {
    notFound();
  }

  return <ImobilizadoDetailClient equipment={equipment} user={session.user} />;
}
