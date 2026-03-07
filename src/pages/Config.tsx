import { useEffect, useState } from "react";
import { api } from "../api";

export default function Config() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [active, setActive] = useState(true);
  const [model, setModel] = useState("anthropic/claude-sonnet-4");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getConfig()
      .then((d) => {
        setSystemPrompt(d.system_prompt || "");
        setActive(d.active);
        setModel(d.model || "anthropic/claude-sonnet-4");
      })
      .catch((e) => setError(e.message));
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.updateConfig({ system_prompt: systemPrompt || null, active, model });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError((e as Error).message);
    }
    setSaving(false);
  };

  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Configuracao do Bot</h2>

      <div className="bg-white rounded-lg shadow p-5 space-y-5">
        {/* Active toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Bot Ativo</p>
            <p className="text-sm text-gray-500">Quando desligado, mensagens nao sao respondidas</p>
          </div>
          <button
            onClick={() => setActive(!active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              active ? "bg-pipa-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Model selector */}
        <div>
          <label className="block font-semibold mb-1">Modelo IA</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="anthropic/claude-sonnet-4">Claude Sonnet 4 (recomendado)</option>
            <option value="anthropic/claude-haiku-4">Claude Haiku 4 (rapido/barato)</option>
            <option value="x-ai/grok-4.1-fast">Grok 4.1 Fast (ultra rapido)</option>
            <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
          </select>
        </div>

        {/* System prompt */}
        <div>
          <label className="block font-semibold mb-1">System Prompt</label>
          <p className="text-xs text-gray-500 mb-2">
            Deixe vazio para usar o prompt padrao da Helena. Customize para alterar o comportamento.
          </p>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={16}
            placeholder="Deixe vazio para prompt padrao..."
            className="w-full border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-pipa-600 text-white px-5 py-2 rounded hover:bg-pipa-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {saved && <span className="text-pipa-600 text-sm">Salvo com sucesso!</span>}
        </div>
      </div>
    </div>
  );
}
