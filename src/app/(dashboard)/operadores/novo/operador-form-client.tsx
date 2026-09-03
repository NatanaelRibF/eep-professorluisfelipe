"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, UserPlus, BookOpen, School } from "lucide-react";
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

export default function OperadorFormClient({ 
  roles, 
  subjects = [],
  classes = []
}: { 
  roles: any[]; 
  subjects?: any[];
  classes?: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const selectedRoleName = roles.find((r) => r.id === roleId)?.name;
  const isProfessor = selectedRoleName === "Professor";

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleToggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

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
        subjectIds: selectedSubjectIds,
        classIds: selectedClassIds,
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
              Cadastre um novo professor ou funcionário com foto, cargo e disciplinas que leciona.
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

            {/* Atribuição de Disciplinas ao Professor */}
            {(isProfessor || subjects.length > 0) && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <Label className="font-bold text-slate-800 text-xs uppercase">
                    Disciplinas Atribuídas a este Docente
                  </Label>
                </div>
                <p className="text-xs text-slate-500">
                  Selecione as matérias que este professor leciona. O professor poderá ministrar estas disciplinas em qualquer turma da escola.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {subjects.map((sub: any) => {
                    const isChecked = selectedSubjectIds.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSubject(sub.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
                        />
                        <span className="truncate">{sub.name}</span>
                        {sub.abbreviation && (
                          <span className="text-[10px] font-mono text-slate-400">({sub.abbreviation})</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Atribuição de Turmas ao Professor */}
            {(isProfessor || classes.length > 0) && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-blue-600" />
                    <Label className="font-bold text-slate-800 text-xs uppercase">
                      Turmas Atribuídas a este Docente
                    </Label>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full">
                    {selectedClassIds.length} {selectedClassIds.length === 1 ? 'turma selecionada' : 'turmas selecionadas'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Selecione as turmas em que este professor leciona. O professor terá acesso exclusivo a estas turmas no lançamento e relatórios de frequência.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {classes.map((cls: any) => {
                    const isChecked = selectedClassIds.includes(cls.id);
                    return (
                      <label
                        key={cls.id}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleClass(cls.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
                        />
                        <span className="truncate font-semibold">{cls.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({cls.shift === "MANHA" ? "Manhã" : cls.shift === "TARDE" ? "Tarde" : "Noite"})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
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
