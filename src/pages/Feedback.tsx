import { useEffect, useState } from "react";
import { api } from "../api";

interface FeedbackEntry {
  id: string;
  rating: "good" | "bad";
  category: string | null;
  expected_response: string | null;
  comment: string | null;
  created_at: string;
  bot_response: string;
  message_at: string;
  user_input: string | null;
}

interface FeedbackSummary {
  stats: { total: string; good: string; bad: string };
  categories: Array<{ category: string; count: string }>;
  recent_bad: Array<{
    id: string;
    category: string;
    expected_response: string;
    comment: string;
    original_content: string;
    user_message: string;
    created_at: string;
  }>;
}

interface Improvement {
  feedback_count: number;
  analysis: {
    patterns?: Array<{ issue: string; frequency: string; severity: string }>;
    suggestions?: Array<{
      description: string;
      prompt_addition: string;
      replaces: string | null;
    }>;
    summary?: string;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  idioma_errado: "Idioma errado",
  info_inventada: "Info inventada",
  formal_demais: "Formal demais",
  fora_tema: "Fora do tema",
  incompleta: "Incompleta",
  repetitiva: "Repetitiva",
  outro: "Outro",
};

export default function Feedback() {
  const [tab, setTab] = useState<"all" | "summary" | "improve">("all");
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [improvement, setImprovement] = useState<Improvement | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "good" | "bad">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [fbData, sumData] = await Promise.all([
        api.getFeedbacks(),
        api.getFeedbackSummary(),
      ]);
      setFeedbacks(fbData.feedbacks || []);
      setSummary(sumData);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateImprovement() {
    setLoading(true);
    setError("");
    try {
      const result = await api.generateImprovement();
      setImprovement(result);
      setTab("improve");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const filtered =
    filter === "all"
      ? feedbacks
      : feedbacks.filter((f) => f.rating === filter);

  const totalNum = Number(summary?.stats?.total || 0);
  const badNum = Number(summary?.stats?.bad || 0);
  const goodNum = Number(summary?.stats?.good || 0);
  const badPct = totalNum > 0 ? Math.round((badNum / totalNum) * 100) : 0;

  if (error && !feedbacks.length)
    return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Feedback da Sofia</h2>
          <p className="text-sm text-gray-500">
            Avaliações do modo teste para melhorar o bot
          </p>
        </div>
        <button
          onClick={handleGenerateImprovement}
          disabled={loading || badNum === 0}
          className="px-4 py-2 bg-pipa-600 text-white rounded-lg text-sm font-medium hover:bg-pipa-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Analisando..." : "Gerar sugestões de melhoria"}
        </button>
      </div>

      {/* Stats cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold">{totalNum}</p>
            <p className="text-xs text-gray-500">Total avaliações</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-green-600">{goodNum}</p>
            <p className="text-xs text-gray-500">Corretas</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-red-600">{badNum}</p>
            <p className="text-xs text-gray-500">Precisam melhorar</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-orange-600">{badPct}%</p>
            <p className="text-xs text-gray-500">Taxa de erro</p>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {summary && summary.categories.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-sm font-semibold mb-3">
            Categorias de erro mais frequentes
          </h3>
          <div className="flex flex-wrap gap-2">
            {summary.categories.map((c) => (
              <span
                key={c.category}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium"
              >
                {CATEGORY_LABELS[c.category] || c.category}
                <span className="bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  {c.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["all", "summary", "improve"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-pipa-700 shadow"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {t === "all"
              ? "Todos os feedbacks"
              : t === "summary"
                ? "Resumo detalhado"
                : "Sugestões IA"}
          </button>
        ))}
      </div>

      {/* Tab: All feedbacks */}
      {tab === "all" && (
        <div className="bg-white rounded-lg shadow">
          {/* Filter bar */}
          <div className="p-3 border-b flex gap-2">
            {(["all", "bad", "good"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filter === f
                    ? f === "bad"
                      ? "bg-red-100 text-red-700"
                      : f === "good"
                        ? "bg-green-100 text-green-700"
                        : "bg-pipa-100 text-pipa-700"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f === "all" ? "Todos" : f === "bad" ? "Erros" : "Corretos"}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-sm">
              Nenhum feedback ainda. Teste a Sofia e avalie as respostas!
            </p>
          ) : (
            <div className="divide-y">
              {filtered.map((f) => (
                <div key={f.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 text-lg ${
                        f.rating === "good" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {f.rating === "good" ? "👍" : "👎"}
                    </span>
                    <div className="flex-1 min-w-0">
                      {/* User input */}
                      {f.user_input && (
                        <div className="mb-2">
                          <p className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">
                            Usuário perguntou
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded px-2 py-1">
                            {f.user_input}
                          </p>
                        </div>
                      )}

                      {/* Bot response */}
                      <div className="mb-2">
                        <p className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">
                          Sofia respondeu
                        </p>
                        <p
                          className={`text-sm rounded px-2 py-1 ${
                            f.rating === "bad"
                              ? "bg-red-50 text-red-900"
                              : "bg-green-50 text-green-900"
                          }`}
                        >
                          {f.bot_response}
                        </p>
                      </div>

                      {/* Expected response */}
                      {f.expected_response && (
                        <div className="mb-2">
                          <p className="text-[10px] uppercase text-green-600 font-semibold mb-0.5">
                            Deveria ter respondido
                          </p>
                          <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded px-2 py-1">
                            {f.expected_response}
                          </p>
                        </div>
                      )}

                      {/* Comment */}
                      {f.comment && (
                        <div className="mb-2">
                          <p className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">
                            Comentário
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            {f.comment}
                          </p>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex gap-3 mt-2">
                        {f.category && (
                          <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
                            {CATEGORY_LABELS[f.category] || f.category}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {new Date(f.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Summary */}
      {tab === "summary" && summary && (
        <div className="bg-white rounded-lg shadow p-4">
          {summary.recent_bad.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              Nenhum feedback negativo para analisar
            </p>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700">
                Últimos erros detalhados ({summary.recent_bad.length})
              </h3>
              {summary.recent_bad.map((f, i) => (
                <div
                  key={f.id}
                  className="border border-red-100 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-red-600">
                      #{i + 1}
                    </span>
                    {f.category && (
                      <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                        {CATEGORY_LABELS[f.category] || f.category}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {new Date(f.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {f.user_message && (
                    <p className="text-xs text-gray-500 mb-1">
                      <strong>Input:</strong> {f.user_message}
                    </p>
                  )}
                  <p className="text-xs text-red-700 mb-1">
                    <strong>Bot:</strong> {f.original_content}
                  </p>
                  {f.expected_response && (
                    <p className="text-xs text-green-700 mb-1">
                      <strong>Esperado:</strong> {f.expected_response}
                    </p>
                  )}
                  {f.comment && (
                    <p className="text-xs text-gray-500 italic">
                      {f.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: AI Improvement */}
      {tab === "improve" && (
        <div className="bg-white rounded-lg shadow p-4">
          {!improvement ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-4">
                Clique em "Gerar sugestões de melhoria" para a IA analisar os
                feedbacks e sugerir mudanças no prompt da Sofia
              </p>
              <button
                onClick={handleGenerateImprovement}
                disabled={loading || badNum === 0}
                className="px-4 py-2 bg-pipa-600 text-white rounded-lg text-sm hover:bg-pipa-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Analisando..." : "Gerar sugestões"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              {improvement.analysis.summary && (
                <div className="bg-pipa-50 rounded-lg p-3">
                  <p className="text-sm text-pipa-800">
                    {improvement.analysis.summary}
                  </p>
                  <p className="text-[10px] text-pipa-500 mt-1">
                    Baseado em {improvement.feedback_count} feedbacks negativos
                  </p>
                </div>
              )}

              {/* Patterns */}
              {improvement.analysis.patterns &&
                improvement.analysis.patterns.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Padrões detectados
                    </h3>
                    <div className="space-y-2">
                      {improvement.analysis.patterns.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.severity === "alta"
                                ? "bg-red-500"
                                : p.severity === "media"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                            }`}
                          />
                          <span className="text-gray-700">{p.issue}</span>
                          <span className="text-[10px] text-gray-400 ml-auto">
                            {p.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Suggestions */}
              {improvement.analysis.suggestions &&
                improvement.analysis.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Sugestões de melhoria do prompt
                    </h3>
                    <div className="space-y-3">
                      {improvement.analysis.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="border border-green-200 rounded-lg p-3"
                        >
                          <p className="text-sm text-gray-700 mb-2">
                            {s.description}
                          </p>
                          {s.replaces && (
                            <div className="mb-2">
                              <p className="text-[10px] uppercase text-red-500 font-semibold">
                                Substituir
                              </p>
                              <pre className="text-xs bg-red-50 rounded p-2 whitespace-pre-wrap text-red-700">
                                {s.replaces}
                              </pre>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] uppercase text-green-600 font-semibold">
                              {s.replaces ? "Por" : "Adicionar"}
                            </p>
                            <pre className="text-xs bg-green-50 rounded p-2 whitespace-pre-wrap text-green-700">
                              {s.prompt_addition}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-4">Erro: {error}</p>
      )}
    </div>
  );
}
