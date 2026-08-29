import { getElectiveById } from "@/actions/eletivas.actions";
import { getStudents } from "@/actions/student.actions";
import { notFound } from "next/navigation";
import EletivaDetalheClient from "./eletiva-detalhe-client";

export const dynamic = "force-dynamic";

export default async function EletivaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [elective, studentsData] = await Promise.all([
    getElectiveById(id),
    getStudents({ pageSize: 300 }),
  ]);

  if (!elective) {
    notFound();
  }

  return <EletivaDetalheClient elective={elective} allStudents={studentsData.students} />;
}
