import { useEffect, useState } from "react";
import { api } from "../api";

interface Conversation {
  phone_number: string;
  user_name: string;
  state: string;
  total_messages: number;
  lead_captured: boolean;
  last_interaction: string;
  last_message: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getConversations().then((d) => setConversations(d.conversations)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.getConversation(selected).then((d) => setMessages(d.messages)).catch((e) => setError(e.message));
  }, [selected]);

  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Conversas</h2>

      <div className="flex gap-4 h-[calc(100vh-140px)]">
        {/* Conversation list */}
        <div className="w-80 bg-white rounded-lg shadow overflow-auto">
          {conversations.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">Nenhuma conversa</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.phone_number}
                onClick={() => setSelected(c.phone_number)}
                className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                  selected === c.phone_number ? "bg-pipa-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm">{c.user_name || c.phone_number}</span>
                  {c.lead_captured && (
                    <span className="text-xs bg-pipa-100 text-pipa-700 px-1.5 py-0.5 rounded">Lead</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">{c.last_message || "..."}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(c.last_interaction).toLocaleString("pt-BR")} - {c.total_messages} msgs
                </p>
              </button>
            ))
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-auto p-4">
          {!selected ? (
            <p className="text-gray-400 text-center mt-20">Selecione uma conversa</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400 text-sm">Sem mensagens</p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] ${m.role === "assistant" ? "ml-auto" : ""}`}
                >
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      m.role === "assistant"
                        ? "bg-pipa-100 text-pipa-900"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {m.content}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {m.role === "assistant" ? "Helena" : "Usuário"} -{" "}
                    {new Date(m.created_at).toLocaleTimeString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
