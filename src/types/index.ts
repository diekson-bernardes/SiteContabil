// ─── Enums reais do banco ─────────────────────────────────────────────────────

export type StatusCliente   = "ativo" | "inativo";
export type Periodicidade   = "diaria" | "semanal" | "mensal" | "trimestral" | "semestral" | "anual" | "eventual";
export type TipoPrazo       = "vencimento" | "entrega" | "ambos";
export type StatusEntrega   = "pendente" | "entregue" | "vencendo_hoje" | "vencida" | "dispensada" | "nao_aplicavel" | "sem_movimento";
export type StatusFinanceiro= "pendente" | "pago" | "cancelado";

// Mantido para compatibilidade com Sidebar/layout
export type UserRole = "admin" | "staff" | "client";

// ─── Tabelas ─────────────────────────────────────────────────────────────────

export interface Cliente {
  id: string;
  codigo: number | null;
  rt: string | null;
  razao_social: string;
  cnpj: string;
  inscricao_estadual: string | null;
  regime_tributario: string | null;
  municipio: string | null;
  uf: string | null;
  status: StatusCliente;
  observacoes: string | null;
  honorarios: number | null;
  created_at: string;
  updated_at: string;
}

export interface Obrigacao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  periodicidade: Periodicidade;
  tipo_prazo: TipoPrazo;
  ativa: boolean;
  dia_vencimento: number | null;
  regra_vencimento: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteObrigacao {
  id: string;
  cliente_id: string;
  obrigacao_id: string;
  dia_vencimento: number | null;
  dia_limite_entrega: number | null;
  data_vencimento_fixa: string | null;
  data_limite_entrega_fixa: string | null;
  exige_valor: boolean;
  ativa: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
  obrigacao?: Obrigacao;
}

export interface Competencia {
  id: string;
  referencia: string; // YYYY-MM
  ano: number;
  mes: number;
  inicio_periodo: string;
  fim_periodo: string;
  created_at: string;
}

export interface EntregaObrigacao {
  id: string;
  cliente_obrigacao_id: string;
  competencia_id: string;
  data_vencimento: string | null;
  data_limite_entrega: string | null;
  status: StatusEntrega;
  data_entrega: string | null;
  valor: number | null;
  observacao: string | null;
  concluido_por: string | null;
  created_at: string;
  updated_at: string;
  // joined
  competencia?: Competencia;
  cliente_obrigacao?: ClienteObrigacao & {
    cliente?: Cliente;
    obrigacao?: Obrigacao;
  };
}

export interface FinanceiroHonorario {
  id: string;
  cliente_id: string;
  competencia_id: string;
  valor: number;
  status: StatusFinanceiro;
  data_pagamento: string | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
  // joined
  cliente?: Cliente;
  competencia?: Competencia;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  clientesAtivos: number;
  entregasPendentes: number;
  entregasVencidas: number;
  honorariosPendentes: number;
  totalRecebido: number;
  competenciaAtual: string;
}
