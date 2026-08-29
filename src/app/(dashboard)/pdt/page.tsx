import { getPDTClasses, getPDTAttendances, getPDTCouncils } from "@/actions/pdt.actions";
import { getOperators } from "@/actions/operator.actions";
import PDTDashboardClient from "./pdt-dashboard-client";

export const dynamic = "force-dynamic";

export default async function PDTPage() {
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
      />
    </div>
  );
}
