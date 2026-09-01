import { getBuscaAtivaData } from '@/actions/busca-ativa.actions';
import { getClassGroups } from '@/actions/class.actions';
import BuscaAtivaClient from './busca-ativa-client';

export const dynamic = 'force-dynamic';

export default async function BuscaAtivaPage() {
  const [buscaRes, classes] = await Promise.all([
    getBuscaAtivaData(),
    getClassGroups(),
  ]);

  const students = buscaRes.success ? buscaRes.students || [] : [];
  const stats = buscaRes.success ? buscaRes.stats || {} : {};

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <BuscaAtivaClient initialStudents={students} initialStats={stats} classes={classes} />
    </div>
  );
}
