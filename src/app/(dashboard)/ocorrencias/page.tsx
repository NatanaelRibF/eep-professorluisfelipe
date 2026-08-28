import { getClassGroups } from "@/actions/class.actions";
import { getOccurrenceTypes } from "@/actions/config.actions";
import OcorrenciasListClient from "./ocorrencias-list-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function OcorrenciasPage() {
  const classes = await getClassGroups();
  const occurrenceTypes = await getOccurrenceTypes();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registro de Ocorrências</h1>
          <p className="text-slate-600">Gestão de ocorrências disciplinares.</p>
        </div>
        <Link href="/ocorrencias/novo">
          <Button className="bg-blue-800 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Ocorrência
          </Button>
        </Link>
      </div>
      <OcorrenciasListClient classes={classes} occurrenceTypes={occurrenceTypes} />
    </div>
  );
}
