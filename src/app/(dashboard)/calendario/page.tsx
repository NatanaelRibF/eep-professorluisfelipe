import { getSchoolEvents } from '@/actions/calendario.actions';
import CalendarioClient from './calendario-client';

export const dynamic = 'force-dynamic';

export default async function CalendarioPage() {
  const eventsRes = await getSchoolEvents();
  const events = eventsRes.success ? eventsRes.events || [] : [];
  const stats = eventsRes.success ? eventsRes.stats || {} : {};

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <CalendarioClient initialEvents={events} initialStats={stats} />
    </div>
  );
}
