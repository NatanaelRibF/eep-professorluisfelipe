import { getEquipmentSchedule } from "@/actions/equipment.actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AgendaClient from "./agenda-client";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const dateStr = resolvedParams?.data || today;

  const scheduleData = await getEquipmentSchedule(dateStr);

  return <AgendaClient initialData={scheduleData} user={session.user} />;
}
