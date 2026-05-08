"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CheckSquare,
  DollarSign,
  Settings,
  LogOut,
  Calculator,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard, roles: ["admin", "staff", "client"] },
  { label: "Clientes",     href: "/clientes",     icon: Users,           roles: ["admin", "staff"] },
  { label: "Comunicação",  href: "/comunicacao",  icon: MessageSquare,   roles: ["admin", "staff", "client"] },
  { label: "Obrigações",   href: "/obrigacoes",   icon: CheckSquare,     roles: ["admin", "staff", "client"] },
  { label: "Financeiro",   href: "/financeiro",   icon: DollarSign,      roles: ["admin", "staff", "client"] },
  { label: "Configurações",href: "/configuracoes",icon: Settings,        roles: ["admin"] },
];

interface SidebarProps {
  role: UserRole;
  userName: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ role, userName, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">ContaCliente</span>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 mx-auto">
            <Calculator className="h-4 w-4 text-white" />
          </div>
        )}
        {onToggle && !collapsed && (
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-brand-600" : "text-gray-400")} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 p-3">
        <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-900">{userName}</p>
              <p className="text-xs capitalize text-gray-500">{role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className={cn(
            "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600",
            "hover:bg-red-50 hover:text-red-600 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Sair"}
        </button>
      </div>
    </aside>
  );
}
