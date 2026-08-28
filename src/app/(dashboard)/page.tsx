import { StatsCards } from '@/components/dashboard/stats-cards';
import { AttendanceChart } from '@/components/dashboard/charts/attendance-chart';
import { RACChart } from '@/components/dashboard/charts/rac-chart';
import { OccurrenceChart } from '@/components/dashboard/charts/occurrence-chart';
import { AttendanceByClassChart } from '@/components/dashboard/charts/attendance-by-class-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { auth } from '@/lib/auth';
import {
  getDashboardStats,
  getAttendanceChartData,
  getRACChartData,
  getOccurrenceChartData,
  getAttendanceByClassData,
  getRecentOccurrences,
  getRecentRACs,
} from '@/actions/dashboard.actions';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [
    stats,
    attendanceData,
    racData,
    occurrenceData,
    attendanceByClassData,
    recentOccurrences,
    recentRacs,
  ] = await Promise.all([
    getDashboardStats(),
    getAttendanceChartData(),
    getRACChartData(),
    getOccurrenceChartData(),
    getAttendanceByClassData(),
    getRecentOccurrences(),
    getRecentRACs(),
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <p className="text-muted-foreground">
            Bem-vindo, {session.user.name || 'Usuário'}
          </p>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full">
          <AttendanceChart data={attendanceData} />
        </div>
        <div className="col-span-4">
          <RACChart data={racData} />
        </div>
        <div className="col-span-3">
          <OccurrenceChart data={occurrenceData} />
        </div>
        <div className="col-span-full">
          <AttendanceByClassChart data={attendanceByClassData} />
        </div>
      </div>

      <RecentActivity
        recentOccurrences={recentOccurrences as any}
        recentRACs={recentRacs as any}
      />
    </div>
  );
}
