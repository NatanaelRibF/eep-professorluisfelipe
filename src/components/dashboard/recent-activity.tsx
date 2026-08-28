'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ActivityItem {
  id: string;
  studentName: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  date: Date | string;
}

interface RecentActivityProps {
  recentOccurrences: ActivityItem[];
  recentRACs: ActivityItem[];
}

export function RecentActivity({ recentOccurrences, recentRACs }: RecentActivityProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default'; // default mapped since amber might not be built-in badge
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Grave';
      case 'medium': return 'Média';
      case 'low': return 'Leve';
      default: return severity;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Últimas Ocorrências</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOccurrences.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.studentName}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(item.severity) as any}>
                      {getSeverityLabel(item.severity)}
                    </Badge>
                    <span className="ml-2 text-sm text-muted-foreground">{item.type}</span>
                  </TableCell>
                  <TableCell>
                    {typeof item.date === 'string' ? format(new Date(item.date), 'dd/MM/yyyy') : format(item.date, 'dd/MM/yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos RACs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRACs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.studentName}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(item.severity) as any}>
                      {getSeverityLabel(item.severity)}
                    </Badge>
                    <span className="ml-2 text-sm text-muted-foreground">{item.type}</span>
                  </TableCell>
                  <TableCell>
                    {typeof item.date === 'string' ? format(new Date(item.date), 'dd/MM/yyyy') : format(item.date, 'dd/MM/yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
