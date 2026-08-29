import { getStudents } from "@/actions/student.actions";
import NovoAtendimentoClient from "./novo-atendimento-client";

export const dynamic = "force-dynamic";

export default async function NovoAtendimentoPage() {
  const { students } = await getStudents({ pageSize: 200 });

  return <NovoAtendimentoClient students={students} />;
}
