import { getElectives } from "@/actions/eletivas.actions";
import { getStudents } from "@/actions/student.actions";
import FeiraoClient from "./feirao-client";

export const dynamic = "force-dynamic";

export default async function FeiraoPage() {
  const [electives, studentsData] = await Promise.all([
    getElectives(),
    getStudents({ pageSize: 300 }),
  ]);

  return <FeiraoClient electives={electives} students={studentsData.students} />;
}
