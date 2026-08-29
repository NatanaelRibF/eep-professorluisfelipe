import { getPDTClasses, getPDTAttendances, getPDTCouncils } from "@/actions/pdt.actions";
import { getOperators } from "@/actions/operator.actions";
import { auth } from "@/lib/auth";
import PDTDashboardClient from "./pdt-dashboard-client";

export const dynamic = "force-dynamic";

export default async function PDTPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role || "";
  const isGestor = ["Diretor", "Coordenador", "Secretário"].includes(userRole);

  const [classes, attendances, councils, operators] = await Promise.all([
    getPDTClasses(),
    getPDTAttendances(),
    getPDTCouncils(),
    getOperators(),
  ]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PDTDashboardClient
        classes={classes}
        attendances={attendances}
        councils={councils}
        operators={operators}
        isGestor={isGestor}
        userRole={userRole}
      />
    </div>
  );
}
