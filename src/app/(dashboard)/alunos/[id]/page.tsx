import { notFound } from 'next/navigation';
import { getStudentById } from '@/actions/student.actions';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StudentDetailClient from './student-detail-client';

export const dynamic = 'force-dynamic';

export default async function AlunoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);
  
  if (!student) {
    notFound();
  }

  const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'ATIVO') || student.enrollments?.[0];
  const classGroup = activeEnrollment?.classGroup;
  const attendances = activeEnrollment?.attendances || [];
  const racs = activeEnrollment?.racs || [];
  const occurrences = activeEnrollment?.occurrences || [];

  const totalAttendances = attendances.length;
  const presents = attendances.filter((a: any) => a.status === 'PRESENTE').length;
  const justified = attendances.filter((a: any) => a.status === 'JUSTIFICADO').length;
  const absents = attendances.filter((a: any) => a.status === 'AUSENTE').length;
  const attendanceRate = totalAttendances > 0 ? Math.round(((presents + justified) / totalAttendances) * 100) : 100;

  const age = student.birthDate 
    ? differenceInYears(new Date(), new Date(student.birthDate))
    : 'N/A';

  const formattedBirthDate = student.birthDate
    ? format(new Date(student.birthDate), 'dd/MM/yyyy', { locale: ptBR })
    : 'Não informada';

  const racUrl = classGroup?.id
    ? `/rac/novo?turmaId=${classGroup.id}&enrollmentId=${activeEnrollment?.id || ''}&alunoId=${student.id}`
    : `/rac/novo?alunoId=${student.id}&enrollmentId=${activeEnrollment?.id || ''}`;

  const ocorrenciaUrl = classGroup?.id
    ? `/ocorrencias/novo?turmaId=${classGroup.id}&enrollmentId=${activeEnrollment?.id || ''}&alunoId=${student.id}`
    : `/ocorrencias/novo?alunoId=${student.id}&enrollmentId=${activeEnrollment?.id || ''}`;

  return (
    <StudentDetailClient
      student={student}
      activeEnrollment={activeEnrollment}
      classGroup={classGroup}
      attendances={attendances}
      racs={racs}
      occurrences={occurrences}
      attendanceRate={attendanceRate}
      presents={presents}
      absents={absents}
      justified={justified}
      age={age}
      formattedBirthDate={formattedBirthDate}
      racUrl={racUrl}
      ocorrenciaUrl={ocorrenciaUrl}
    />
  );
}
