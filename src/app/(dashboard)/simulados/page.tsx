import { getExams } from "@/actions/simulados.actions";
import SimuladosClient from "./simulados-client";

export const dynamic = "force-dynamic";

export default async function SimuladosPage() {
  const exams = await getExams();

  return <SimuladosClient exams={exams} />;
}
