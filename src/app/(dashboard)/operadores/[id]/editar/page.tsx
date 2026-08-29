import { getOperatorById, getOperatorRoles } from "@/actions/operator.actions";
import { getSubjects } from "@/actions/class.actions";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import OperadorEditClient from "./operador-edit-client";

export const dynamic = "force-dynamic";

export default async function EditarOperadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const [operator, roles, subjects] = await Promise.all([
    getOperatorById(id),
    getOperatorRoles(),
    getSubjects(),
  ]);

  if (!operator) {
    notFound();
  }

  return <OperadorEditClient operator={operator} roles={roles} subjects={subjects} />;
}
