import { useEffect, useRef, useState } from "react";
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

interface TestMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");

  // Test bot state
  const [testMode, setTestMode] = useState(false);
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [testInput, setTestInput] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const testBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getConversations().then((d) => setConversations(d.conversations)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.getConversation(selected).then((d) => setMessages(d.messages)).catch((e) => setError(e.message));
  }, [selected]);

  useEffect(() => {
    testBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages]);

  async function handleTestSend() {
    if (!testInput.trim() || testLoading) return;
    const msg = testInput.trim();
    setTestInput("");
    setTestMessages((prev) => [...prev, { role: "user", content: msg }]);
    setTestLoading(true);
    try {
      const res = await api.testBot(msg);
      setTestMessages((prev) => [...prev, { role: "assistant", content: res.response || "Sem resposta" }]);
    } catch {
      setTestMessages((prev) => [...prev, { role: "assistant", content: "Erro ao processar. Tente novamente." }]);
    } finally {
      setTestLoading(false);
    }
  }

  async function handleClearTest() {
    await api.clearTestConversation().catch(() => {});
    setTestMessages([]);
  }

  function handleTestKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTestSend();
    }
  }

  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Conversas</h2>
        <button
          onClick={() => { setTestMode(!testMode); setSelected(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            testMode
              ? "bg-pipa-600 text-white"
              : "bg-pipa-50 text-pipa-700 border border-pipa-200 hover:bg-pipa-100"
          }`}
        >
          <span>🧪</span>
          {testMode ? "Sair do Teste" : "Testar Sofia"}
        </button>
      </div>

      <div className="flex gap-4 h-[calc(100vh-160px)]">
        {/* Left panel */}
        <div className="w-80 bg-white rounded-lg shadow overflow-auto flex-shrink-0">
          {testMode ? (
            <div className="p-4 border-b bg-pipa-50">
              <p className="text-sm font-semibold text-pipa-700">Modo Teste Ativo</p>
              <p className="text-xs text-pipa-500 mt-1">Testando a Sofia diretamente — nenhuma mensagem é enviada no WhatsApp</p>
            </div>
          ) : null}
          {conversations.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">Nenhuma conversa</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.phone_number}
                onClick={() => { setSelected(c.phone_number); setTestMode(false); }}
                className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                  !testMode && selected === c.phone_number ? "bg-pipa-50" : ""
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

        {/* Right panel */}
        {testMode ? (
          /* Test bot chat interface */
          <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-pipa-700">🧪 Testar Sofia</h3>
                <p className="text-xs text-gray-500">Conversa de teste — não envia mensagens reais no WhatsApp</p>
              </div>
              {testMessages.length > 0 && (
                <button
                  onClick={handleClearTest}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Limpar conversa
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {testMessages.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <p className="text-lg mb-2">👋</p>
                  <p className="text-sm">Mande uma mensagem para testar a Sofia</p>
                  <p className="text-xs mt-2 text-gray-300">Ex: "Oi", "Quais praias tem em Pipa?", "Quanto custa um transfer?"</p>
                </div>
              ) : (
                testMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "assistant" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                        m.role === "assistant"
                          ? "bg-pipa-100 text-pipa-900"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {testLoading && (
                <div className="flex justify-end">
                  <div className="bg-pipa-50 text-pipa-400 px-4 py-2 rounded-lg text-sm animate-pulse">
                    Sofia está digitando...
                  </div>
                </div>
              )}
              <div ref={testBottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={handleTestKeyDown}
                placeholder="Digite uma mensagem para testar..."
                rows={2}
                disabled={testLoading}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pipa-300 disabled:opacity-50"
              />
              <button
                onClick={handleTestSend}
                disabled={testLoading || !testInput.trim()}
                className="px-4 py-2 bg-pipa-600 text-white rounded-lg text-sm font-medium hover:bg-pipa-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        ) : (
          /* Regular conversation thread */
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
                      {m.role === "assistant" ? "Sofia" : "Usuário"} -{" "}
                      {new Date(m.created_at).toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
