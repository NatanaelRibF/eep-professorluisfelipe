import { getClassGroups, getSubjects } from "@/actions/class.actions";
import RelatoriosClient from "./relatorios-client";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const [classes, subjects] = await Promise.all([
    getClassGroups(), // automatically filters by active school year
    getSubjects(),
  ]);

  return <RelatoriosClient classes={classes} subjects={subjects} />;
}
