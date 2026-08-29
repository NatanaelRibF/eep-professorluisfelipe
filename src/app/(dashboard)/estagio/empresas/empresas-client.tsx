"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Plus, Phone, Mail, MapPin, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createInternshipCompany } from "@/actions/estagio.actions";
import { toast } from "sonner";

export default function EmpresasClient({ companies }: { companies: any[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tradeName, setTradeName] = useState("");
  const [corporateName, setCorporateName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Sobral");
  const [industryArea, setIndustryArea] = useState("Tecnologia e Serviços");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName || !corporateName || !contactPerson) {
      toast.error("Preencha Razão Social, Nome Fantasia e Responsável.");
      return;
    }

    setLoading(true);
    try {
      const res = await createInternshipCompany({
        tradeName,
        corporateName,
        cnpj,
        contactPerson,
        phone,
        email,
        address,
        city,
        industryArea,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao cadastrar empresa");
        return;
      }

      toast.success("Empresa parceira cadastrada com sucesso!");
      setShowModal(false);
      setTradeName("");
      setCorporateName("");
      setCnpj("");
      setContactPerson("");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro ao cadastrar empresa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/estagio">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
              <Building2 className="h-7 w-7 text-purple-600" />
              Empresas Parceiras & Conveniadas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Rede de empresas que acolhem estagiários dos cursos técnicos da EEEP.
            </p>
          </div>
        </div>

        <Button onClick={() => setShowModal(true)} className="bg-blue-800 hover:bg-blue-700 font-bold text-xs">
          <Plus className="w-4 h-4 mr-1.5" />
          Cadastrar Empresa
        </Button>
      </div>

      {/* Modal / Form */}
      {showModal && (
        <Card className="border-purple-200 bg-purple-50/40 shadow-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-3 border-b border-purple-100">
              <CardTitle className="text-base text-purple-950">Nova Empresa Parceira</CardTitle>
              <CardDescription className="text-xs">Preencha os dados cadastrais da instituição concedente do estágio.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tradeName" className="text-xs font-semibold text-slate-700">Nome Fantasia *</Label>
                  <Input id="tradeName" value={tradeName} onChange={(e) => setTradeName(e.target.value)} placeholder="Ex: Tech Solutions Sobral" required className="h-10 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="corpName" className="text-xs font-semibold text-slate-700">Razão Social *</Label>
                  <Input id="corpName" value={corporateName} onChange={(e) => setCorporateName(e.target.value)} placeholder="Ex: Tech Solutions Servicos LTDA" required className="h-10 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cnpj" className="text-xs font-semibold text-slate-700">CNPJ</Label>
                  <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className="h-10 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact" className="text-xs font-semibold text-slate-700">Responsável / Supervisor *</Label>
                  <Input id="contact" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Nome do contato na empresa" required className="h-10 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Telefone / WhatsApp</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(88) 99999-9999" className="h-10 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" className="h-10 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="area" className="text-xs font-semibold text-slate-700">Ramo de Atuação</Label>
                  <Input id="area" value={industryArea} onChange={(e) => setIndustryArea(e.target.value)} placeholder="Tecnologia, Saúde, Indústria..." className="h-10 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold text-slate-700">Cidade</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="h-10 text-xs" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} size="sm" className="bg-purple-800 hover:bg-purple-700 font-bold text-xs">
                {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                Salvar Empresa
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((comp) => (
          <Card key={comp.id} className="border-slate-200 shadow-sm hover:border-purple-300 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {comp.industryArea}
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                  {comp._count?.internships || 0} Estagiários
                </Badge>
              </div>
              <CardTitle className="text-base font-bold text-slate-900 mt-1">
                {comp.tradeName}
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500 font-mono">
                {comp.corporateName} {comp.cnpj ? `• CNPJ: ${comp.cnpj}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{comp.city} {comp.address ? `— ${comp.address}` : ""}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contato: <strong>{comp.contactPerson}</strong> {comp.phone ? `(${comp.phone})` : ""}</span>
              </div>
              {comp.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{comp.email}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
