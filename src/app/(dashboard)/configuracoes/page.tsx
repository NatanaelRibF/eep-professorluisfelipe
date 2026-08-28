import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-blue-900">Configurações do Sistema</h2>
      </div>

      <Tabs defaultValue="disciplinas" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="disciplinas">Disciplinas</TabsTrigger>
          <TabsTrigger value="rac">Tipos de RAC</TabsTrigger>
          <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
          <TabsTrigger value="ano-letivo">Ano Letivo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="disciplinas" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Disciplinas</CardTitle>
                <CardDescription>Gerencie as disciplinas oferecidas pela escola.</CardDescription>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Disciplina
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500 py-6 text-center">
                Módulo em construção. Aqui será exibida a lista de disciplinas.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rac" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Tipos de RAC</CardTitle>
                <CardDescription>Configure os tipos de Registro de Acompanhamento de Classe e suas gravidades.</CardDescription>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Tipo RAC
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500 py-6 text-center">
                Módulo em construção. Aqui será exibida a lista de categorias RAC.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocorrencias" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Tipos de Ocorrência</CardTitle>
                <CardDescription>Cadastre as categorias de ocorrências disciplinares.</CardDescription>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Ocorrência
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500 py-6 text-center">
                Módulo em construção. Aqui será exibida a lista de tipos de ocorrência.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ano-letivo" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Ano Letivo</CardTitle>
                <CardDescription>Gerencie os anos letivos e períodos da escola.</CardDescription>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Ano Letivo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500 py-6 text-center">
                Módulo em construção. Aqui será exibida a configuração de ano letivo.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
