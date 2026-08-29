import { getStudents } from "@/actions/student.actions";
import { getInternshipCompanies } from "@/actions/estagio.actions";
import { getOperators } from "@/actions/operator.actions";
import NovoEstagioClient from "./novo-estagio-client";

export const dynamic = "force-dynamic";

export default async function NovoEstagioPage() {
  const [studentsData, companies, operators] = await Promise.all([
    getStudents({ pageSize: 300 }),
    getInternshipCompanies(),
    getOperators(),
  ]);

  return (
    <NovoEstagioClient
      students={studentsData.students}
      companies={companies}
      operators={operators}
    />
  );
}
