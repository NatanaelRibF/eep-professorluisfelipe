import { getOperatorById, getOperatorRoles } from "@/actions/operator.actions";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import OperadorEditClient from "./operador-edit-client";

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
  const operator = await getOperatorById(id);
  const roles = await getOperatorRoles();

  if (!operator) {
    notFound();
  }

  return <OperadorEditClient operator={operator} roles={roles} />;
}
