import { getClassGroups } from '@/actions/class.actions';
import { getStudents } from '@/actions/student.actions';
import LiberacaoFormClient from './liberacao-form-client';

export const dynamic = 'force-dynamic';

export default async function NovaLiberacaoPage() {
  const [classes, studentsRes] = await Promise.all([
    getClassGroups(),
    getStudents({ pageSize: 500 }),
  ]);

  const students = studentsRes.students || [];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 md:space-y-6">
      <LiberacaoFormClient classes={classes} students={students} />
    </div>
  );
}
