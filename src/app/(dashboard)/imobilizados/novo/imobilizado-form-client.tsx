"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Projector } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createEquipment } from "@/actions/equipment.actions";
import { toast } from "sonner";

export default function ImobilizadoFormClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState(`PAT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [category, setCategory] = useState("Projetor");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [location, setLocation] = useState("Sala dos Professores");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !category || !location) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const res = await createEquipment({
        name,
        code,
        category,
        brand,
        model,
        location,
        description,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao cadastrar equipamento.");
        return;
      }

      toast.success("Equipamento cadastrado com sucesso!");
      router.push("/imobilizados");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar equipamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Link href="/imobilizados">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
          <Projector className="h-7 w-7 text-blue-600" />
          Novo Imobilizado / Equipamento
        </h2>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados do Equipamento</CardTitle>
            <CardDescription>
              Cadastre um novo item (projetor, caixa de som, microfone, notebook) para controle e agenda de uso.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Equipamento *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Projetor Epson PowerLite #03"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código / Nº Patrimônio *</Label>
                <Input
                  id="code"
                  placeholder="Ex: PAT-PROJ-03"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Projetor">Projetor</SelectItem>
                    <SelectItem value="Caixa de Som">Caixa de Som</SelectItem>
                    <SelectItem value="Microfone">Microfone</SelectItem>
                    <SelectItem value="Notebook">Notebook</SelectItem>
                    <SelectItem value="Televisor">Televisor / Monitor</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  placeholder="Ex: Epson, Mondial, JBL"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  placeholder="Ex: PowerLite X49"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local de Guarda / Armazenamento *</Label>
              <Input
                id="location"
                placeholder="Ex: Sala dos Professores (Armário A), Coordenação, Lab 1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição / Acessórios Inclusos</Label>
              <Textarea
                id="description"
                placeholder="Ex: Acompanha cabo HDMI de 3m, fonte bivolt, controle remoto e bolsa de proteção."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Link href="/imobilizados">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="bg-blue-800 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {loading ? "Salvando..." : "Salvar Equipamento"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
