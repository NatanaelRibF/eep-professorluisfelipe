import { getStudentInternshipById } from "@/actions/estagio.actions";
import { notFound } from "next/navigation";
import EstagioDetalheClient from "./estagio-detalhe-client";

export const dynamic = "force-dynamic";

export default async function EstagioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const internship = await getStudentInternshipById(id);

  if (!internship) {
    notFound();
  }

  return <EstagioDetalheClient internship={internship} />;
}
