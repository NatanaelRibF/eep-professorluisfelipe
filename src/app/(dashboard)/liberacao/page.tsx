import { getStudentExitPasses } from '@/actions/liberacao.actions';
import { getClassGroups } from '@/actions/class.actions';
import LiberacaoClient from './liberacao-client';

export const dynamic = 'force-dynamic';

export default async function LiberacaoPage() {
  const [passesRes, classes] = await Promise.all([
    getStudentExitPasses(),
    getClassGroups(),
  ]);

  const passes = passesRes.success ? passesRes.passes || [] : [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <LiberacaoClient initialPasses={passes} classes={classes} />
    </div>
  );
}
