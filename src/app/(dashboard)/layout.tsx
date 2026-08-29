import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch operator record directly from DB so avatar and nickname are always fresh and reliable
  const operator = await prisma.operator.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const userPayload = {
    ...session.user,
    name: operator?.name || session.user.name,
    nickname: operator?.nickname || (session.user as any).nickname || null,
    image: operator?.avatarUrl || null,
    role: operator?.role?.name || (session.user as any).role || "Professor",
  };

  return (
    <DashboardShell user={userPayload}>
      {children}
    </DashboardShell>
  );
}
