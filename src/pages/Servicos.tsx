import { useEffect, useState } from "react";
import { api } from "../api";

interface Servico {
  id: string;
  nome_servico: string;
  category: string;
  ativo: boolean;
  descricao_completa: string;
  roteiro: string;
  duracao: string;
  valor_adulto: number | null;
  valor_crianca: number | null;
  o_que_inclui: string;
  ponto_de_encontro: string;
  tipo_veiculo: string;
  capacidade_passageiros: number | null;
  trecho_principal: string;
  valor_trecho: number | null;
  observacoes: string;
  keywords: string[];
  priority: number;
}

const EMPTY_SERVICO: Omit<Servico, "id"> = {
  nome_servico: "",
  category: "passeios",
  ativo: true,
  descricao_completa: "",
  roteiro: "",
  duracao: "",
  valor_adulto: null,
  valor_crianca: null,
  o_que_inclui: "",
  ponto_de_encontro: "",
  tipo_veiculo: "",
  capacidade_passageiros: null,
  trecho_principal: "",
  valor_trecho: null,
  observacoes: "",
  keywords: [],
  priority: 1,
};

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Servico | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Servico, "id">>(EMPTY_SERVICO);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchServicos = () => {
    setLoading(true);
    api.getServicos(undefined, true)
      .then((d) => setServicos(d.servicos || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchServicos, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_SERVICO });
    setKeywordInput("");
    setCreating(true);
  };

  const startEdit = (s: Servico) => {
    setCreating(false);
    setEditing(s);
    setForm({
      nome_servico: s.nome_servico,
      category: s.category,
      ativo: s.ativo,
      descricao_completa: s.descricao_completa || "",
      roteiro: s.roteiro || "",
      duracao: s.duracao || "",
      valor_adulto: s.valor_adulto,
      valor_crianca: s.valor_crianca,
      o_que_inclui: s.o_que_inclui || "",
      ponto_de_encontro: s.ponto_de_encontro || "",
      tipo_veiculo: s.tipo_veiculo || "",
      capacidade_passageiros: s.capacidade_passageiros,
      trecho_principal: s.trecho_principal || "",
      valor_trecho: s.valor_trecho,
      observacoes: s.observacoes || "",
      keywords: s.keywords || [],
      priority: s.priority || 1,
    });
    setKeywordInput("");
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
    setError("");
  };

  const save = async () => {
    if (!form.nome_servico || !form.category) {
      setError("Nome e categoria são obrigatórios");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (creating) {
        await api.createServico(form);
        setSuccess("Serviço criado!");
      } else if (editing) {
        await api.updateServico({ id: editing.id, ...form });
        setSuccess("Serviço atualizado!");
      }
      setCreating(false);
      setEditing(null);
      fetchServicos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError((e as Error).message);
    }
    setSaving(false);
  };

  const toggleAtivo = async (s: Servico) => {
    try {
      await api.updateServico({ id: s.id, ativo: !s.ativo });
      fetchServicos();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteServico = async (s: Servico) => {
    if (!confirm(`Excluir "${s.nome_servico}"?`)) return;
    try {
      await api.deleteServico(s.id);
      fetchServicos();
      setSuccess("Serviço excluído");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !form.keywords.includes(kw)) {
      updateField("keywords", [...form.keywords, kw]);
    }
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    updateField("keywords", form.keywords.filter((k) => k !== kw));
  };

  const isPasseio = form.category === "passeios";

  const passeios = servicos.filter((s) => s.category === "passeios");
  const transfers = servicos.filter((s) => s.category === "transfers");

  const filtered = filter ? servicos.filter((s) => s.category === filter) : servicos;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Serviços</h2>
          <p className="text-sm text-gray-500">
            {passeios.length} passeios, {transfers.length} transfers
            {servicos.filter((s) => !s.ativo).length > 0 && (
              <span className="text-red-500 ml-2">
                ({servicos.filter((s) => !s.ativo).length} inativos)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            <option value="passeios">Passeios</option>
            <option value="transfers">Transfers</option>
          </select>
          <button
            onClick={startCreate}
            className="bg-pipa-600 text-white px-4 py-1.5 rounded text-sm hover:bg-pipa-700 transition-colors"
          >
            + Novo Serviço
          </button>
        </div>
      </div>

      {error && !creating && !editing && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded mb-4 text-sm flex items-center justify-between">
          <span>Erro: {error}</span>
          <button
            onClick={() => { setError(""); fetchServicos(); }}
            className="ml-3 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-xs font-medium transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">{success}</div>
      )}

      {/* Form (create or edit) */}
      {(creating || editing) && (
        <div className="bg-white rounded-lg shadow p-5 mb-6 border border-pipa-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">
              {creating ? "Novo Serviço" : `Editar: ${editing!.nome_servico}`}
            </h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => updateField("ativo", e.target.checked)}
                className="rounded"
              />
              Ativo
            </label>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Serviço *</label>
              <input
                type="text"
                value={form.nome_servico}
                onChange={(e) => updateField("nome_servico", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                placeholder="Ex: Passeio de Barco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categoria *</label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
              >
                <option value="passeios">Passeios</option>
                <option value="transfers">Transfers</option>
              </select>
            </div>

            {isPasseio ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor Adulto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valor_adulto ?? ""}
                    onChange={(e) => updateField("valor_adulto", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                    placeholder="85.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor Criança (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valor_crianca ?? ""}
                    onChange={(e) => updateField("valor_crianca", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                    placeholder="42.50"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Trecho Principal</label>
                  <input
                    type="text"
                    value={form.trecho_principal}
                    onChange={(e) => updateField("trecho_principal", e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                    placeholder="Aeroporto NAT -> Pipa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor do Trecho (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valor_trecho ?? ""}
                    onChange={(e) => updateField("valor_trecho", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                    placeholder="180.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Veículo</label>
                  <input
                    type="text"
                    value={form.tipo_veiculo}
                    onChange={(e) => updateField("tipo_veiculo", e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                    placeholder="Spin, Van executiva..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacidade (passageiros)</label>
                  <input
                    type="number"
                    value={form.capacidade_passageiros ?? ""}
                    onChange={(e) => updateField("capacidade_passageiros", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                    placeholder="4"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Duração</label>
              <input
                type="text"
                value={form.duracao}
                onChange={(e) => updateField("duracao", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                placeholder="3 horas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridade (1-10)</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => updateField("priority", parseInt(e.target.value) || 1)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                min={1}
                max={10}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Descrição Completa</label>
              <textarea
                value={form.descricao_completa}
                onChange={(e) => updateField("descricao_completa", e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                placeholder="Descrição detalhada do serviço..."
              />
            </div>

            {isPasseio && (
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Roteiro</label>
                <textarea
                  value={form.roteiro}
                  onChange={(e) => updateField("roteiro", e.target.value)}
                  rows={2}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                  placeholder="Saída do Centro -> Praia do Amor -> Baía dos Golfinhos..."
                />
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">O que inclui</label>
              <textarea
                value={form.o_que_inclui}
                onChange={(e) => updateField("o_que_inclui", e.target.value)}
                rows={2}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                placeholder="Transporte, guia, colete..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ponto de Encontro</label>
              <input
                type="text"
                value={form.ponto_de_encontro}
                onChange={(e) => updateField("ponto_de_encontro", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                placeholder="Praia do Centro de Pipa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <input
                type="text"
                value={form.observacoes}
                onChange={(e) => updateField("observacoes", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                placeholder="Informações adicionais..."
              />
            </div>

            {/* Keywords */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Keywords (para busca da Sofia)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addKeyword(); }
                  }}
                  className="flex-1 border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-pipa-500 focus:border-pipa-500 outline-none"
                  placeholder="Digite e pressione Enter..."
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-3 py-1.5 bg-pipa-100 text-pipa-700 rounded text-sm hover:bg-pipa-200 transition-colors"
                >
                  Adicionar
                </button>
              </div>
              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-pipa-50 text-pipa-700 rounded text-xs border border-pipa-200"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="text-pipa-400 hover:text-red-500 font-bold"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t">
            <button
              onClick={save}
              disabled={saving}
              className="bg-pipa-600 text-white px-6 py-2 rounded font-medium hover:bg-pipa-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Salvando..." : creating ? "Criar Serviço" : "Salvar Alterações"}
            </button>
            <button
              onClick={cancel}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Services list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-400">
          <p className="text-lg mb-2">Nenhum serviço cadastrado</p>
          <p className="text-sm">Clique em "+ Novo Serviço" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-lg shadow overflow-hidden transition-opacity ${!s.ativo ? "opacity-50" : ""}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{s.nome_servico}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          s.category === "passeios"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {s.category}
                      </span>
                      {!s.ativo && (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-600">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {s.category === "passeios" ? (
                        <>
                          Adulto: <b>R$ {s.valor_adulto != null ? Number(s.valor_adulto).toFixed(2) : "—"}</b>
                          {" | "}
                          Criança: <b>R$ {s.valor_crianca != null ? Number(s.valor_crianca).toFixed(2) : "—"}</b>
                          {s.duracao && <> | {s.duracao}</>}
                        </>
                      ) : (
                        <>
                          {s.trecho_principal && <>{s.trecho_principal} | </>}
                          Valor: <b>R$ {s.valor_trecho != null ? Number(s.valor_trecho).toFixed(2) : "—"}</b>
                          {s.tipo_veiculo && <> | {s.tipo_veiculo}</>}
                          {s.capacidade_passageiros && <> | {s.capacidade_passageiros} pass.</>}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleAtivo(s)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        s.ativo
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s.ativo ? "Ativo" : "Inativo"}
                    </button>
                    <button
                      onClick={() => startEdit(s)}
                      className="px-3 py-1 rounded text-xs bg-pipa-100 text-pipa-700 hover:bg-pipa-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteServico(s)}
                      className="px-3 py-1 rounded text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === s.id && (
                  <div className="mt-3 pt-3 border-t text-sm text-gray-600 space-y-1">
                    {s.descricao_completa && <p><b>Descrição:</b> {s.descricao_completa}</p>}
                    {s.roteiro && <p><b>Roteiro:</b> {s.roteiro}</p>}
                    {s.o_que_inclui && <p><b>Inclui:</b> {s.o_que_inclui}</p>}
                    {s.ponto_de_encontro && <p><b>Ponto de encontro:</b> {s.ponto_de_encontro}</p>}
                    {s.observacoes && <p><b>Obs:</b> {s.observacoes}</p>}
                    {s.keywords && s.keywords.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <b>Keywords:</b>
                        {s.keywords.map((kw) => (
                          <span key={kw} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
