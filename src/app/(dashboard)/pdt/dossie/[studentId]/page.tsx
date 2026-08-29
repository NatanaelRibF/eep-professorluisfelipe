import { getStudentDossier } from "@/actions/pdt.actions";
import { notFound } from "next/navigation";
import DossierFormClient from "./dossier-form-client";

export const dynamic = "force-dynamic";

export default async function DossieAlunoPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const data = await getStudentDossier(studentId);

  if (!data || !data.student) {
    notFound();
  }

  return <DossierFormClient data={data} />;
}
