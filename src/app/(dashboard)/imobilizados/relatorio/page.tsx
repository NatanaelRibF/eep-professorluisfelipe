import { getSpaceBookings, getSchoolSpaces } from "@/actions/spaces.actions";
import { getEquipments } from "@/actions/equipment.actions";
import RelatorioReservasClient from "./relatorio-reservas-client";

export const dynamic = "force-dynamic";

export default async function RelatorioReservasPage() {
  const [spaces, spaceBookings, equipments] = await Promise.all([
    getSchoolSpaces(),
    getSpaceBookings(),
    getEquipments(),
  ]);

  return (
    <RelatorioReservasClient
      spaces={spaces}
      spaceBookings={spaceBookings}
      equipments={equipments}
    />
  );
}
