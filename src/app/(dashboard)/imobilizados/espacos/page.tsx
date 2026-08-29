import { getSchoolSpaces, getSpaceBookings } from "@/actions/spaces.actions";
import EspacosClient from "./espacos-client";

export const dynamic = "force-dynamic";

export default async function EspacosPage() {
  const [spaces, bookings] = await Promise.all([
    getSchoolSpaces(),
    getSpaceBookings(),
  ]);

  return <EspacosClient spaces={spaces} bookings={bookings} />;
}
