import { getInternshipCompanies } from "@/actions/estagio.actions";
import EmpresasClient from "./empresas-client";

export const dynamic = "force-dynamic";

export default async function EmpresasPage() {
  const companies = await getInternshipCompanies();

  return <EmpresasClient companies={companies} />;
}
