import { getClassGroups } from "@/actions/class.actions";
import { getRACTypes } from "@/actions/config.actions";
import RacListClient from "./rac-list-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Award } from "lucide-react";

export default async function RacPage() {
  const classes = await getClassGroups();
  const racTypes = await getRACTypes();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registros de RAC</h1>
          <p className="text-slate-600">Registro de Acompanhamento em Sala de Aula.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/rac/notas">
            <Button variant="outline" className="border-amber-500 text-amber-900 hover:bg-amber-50 font-bold text-xs h-10 shadow-sm">
              <Award className="h-4 w-4 mr-1.5 text-amber-600" />
              Boletim de Notas do RAC
            </Button>
          </Link>
          <Link href="/rac/novo">
            <Button className="bg-blue-800 hover:bg-blue-700 font-bold text-xs h-10 shadow-sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Registro RAC
            </Button>
          </Link>
        </div>
      </div>
      <RacListClient classes={classes} racTypes={racTypes} />
    </div>
  );
}
