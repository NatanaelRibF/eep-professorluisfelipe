import { getClassGroups, getSchoolYears } from "@/actions/class.actions";
import TurmasClient from "./turmas-client";

export const dynamic = "force-dynamic";

export default async function TurmasPage() {
  const [turmas, schoolYears] = await Promise.all([
    getClassGroups("all"),
    getSchoolYears(),
  ]);

  return <TurmasClient initialClasses={turmas} schoolYears={schoolYears} />;
}
