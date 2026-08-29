import { getClassGroups } from "@/actions/class.actions";
import { getRACGradesByClass } from "@/actions/rac.actions";
import RACNotasClient from "./rac-notas-client";

export const dynamic = "force-dynamic";

export default async function RACNotasPage({
  searchParams,
}: {
  searchParams: Promise<{ turmaId?: string; bimestre?: string }>;
}) {
  const { turmaId, bimestre } = await searchParams;
  const classes = await getClassGroups();
  
  const defaultClassId = turmaId || classes[0]?.id || "";
  const defaultBimester = bimestre ? Number(bimestre) : 1;

  let initialData = null;
  if (defaultClassId) {
    initialData = await getRACGradesByClass({
      classGroupId: defaultClassId,
      bimester: defaultBimester,
    });
  }

  return (
    <RACNotasClient
      classes={classes}
      initialData={initialData}
      defaultClassId={defaultClassId}
      defaultBimester={defaultBimester}
    />
  );
}
