import { Metadata } from "next";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Building2, Users, Bell, Shield } from "lucide-react";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Office data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-600" />
            <CardTitle>Dados do Escritório</CardTitle>
          </div>
        </CardHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome do escritório" defaultValue="Contabilidade Modelo" />
            <Input label="CNPJ" defaultValue="00.000.000/0001-00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefone" defaultValue="(11) 3000-0000" />
            <Input label="E-mail" type="email" defaultValue="contato@contabilidade.com" />
          </div>
          <Input label="Endereço" defaultValue="Av. Paulista, 1000 - São Paulo/SP" />
          <div className="flex justify-end">
            <Button>Salvar alterações</Button>
          </div>
        </div>
      </Card>

      {/* Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-600" />
            <CardTitle>Usuários do Sistema</CardTitle>
          </div>
          <Button size="sm" variant="outline">Convidar usuário</Button>
        </CardHeader>
        <div className="space-y-3">
          {[
            { name: "Carlos Silva",    email: "carlos@contabil.com",  role: "Admin",  initials: "CS" },
            { name: "Ana Souza",       email: "ana@contabil.com",     role: "Staff",  initials: "AS" },
            { name: "Pedro Lima",      email: "pedro@contabil.com",   role: "Staff",  initials: "PL" },
          ].map((u) => (
            <div key={u.email} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {u.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {u.role}
                </span>
                <Button variant="ghost" size="sm">Editar</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-600" />
            <CardTitle>Notificações</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-4">
          {[
            { label: "E-mail ao receber nova mensagem",     defaultChecked: true  },
            { label: "Alerta de obrigação próxima do prazo",defaultChecked: true  },
            { label: "Lembrete de honorário vencido",       defaultChecked: true  },
            { label: "Resumo semanal por e-mail",           defaultChecked: false },
          ].map(({ label, defaultChecked }) => (
            <label key={label} className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-sm text-gray-700">{label}</span>
              <input type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            </label>
          ))}
          <div className="flex justify-end pt-2">
            <Button>Salvar preferências</Button>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            <CardTitle>Segurança</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <Input label="Senha atual" type="password" placeholder="••••••••" />
          <Input label="Nova senha" type="password" placeholder="••••••••" />
          <Input label="Confirmar nova senha" type="password" placeholder="••••••••" />
          <div className="flex justify-end">
            <Button>Alterar senha</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
