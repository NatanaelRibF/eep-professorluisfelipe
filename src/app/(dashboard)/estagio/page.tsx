import { getStudentInternships, getInternshipCompanies } from "@/actions/estagio.actions";
import EstagioClient from "./estagio-client";

export const dynamic = "force-dynamic";

export default async function EstagioPage() {
  const [internships, companies] = await Promise.all([
    getStudentInternships(),
    getInternshipCompanies(),
  ]);

  return <EstagioClient internships={internships} companies={companies} />;
}
