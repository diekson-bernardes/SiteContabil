"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("E-mail ou senha inválidos. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-brand-700 px-12 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">ContaCliente</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Gerencie sua carteira de clientes com eficiência
          </h2>
          <p className="mt-4 text-brand-200">
            Comunicação, obrigações e financeiro em um só lugar.
          </p>
        </div>
        <div className="flex gap-8">
          {[["Clientes", "Gestão completa"], ["Obrigações", "Controle de prazos"], ["Financeiro", "Honorários"]].map(([title, sub]) => (
            <div key={title}>
              <p className="font-semibold text-white">{title}</p>
              <p className="text-sm text-brand-200">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">ContaCliente</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-gray-500">Acesse sua conta para continuar</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              leftIcon={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
            />
            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Problemas para acessar? Entre em contato com o escritório.
          </p>
        </div>
      </div>
    </div>
  );
}
