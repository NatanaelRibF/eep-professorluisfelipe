"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, UserCog, KeyRound } from "lucide-react";
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
import { PhotoUpload } from "@/components/shared/photo-upload";
import { updateOperator } from "@/actions/operator.actions";
import { toast } from "sonner";

interface OperadorEditClientProps {
  operator: any;
  roles: any[];
}

export default function OperadorEditClient({ operator, roles }: OperadorEditClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(operator.name || "");
  const [email, setEmail] = useState(operator.email || "");
  const [roleId, setRoleId] = useState(operator.roleId || "");
  const [avatarUrl, setAvatarUrl] = useState(operator.avatarUrl || "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(operator.isActive !== false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !roleId) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateOperator(operator.id, {
        name,
        email,
        roleId,
        avatarUrl,
        password: password.trim() !== "" ? password : undefined,
        isActive,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao atualizar operador.");
        return;
      }

      toast.success("Operador atualizado com sucesso!");
      router.push("/operadores");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar operador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Link href="/operadores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
            <UserCog className="h-7 w-7 text-blue-600" />
            Editar Operador
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Atualize dados, foto, cargo e redefina a senha de acesso do usuário.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados de Acesso e Perfil</CardTitle>
            <CardDescription>
              Modifique as informações cadastrais de <strong>{operator.name}</strong>.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Foto de Perfil */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <Label>Foto de Perfil do Operador</Label>
              <PhotoUpload value={avatarUrl} onChange={setAvatarUrl} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prof. Roberto Carlos"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Acesso *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@eeep.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Cargo / Perfil de Acesso *</Label>
                <Select value={roleId} onValueChange={setRoleId} required>
                  <SelectTrigger id="role">
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

              <div className="space-y-2">
                <Label htmlFor="statusSelect">Status da Conta</Label>
                <Select
                  value={isActive ? "ACTIVE" : "INACTIVE"}
                  onValueChange={(val) => setIsActive(val === "ACTIVE")}
                >
                  <SelectTrigger id="statusSelect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">🟢 Ativo (Acesso Liberado)</SelectItem>
                    <SelectItem value="INACTIVE">🔴 Inativo (Bloqueado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Redefinição de Senha */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-600" />
                <Label htmlFor="password" className="font-semibold text-slate-800">
                  Nova Senha de Acesso (Opcional)
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Deixe em branco para manter a senha atual..."
              />
              <p className="text-[11px] text-slate-500">
                Preencha este campo apenas se desejar redefinir a senha do operador.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Link href="/operadores">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="bg-blue-800 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
