export type UserRole = "admin" | "staff" | "client";

export type ClientStatus = "active" | "inactive" | "pending";

export type MessageStatus = "sent" | "read" | "archived";

export type ObrigacaoStatus = "pending" | "in_progress" | "completed" | "overdue";

export type ObrigacaoPriority = "low" | "medium" | "high" | "critical";

export type HonorarioStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  profile_id: string | null;
  company_name: string;
  cnpj: string | null;
  cpf: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  status: ClientStatus;
  responsible_staff_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  responsible_staff?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  client_id: string | null;
  subject: string;
  body: string;
  status: MessageStatus;
  parent_id: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  recipient?: Profile;
  client?: Client;
  replies?: Message[];
}

export interface Obrigacao {
  id: string;
  client_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  due_date: string;
  competence_date: string | null;
  status: ObrigacaoStatus;
  priority: ObrigacaoPriority;
  category: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  assignee?: Profile;
}

export interface Honorario {
  id: string;
  client_id: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: HonorarioStatus;
  reference_month: string | null;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  pendingObrigacoes: number;
  overdueObrigacoes: number;
  unreadMessages: number;
  pendingHonorarios: number;
  overdueHonorarios: number;
  monthlyRevenue: number;
}
