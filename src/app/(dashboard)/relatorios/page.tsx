"use client";

import { useState } from "react";
import { Printer, FileText, AlertTriangle, User, ClipboardList, Filter, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function RelatoriosPage() {
  const [selectedReportType, setSelectedReportType] = useState<"FREQUENCIA" | "RAC" | "DISCIPLINAR" | "ALUNO">("FREQUENCIA");
  const [selectedClass, setSelectedClass] = useState("todas");
  const [startDate, setStartDate] = useState("2026-02-01");
  const [endDate, setEndDate] = useState("2026-12-15");

  const handlePrint = () => {
    window.print();
  };

  const reportTitles = {
    FREQUENCIA: "Relatório Geral de Assiduidade e Frequência",
    RAC: "Relatório de Acompanhamento em Sala de Aula (RAC)",
    DISCIPLINAR: "Relatório de Ocorrências e Medidas Disciplinares",
    ALUNO: "Ficha Individual e Histórico Global do Estudante",
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Hide controls when printing */}
      <div className="print:hidden space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">Central de Relatórios</h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Emissão de relatórios oficiais, atas de assiduidade e fichas pedagógicas para impressão.
            </p>
          </div>
          <Button onClick={handlePrint} className="w-full sm:w-auto bg-blue-800 hover:bg-blue-700 font-bold shadow-sm h-11 text-sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir / Salvar PDF
          </Button>
        </div>

        {/* Report Type Selector Cards (Responsive Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card 
            onClick={() => setSelectedReportType("FREQUENCIA")}
            className={`cursor-pointer transition-all ${
              selectedReportType === "FREQUENCIA" 
                ? "border-2 border-blue-800 bg-blue-50/40 shadow-sm" 
                : "hover:border-blue-300 bg-white"
            }`}
          >
            <CardHeader className="p-3.5 sm:p-4 pb-1">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center text-blue-900">
                <ClipboardList className="mr-1.5 h-4 w-4 text-blue-700" />
                Frequência
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-1">
              <p className="text-[11px] text-slate-500">Geral por turma e período</p>
            </CardContent>
          </Card>
          
          <Card 
            onClick={() => setSelectedReportType("RAC")}
            className={`cursor-pointer transition-all ${
              selectedReportType === "RAC" 
                ? "border-2 border-blue-800 bg-blue-50/40 shadow-sm" 
                : "hover:border-blue-300 bg-white"
            }`}
          >
            <CardHeader className="p-3.5 sm:p-4 pb-1">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center text-slate-800">
                <FileText className="mr-1.5 h-4 w-4 text-amber-600" />
                RACs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-1">
              <p className="text-[11px] text-slate-500">Anotações em sala de aula</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setSelectedReportType("DISCIPLINAR")}
            className={`cursor-pointer transition-all ${
              selectedReportType === "DISCIPLINAR" 
                ? "border-2 border-blue-800 bg-blue-50/40 shadow-sm" 
                : "hover:border-blue-300 bg-white"
            }`}
          >
            <CardHeader className="p-3.5 sm:p-4 pb-1">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center text-slate-800">
                <AlertTriangle className="mr-1.5 h-4 w-4 text-red-600" />
                Disciplinar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-1">
              <p className="text-[11px] text-slate-500">Ocorrências e providências</p>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setSelectedReportType("ALUNO")}
            className={`cursor-pointer transition-all ${
              selectedReportType === "ALUNO" 
                ? "border-2 border-blue-800 bg-blue-50/40 shadow-sm" 
                : "hover:border-blue-300 bg-white"
            }`}
          >
            <CardHeader className="p-3.5 sm:p-4 pb-1">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center text-slate-800">
                <User className="mr-1.5 h-4 w-4 text-blue-600" />
                Ficha do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-1">
              <p className="text-[11px] text-slate-500">Histórico global individual</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="p-4 pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold flex items-center text-slate-900">
              <Filter className="mr-2 h-4 w-4 text-blue-600" />
              Parâmetros de Filtragem
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 uppercase">Turma</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Turmas</SelectItem>
                    <SelectItem value="1a">1ª Série A - Manhã</SelectItem>
                    <SelectItem value="1b">1ª Série B - Tarde</SelectItem>
                    <SelectItem value="2a">2ª Série A - Manhã</SelectItem>
                    <SelectItem value="3a">3ª Série A - Manhã</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 uppercase">Disciplina</Label>
                <Select defaultValue="todas">
                  <SelectTrigger className="h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Disciplinas</SelectItem>
                    <SelectItem value="mat">Matemática</SelectItem>
                    <SelectItem value="port">Língua Portuguesa</SelectItem>
                    <SelectItem value="geo">Geografia</SelectItem>
                    <SelectItem value="hist">História</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 uppercase">Data Inicial</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10 text-xs sm:text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 uppercase">Data Final</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10 text-xs sm:text-sm" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" className="text-xs h-9">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Limpar
              </Button>
              <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-xs font-semibold h-9">
                <Search className="w-3.5 h-3.5 mr-1" />
                Atualizar Visualização
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print-only / Report Preview Box */}
      <div className="bg-white p-4 sm:p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Official Header */}
        <div className="text-center mb-6 sm:mb-8 border-b-2 border-slate-800 pb-4 sm:pb-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Governo do Estado do Ceará • SEDUC</p>
          <h2 className="text-xl sm:text-2xl font-bold uppercase text-slate-900 mt-1">EEEP Professor Luís Felipe</h2>
          <h3 className="text-sm sm:text-lg font-bold text-blue-900 mt-1.5">{reportTitles[selectedReportType]}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Período de Referência: <strong>01/02/2026 a 15/12/2026</strong> • Emitido em {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Dynamic Content Based on Report Type */}
        {selectedReportType === "FREQUENCIA" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50">
                  <th className="py-2.5 px-3 font-bold">Turma / Série</th>
                  <th className="py-2.5 px-3 font-bold">Disciplina</th>
                  <th className="py-2.5 px-3 font-bold text-center">Aulas</th>
                  <th className="py-2.5 px-3 font-bold text-center">Presenças</th>
                  <th className="py-2.5 px-3 font-bold text-center">Faltas</th>
                  <th className="py-2.5 px-3 font-bold text-center">Taxa (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3 font-medium">1ª Série A - Manhã</td>
                  <td className="py-3 px-3">Língua Portuguesa</td>
                  <td className="py-3 px-3 text-center">40</td>
                  <td className="py-3 px-3 text-center text-emerald-700 font-semibold">38</td>
                  <td className="py-3 px-3 text-center text-red-600 font-semibold">2</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">95%</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">1ª Série A - Manhã</td>
                  <td className="py-3 px-3">Matemática</td>
                  <td className="py-3 px-3 text-center">40</td>
                  <td className="py-3 px-3 text-center text-emerald-700 font-semibold">36</td>
                  <td className="py-3 px-3 text-center text-red-600 font-semibold">4</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">90%</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">2ª Série A - Manhã</td>
                  <td className="py-3 px-3">Física</td>
                  <td className="py-3 px-3 text-center">30</td>
                  <td className="py-3 px-3 text-center text-emerald-700 font-semibold">29</td>
                  <td className="py-3 px-3 text-center text-red-600 font-semibold">1</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">97%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedReportType === "RAC" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50">
                  <th className="py-2.5 px-3 font-bold">Data</th>
                  <th className="py-2.5 px-3 font-bold">Aluno / Matrícula</th>
                  <th className="py-2.5 px-3 font-bold">Turma</th>
                  <th className="py-2.5 px-3 font-bold">Conduta / RAC</th>
                  <th className="py-2.5 px-3 font-bold">Professor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3">15/08/2026</td>
                  <td className="py-3 px-3 font-medium">Marcos Vinícius Silva</td>
                  <td className="py-3 px-3">1ª Série A</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">Uso indevido de celular</span>
                    <Badge className="ml-2 bg-emerald-100 text-emerald-800 text-[10px]">Leve</Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-600">Prof. Fernando</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedReportType === "DISCIPLINAR" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50">
                  <th className="py-2.5 px-3 font-bold">Data</th>
                  <th className="py-2.5 px-3 font-bold">Estudante</th>
                  <th className="py-2.5 px-3 font-bold">Infração</th>
                  <th className="py-2.5 px-3 font-bold">Providência Adotada</th>
                  <th className="py-2.5 px-3 font-bold">Registrado por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3">20/08/2026</td>
                  <td className="py-3 px-3 font-medium">Marcos Vinícius Silva</td>
                  <td className="py-3 px-3 font-semibold text-amber-900">Atraso na entrada escolar</td>
                  <td className="py-3 px-3 text-slate-600">Notificação aos responsáveis no ato</td>
                  <td className="py-3 px-3 text-slate-600">Coordenação</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedReportType === "ALUNO" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-slate-500 font-semibold text-xs uppercase">Estudante</p>
                <p className="font-bold text-slate-900 text-sm">Marcos Vinícius Silva</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold text-xs uppercase">Matrícula</p>
                <p className="font-mono font-bold text-blue-800">20260102</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold text-xs uppercase">Turma Atual</p>
                <p className="font-medium text-slate-800">1ª Série A - Manhã</p>
              </div>
            </div>
          </div>
        )}

        {/* Signatures Area */}
        <div className="mt-20 pt-8 flex flex-col sm:flex-row justify-around gap-8 text-center print:flex print:flex-row">
          <div className="w-full sm:w-64">
            <div className="border-t border-slate-400 mx-auto mb-2"></div>
            <p className="text-xs font-bold text-slate-800">Coordenação Pedagógica</p>
            <p className="text-[10px] text-slate-500">EEEP Professor Luís Felipe</p>
          </div>
          <div className="w-full sm:w-64">
            <div className="border-t border-slate-400 mx-auto mb-2"></div>
            <p className="text-xs font-bold text-slate-800">Direção Escolar</p>
            <p className="text-[10px] text-slate-500">EEEP Professor Luís Felipe</p>
          </div>
        </div>
      </div>
      
      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:flex {
            display: flex !important;
          }
          .bg-white, .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
