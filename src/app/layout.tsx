import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ContaCliente", template: "%s | ContaCliente" },
  description: "Plataforma de comunicação entre escritório contábil e clientes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
