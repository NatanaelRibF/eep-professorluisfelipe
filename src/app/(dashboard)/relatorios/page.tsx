"use client";

import { Printer, FileText, AlertTriangle, User, ClipboardList, Filter } from "lucide-react";
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

export default function RelatoriosPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Hide controls when printing */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-blue-900">Central de Relatórios</h2>
          <Button onClick={handlePrint} className="bg-blue-800 hover:bg-blue-900">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir / Salvar PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer border-blue-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-blue-700">
                <ClipboardList className="mr-2 h-4 w-4" />
                Frequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Relatório geral por turma e período</div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-blue-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-slate-700">
                <FileText className="mr-2 h-4 w-4" />
                RAC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Registros em sala de aula</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-blue-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-slate-700">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Disciplinar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Ocorrências por turma/aluno</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-blue-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-slate-700">
                <User className="mr-2 h-4 w-4" />
                Ficha do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Histórico global individual</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Turma</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Turmas</SelectItem>
                    <SelectItem value="1a">1º Ano A</SelectItem>
                    <SelectItem value="1b">1º Ano B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Disciplinas</SelectItem>
                    <SelectItem value="mat">Matemática</SelectItem>
                    <SelectItem value="port">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline">Limpar</Button>
              <Button className="ml-2 bg-blue-600 hover:bg-blue-700">Gerar Relatório</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print-only section / Preview */}
      <div className="bg-white p-8 rounded-lg border shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-2xl font-bold uppercase text-slate-900">EEEP Professor Luís Felipe</h1>
          <h2 className="text-xl font-semibold mt-2 text-slate-700">Relatório Geral de Frequência</h2>
          <p className="text-sm text-slate-500 mt-1">Período: 01/08/2026 a 31/08/2026</p>
        </div>

        <div className="mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="py-2 font-semibold text-sm">Turma</th>
                <th className="py-2 font-semibold text-sm">Disciplina</th>
                <th className="py-2 font-semibold text-sm text-center">Aulas Ministradas</th>
                <th className="py-2 font-semibold text-sm text-center">Faltas Registradas</th>
                <th className="py-2 font-semibold text-sm text-center">Frequência (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-3 text-sm">1º Ano A - Manhã</td>
                <td className="py-3 text-sm">Matemática</td>
                <td className="py-3 text-sm text-center">20</td>
                <td className="py-3 text-sm text-center">15</td>
                <td className="py-3 text-sm text-center font-medium text-green-600">95%</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-3 text-sm">1º Ano A - Manhã</td>
                <td className="py-3 text-sm">Português</td>
                <td className="py-3 text-sm text-center">24</td>
                <td className="py-3 text-sm text-center">45</td>
                <td className="py-3 text-sm text-center font-medium text-amber-600">89%</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-3 text-sm">2º Ano A - Manhã</td>
                <td className="py-3 text-sm">Física</td>
                <td className="py-3 text-sm text-center">16</td>
                <td className="py-3 text-sm text-center">8</td>
                <td className="py-3 text-sm text-center font-medium text-green-600">98%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-32 pt-8 flex justify-around print:flex">
          <div className="text-center">
            <div className="w-48 border-t border-slate-400 mx-auto mb-2"></div>
            <p className="text-sm">Assinatura da Coordenação</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-t border-slate-400 mx-auto mb-2"></div>
            <p className="text-sm">Assinatura da Direção</p>
          </div>
        </div>
      </div>
      
      {/* Global Print Styles embedded in the component for convenience, usually placed in globals.css */}
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
