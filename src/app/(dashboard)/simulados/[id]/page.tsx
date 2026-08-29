import { getExamById } from "@/actions/simulados.actions";
import { getStudents } from "@/actions/student.actions";
import { notFound } from "next/navigation";
import SimuladoDetalheClient from "./simulado-detalhe-client";

export const dynamic = "force-dynamic";

export default async function SimuladoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [exam, studentsData] = await Promise.all([
    getExamById(id),
    getStudents({ pageSize: 300 }),
  ]);

  if (!exam) {
    notFound();
  }

  return <SimuladoDetalheClient exam={exam} students={studentsData.students} />;
}
