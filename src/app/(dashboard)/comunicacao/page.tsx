"use client";

import { useState } from "react";
import { Plus, Send, Search, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn, formatDate } from "@/lib/utils";

interface MessageThread {
  id: string;
  subject: string;
  clientName: string;
  preview: string;
  date: string;
  unread: boolean;
  status: "sent" | "read" | "archived";
}

const MOCK_THREADS: MessageThread[] = [
  { id: "1", subject: "Dúvida sobre IRPJ",           clientName: "Empresa XYZ",    preview: "Olá, gostaria de saber sobre o prazo...", date: "2026-05-07", unread: true,  status: "sent" },
  { id: "2", subject: "Documentos para entrega",     clientName: "Tech Soluções",  preview: "Precisamos dos seguintes documentos...", date: "2026-05-06", unread: true,  status: "sent" },
  { id: "3", subject: "Re: Certidão Negativa",       clientName: "Empresa ABC",    preview: "A certidão foi emitida hoje e...",         date: "2026-05-05", unread: false, status: "read" },
  { id: "4", subject: "Alteração de sócio",          clientName: "Comércio Geral", preview: "Boa tarde, precisamos formalizar...",      date: "2026-05-04", unread: false, status: "read" },
  { id: "5", subject: "Honorários de abril",         clientName: "Loja Beta",      preview: "Seguem os boletos referentes ao mês...",  date: "2026-05-03", unread: false, status: "read" },
];

const MOCK_MESSAGES = [
  { id: "1", sender: "Empresa XYZ",  body: "Olá, gostaria de saber sobre o prazo para entrega do IRPJ e quais documentos são necessários.", date: "2026-05-07T09:30:00Z", isOwn: false },
  { id: "2", sender: "Escritório",   body: "Bom dia! O prazo para entrega do IRPJ é dia 30/05. Os documentos necessários são: DRE, Balanço Patrimonial e Livro Caixa.", date: "2026-05-07T10:15:00Z", isOwn: true },
];

export default function ComunicacaoPage() {
  const [search, setSearch] = useState("");
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(MOCK_THREADS[0]);
  const [newMessage, setNewMessage] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const filtered = MOCK_THREADS.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Thread list */}
      <div className="flex w-80 flex-col border-r border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900">Mensagens</h2>
          <Button size="sm" onClick={() => setComposeOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </div>
        <div className="p-3 border-b border-gray-100">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-3.5 w-3.5" />}
            className="h-8 text-xs"
          />
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filtered.map((thread) => (
            <li
              key={thread.id}
              onClick={() => setSelectedThread(thread)}
              className={cn(
                "cursor-pointer px-4 py-3 hover:bg-gray-50 transition-colors",
                selectedThread?.id === thread.id && "bg-brand-50",
                thread.unread && "border-l-2 border-l-brand-500"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={cn("text-sm truncate", thread.unread ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                  {thread.subject}
                </p>
                <p className="text-xs shrink-0 text-gray-400">{formatDate(thread.date, "dd/MM")}</p>
              </div>
              <p className="text-xs text-brand-600 font-medium">{thread.clientName}</p>
              <p className="mt-0.5 text-xs text-gray-500 truncate">{thread.preview}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Message panel */}
      {selectedThread ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{selectedThread.subject}</h3>
              <p className="text-xs text-gray-500">{selectedThread.clientName}</p>
            </div>
            <Badge variant={selectedThread.unread ? "blue" : "gray"}>
              {selectedThread.unread ? "Não lido" : "Lido"}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {MOCK_MESSAGES.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-md rounded-2xl px-4 py-3",
                    msg.isOwn
                      ? "bg-brand-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  )}
                >
                  <p className={cn("text-xs font-medium mb-1", msg.isOwn ? "text-brand-200" : "text-gray-500")}>
                    {msg.sender}
                  </p>
                  <p className="text-sm">{msg.body}</p>
                  <p className={cn("mt-1 text-right text-xs", msg.isOwn ? "text-brand-200" : "text-gray-400")}>
                    {formatDate(msg.date, "HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-end gap-2">
              <textarea
                className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Digite sua resposta..."
                rows={2}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="sm" className="h-9 w-9 p-0" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">Selecione uma conversa</p>
        </div>
      )}

      {/* Compose modal */}
      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Nova Mensagem"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancelar</Button>
            <Button><Send className="h-4 w-4" />Enviar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Para (cliente)" placeholder="Selecione o cliente..." />
          <Input label="Assunto" placeholder="Assunto da mensagem..." />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Mensagem</label>
            <textarea
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={6}
              placeholder="Escreva sua mensagem..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
