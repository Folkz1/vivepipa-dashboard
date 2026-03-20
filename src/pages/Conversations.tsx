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
  message_id?: string;
  feedback?: { rating: "good" | "bad"; saved: boolean };
}

const FEEDBACK_CATEGORIES = [
  { value: "idioma_errado", label: "Idioma errado" },
  { value: "info_inventada", label: "Informação inventada" },
  { value: "formal_demais", label: "Formal demais" },
  { value: "fora_tema", label: "Fora do tema" },
  { value: "incompleta", label: "Incompleta" },
  { value: "repetitiva", label: "Repetitiva" },
  { value: "outro", label: "Outro" },
];

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

  // Feedback state
  const [feedbackIdx, setFeedbackIdx] = useState<number | null>(null);
  const [fbCategory, setFbCategory] = useState("");
  const [fbExpected, setFbExpected] = useState("");
  const [fbComment, setFbComment] = useState("");
  const [fbSaving, setFbSaving] = useState(false);

  useEffect(() => {
    api
      .getConversations()
      .then((d) => setConversations(d.conversations))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api
      .getConversation(selected)
      .then((d) => setMessages(d.messages))
      .catch((e) => setError(e.message));
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
      setTestMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.response || "Sem resposta",
          message_id: res.message_id,
        },
      ]);
    } catch {
      setTestMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao processar. Tente novamente." },
      ]);
    } finally {
      setTestLoading(false);
    }
  }

  async function handleClearTest() {
    await api.clearTestConversation().catch(() => {});
    setTestMessages([]);
    setFeedbackIdx(null);
  }

  function handleTestKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTestSend();
    }
  }

  async function handleFeedback(idx: number, rating: "good" | "bad") {
    const msg = testMessages[idx];
    if (!msg.message_id) return;

    if (rating === "good") {
      // Thumbs up — save directly
      try {
        await api.submitFeedback({ message_id: msg.message_id, rating: "good" });
        setTestMessages((prev) =>
          prev.map((m, i) =>
            i === idx ? { ...m, feedback: { rating: "good", saved: true } } : m,
          ),
        );
      } catch {
        // silent fail
      }
      return;
    }

    // Thumbs down — open form
    setFeedbackIdx(idx);
    setFbCategory("");
    setFbExpected("");
    setFbComment("");
  }

  async function handleSubmitFeedback() {
    if (feedbackIdx === null) return;
    const msg = testMessages[feedbackIdx];
    if (!msg.message_id) return;

    setFbSaving(true);
    try {
      await api.submitFeedback({
        message_id: msg.message_id,
        rating: "bad",
        category: fbCategory || undefined,
        expected_response: fbExpected || undefined,
        comment: fbComment || undefined,
      });
      setTestMessages((prev) =>
        prev.map((m, i) =>
          i === feedbackIdx
            ? { ...m, feedback: { rating: "bad", saved: true } }
            : m,
        ),
      );
      setFeedbackIdx(null);
    } catch {
      // silent fail
    } finally {
      setFbSaving(false);
    }
  }

  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Conversas</h2>
        <button
          onClick={() => {
            setTestMode(!testMode);
            setSelected(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            testMode
              ? "bg-pipa-600 text-white"
              : "bg-pipa-50 text-pipa-700 border border-pipa-200 hover:bg-pipa-100"
          }`}
        >
          <span>{testMode ? "🧪" : "🧪"}</span>
          {testMode ? "Sair do Teste" : "Testar Sofia"}
        </button>
      </div>

      <div className="flex gap-4 h-[calc(100vh-160px)]">
        {/* Left panel */}
        <div className="w-80 bg-white rounded-lg shadow overflow-auto flex-shrink-0">
          {testMode ? (
            <div className="p-4 border-b bg-pipa-50">
              <p className="text-sm font-semibold text-pipa-700">
                Modo Teste Ativo
              </p>
              <p className="text-xs text-pipa-500 mt-1">
                Teste a Sofia e avalie cada resposta. Seu feedback melhora o bot!
              </p>
            </div>
          ) : null}
          {conversations.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">Nenhuma conversa</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.phone_number}
                onClick={() => {
                  setSelected(c.phone_number);
                  setTestMode(false);
                }}
                className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                  !testMode && selected === c.phone_number ? "bg-pipa-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm">
                    {c.user_name || c.phone_number}
                  </span>
                  {c.lead_captured && (
                    <span className="text-xs bg-pipa-100 text-pipa-700 px-1.5 py-0.5 rounded">
                      Lead
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {c.last_message || "..."}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(c.last_interaction).toLocaleString("pt-BR")} -{" "}
                  {c.total_messages} msgs
                </p>
              </button>
            ))
          )}
        </div>

        {/* Right panel */}
        {testMode ? (
          /* Test bot chat interface with feedback */
          <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-pipa-700">
                  🧪 Testar Sofia
                </h3>
                <p className="text-xs text-gray-500">
                  Avalie as respostas da Sofia para melhorar o atendimento
                </p>
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

            {/* Messages with feedback */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {testMessages.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <p className="text-lg mb-2">👋</p>
                  <p className="text-sm">Mande uma mensagem para testar a Sofia</p>
                  <p className="text-xs mt-2 text-gray-300">
                    Ex: "Oi", "Quais praias tem em Pipa?", "Quanto custa um
                    transfer?"
                  </p>
                  <p className="text-xs mt-4 text-pipa-400">
                    Depois de cada resposta, avalie com 👍 ou 👎
                  </p>
                </div>
              ) : (
                testMessages.map((m, i) => (
                  <div key={i}>
                    <div
                      className={`flex ${
                        m.role === "assistant" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                          m.role === "assistant"
                            ? m.feedback?.rating === "bad"
                              ? "bg-red-50 text-red-900 border border-red-200"
                              : m.feedback?.rating === "good"
                                ? "bg-green-50 text-green-900 border border-green-200"
                                : "bg-pipa-100 text-pipa-900"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>

                    {/* Feedback buttons for assistant messages */}
                    {m.role === "assistant" && m.message_id && (
                      <div className="flex justify-end mt-1 gap-1">
                        {m.feedback?.saved ? (
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              m.feedback.rating === "good"
                                ? "text-green-600 bg-green-50"
                                : "text-red-600 bg-red-50"
                            }`}
                          >
                            {m.feedback.rating === "good"
                              ? "👍 Correto"
                              : "👎 Feedback salvo"}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleFeedback(i, "good")}
                              className="text-xs px-2 py-0.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                              title="Resposta correta"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => handleFeedback(i, "bad")}
                              className="text-xs px-2 py-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Resposta precisa melhorar"
                            >
                              👎
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Inline feedback form */}
                    {feedbackIdx === i && (
                      <div className="flex justify-end mt-2">
                        <div className="w-[80%] bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-semibold text-red-700">
                            O que deu errado?
                          </p>

                          <select
                            value={fbCategory}
                            onChange={(e) => setFbCategory(e.target.value)}
                            className="w-full text-xs border border-red-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-red-300"
                          >
                            <option value="">Selecione a categoria...</option>
                            {FEEDBACK_CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>

                          <textarea
                            value={fbExpected}
                            onChange={(e) => setFbExpected(e.target.value)}
                            placeholder="Como ela deveria ter respondido?"
                            rows={2}
                            className="w-full text-xs border border-red-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
                          />

                          <textarea
                            value={fbComment}
                            onChange={(e) => setFbComment(e.target.value)}
                            placeholder="Comentário adicional (opcional)"
                            rows={1}
                            className="w-full text-xs border border-red-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
                          />

                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setFeedbackIdx(null)}
                              className="text-xs px-3 py-1 rounded text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSubmitFeedback}
                              disabled={fbSaving}
                              className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {fbSaving ? "Salvando..." : "Salvar feedback"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
              <p className="text-gray-400 text-center mt-20">
                Selecione uma conversa
              </p>
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
