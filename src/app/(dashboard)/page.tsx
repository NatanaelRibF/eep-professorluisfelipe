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

  const displayName = (session.user as any)?.nickname || session.user.name || 'Usuário';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">Início</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Bem-vindo de volta, <span className="font-semibold text-slate-800">{displayName}</span>
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <StatsCards stats={stats} />

      {/* Harmonious 2-Column Equal Grid for All 4 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="w-full">
          <AttendanceChart data={attendanceData} />
        </div>
        <div className="w-full">
          <AttendanceByClassChart data={attendanceByClassData} />
        </div>
        <div className="w-full">
          <RACChart data={racData} />
        </div>
        <div className="w-full">
          <OccurrenceChart data={occurrenceData} />
        </div>
      </div>

      {/* Recent Activity Tables */}
      <RecentActivity
        recentOccurrences={recentOccurrences as any}
        recentRACs={recentRacs as any}
      />
    </div>
  );
}
