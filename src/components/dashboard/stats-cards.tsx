'use client';

import { Users, ClipboardCheck, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  stats: {
    totalStudents: number;
    attendanceRate: number;
    racsThisMonth: number;
    occurrencesThisMonth: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Alunos</p>
            <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Frequência Hoje</p>
            <h3 className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">RACs do Mês</p>
            <h3 className="text-2xl font-bold">{stats.racsThisMonth}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ocorrências do Mês</p>
            <h3 className="text-2xl font-bold">{stats.occurrencesThisMonth}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
