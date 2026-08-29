import { getMyProfile } from "@/actions/operator.actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PerfilClient from "./perfil-client";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const profile = await getMyProfile();

  if (!profile) {
    redirect("/login");
  }

  return <PerfilClient profile={profile} />;
}
