"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, UserPlus } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createOperator } from "@/actions/operator.actions";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { toast } from "sonner";

export default function OperadorFormClient({ roles }: { roles: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email || !password || !roleId) {
      toast.error("Preencha todos os campos obrigatórios (Nome, Sobrenome, E-mail, Senha e Cargo).");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    setLoading(true);
    try {
      const res = await createOperator({
        name: fullName,
        nickname: nickname.trim() ? nickname.trim() : undefined,
        email,
        password,
        roleId,
        avatarUrl,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao salvar operador.");
        return;
      }

      toast.success("Operador cadastrado com sucesso!");
      router.push("/operadores");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao salvar operador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2">
        <Link href="/operadores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
          <UserPlus className="h-7 w-7 text-blue-600" />
          Novo Operador
        </h1>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados do Operador</CardTitle>
            <CardDescription>
              Cadastre um novo professor ou funcionário com foto e permissões no sistema.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Foto de Perfil */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <Label className="font-semibold text-slate-800">Foto de Perfil do Operador</Label>
              <PhotoUpload value={avatarUrl} onChange={setAvatarUrl} />
            </div>

            {/* Nome, Sobrenome e Apelido */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">Nome *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Carlos"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">Sobrenome *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Eduardo Silveira"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-xs font-semibold text-slate-700">Apelido / Tratamento</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: Prof. Carlinhos"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">E-mail de Acesso *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@eeep.com"
                required
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Senha Inicial *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-semibold text-slate-700">Cargo / Perfil de Acesso *</Label>
                <Select value={roleId} onValueChange={setRoleId} required>
                  <SelectTrigger id="role" className="h-10">
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Link href="/operadores">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="bg-blue-800 hover:bg-blue-700 font-bold" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {loading ? "Salvando..." : "Salvar Operador"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
