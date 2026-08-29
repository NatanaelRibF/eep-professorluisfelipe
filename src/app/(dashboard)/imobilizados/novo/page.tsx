import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ImobilizadoFormClient from "./imobilizado-form-client";

export default async function NovoImobilizadoPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <ImobilizadoFormClient />;
}
