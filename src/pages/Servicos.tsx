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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchServicos = () => {
    api.getServicos(filter || undefined, true)
      .then((d) => setServicos(d.servicos))
      .catch((e) => setError(e.message));
  };

  useEffect(fetchServicos, [filter]);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_SERVICO });
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

  const isPasseio = form.category === "passeios";

  const passeios = servicos.filter((s) => s.category === "passeios");
  const transfers = servicos.filter((s) => s.category === "transfers");

  const filtered = filter ? servicos.filter((s) => s.category === filter) : servicos;

  if (error && !creating && !editing) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Serviços ({passeios.length} passeios, {transfers.length} transfers)
        </h2>
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

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">{success}</div>
      )}

      {/* Form (create or edit) */}
      {(creating || editing) && (
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h3 className="font-bold mb-4">{creating ? "Novo Serviço" : `Editar: ${editing!.nome_servico}`}</h3>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Serviço *</label>
              <input
                type="text"
                value={form.nome_servico}
                onChange={(e) => updateField("nome_servico", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Ex: Passeio de Barco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categoria *</label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
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
                    className="w-full border rounded px-3 py-2 text-sm"
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
                    className="w-full border rounded px-3 py-2 text-sm"
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
                    className="w-full border rounded px-3 py-2 text-sm"
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
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="180.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Veículo</label>
                  <input
                    type="text"
                    value={form.tipo_veiculo}
                    onChange={(e) => updateField("tipo_veiculo", e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Spin, Van executiva..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacidade (passageiros)</label>
                  <input
                    type="number"
                    value={form.capacidade_passageiros ?? ""}
                    onChange={(e) => updateField("capacidade_passageiros", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full border rounded px-3 py-2 text-sm"
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
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="3 horas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridade</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => updateField("priority", parseInt(e.target.value) || 1)}
                className="w-full border rounded px-3 py-2 text-sm"
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
                className="w-full border rounded px-3 py-2 text-sm"
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
                  className="w-full border rounded px-3 py-2 text-sm"
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
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Transporte, guia, colete..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ponto de Encontro</label>
              <input
                type="text"
                value={form.ponto_de_encontro}
                onChange={(e) => updateField("ponto_de_encontro", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Praia do Centro de Pipa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <input
                type="text"
                value={form.observacoes}
                onChange={(e) => updateField("observacoes", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Informações adicionais..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={save}
              disabled={saving}
              className="bg-pipa-600 text-white px-5 py-2 rounded hover:bg-pipa-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Salvando..." : creating ? "Criar" : "Salvar"}
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
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-400">
          Nenhum serviço cadastrado
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-lg shadow overflow-hidden ${!s.ativo ? "opacity-60" : ""}`}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
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
                    <p className="text-sm text-gray-500 mt-1">
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
                    {s.descricao_completa && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-lg">
                        {s.descricao_completa}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
