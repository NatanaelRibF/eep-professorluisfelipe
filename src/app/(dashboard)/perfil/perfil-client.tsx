"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, KeyRound, Save, Loader2, Mail, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { updateMyProfile } from "@/actions/operator.actions";
import { toast } from "sonner";

interface PerfilClientProps {
  profile: any;
}

export default function PerfilClient({ profile }: PerfilClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword) {
      if (!currentPassword) {
        toast.error("Informe sua senha atual para alterar a senha.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("A nova senha e a confirmação não coincidem.");
        return;
      }
      if (newPassword.length < 4) {
        toast.error("A nova senha deve ter no mínimo 4 caracteres.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await updateMyProfile({
        avatarUrl,
        currentPassword: currentPassword ? currentPassword : undefined,
        newPassword: newPassword ? newPassword : undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao atualizar perfil.");
        return;
      }

      toast.success("✅ Seu perfil foi atualizado com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
          <User className="h-7 w-7 text-blue-600" />
          Meu Perfil & Conta
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Gerencie sua foto de perfil e altere sua senha de acesso ao sistema.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-900">Informações da Conta</CardTitle>
                <CardDescription className="text-xs">
                  Suas credenciais e foto de exibição no sistema.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 font-semibold text-xs px-3 py-1">
                <Shield className="w-3.5 h-3.5 mr-1" />
                {profile.role?.name || "Operador"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Foto de Perfil */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <Label className="font-semibold text-slate-800">Sua Foto de Perfil</Label>
              <p className="text-xs text-slate-500 mb-2">
                Tire uma foto com a câmera ou escolha um arquivo. Esta foto aparecerá no cabeçalho e em seus registros.
              </p>
              <PhotoUpload value={avatarUrl} onChange={setAvatarUrl} />
            </div>

            {/* Dados Cadastrais Bloqueados para Edição pelo Próprio Operador */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profileName" className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Nome Completo
                </Label>
                <Input
                  id="profileName"
                  value={profile.name}
                  disabled
                  className="h-11 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-500">
                  O nome cadastral só pode ser alterado pela direção escolar.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileEmail" className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  E-mail de Login
                </Label>
                <div className="relative">
                  <Input
                    id="profileEmail"
                    value={profile.email}
                    disabled
                    className="h-11 bg-slate-100 text-slate-700 font-mono text-xs cursor-not-allowed pl-9"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-500">
                  E-mail institucional registrado na escola.
                </p>
              </div>
            </div>

            {/* Alteração de Senha */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Alterar Minha Senha</h3>
                  <p className="text-xs text-slate-500">
                    Deixe os campos em branco se não desejar alterar sua senha.
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold text-slate-700">
                    Senha Atual
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual..."
                    className="h-10 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700">
                      Nova Senha
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres..."
                      className="h-10 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                      Confirmar Nova Senha
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha..."
                      className="h-10 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-slate-100 pt-4 pb-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-sm w-full sm:w-auto"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
