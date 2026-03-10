import { useEffect, useState } from "react";
import { api } from "../api";

interface Lead {
  id: string;
  phone_number: string;
  full_name: string;
  email: string;
  service_category: string;
  service_interest: string;
  qualification_data: Record<string, unknown>;
  status: string;
  priority: number;
  notes: string;
  assigned_to: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-pipa-100 text-pipa-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  contacted: "Contactado",
  qualified: "Qualificado",
  converted: "Convertido",
  lost: "Perdido",
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchLeads = () => {
    api.getLeads(filter || undefined).then((d) => setLeads(d.leads)).catch((e) => setError(e.message));
  };

  useEffect(fetchLeads, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await api.updateLead({ id, status });
    fetchLeads();
  };

  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Leads ({leads.length})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          <option value="new">Novos</option>
          <option value="contacted">Contactados</option>
          <option value="qualified">Qualificados</option>
          <option value="converted">Convertidos</option>
          <option value="lost">Perdidos</option>
        </select>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-400">
          Nenhum lead {filter ? `com status "${STATUS_LABELS[filter] || filter}"` : ""}
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                onClick={() => setExpanded(expanded === l.id ? null : l.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold">{l.full_name || "Sem nome"}</p>
                    <p className="text-sm text-gray-500">{l.phone_number}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[l.status] || "bg-gray-100"}`}>
                    {STATUS_LABELS[l.status] || l.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={l.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateStatus(l.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="new">Novo</option>
                    <option value="contacted">Contactado</option>
                    <option value="qualified">Qualificado</option>
                    <option value="converted">Convertido</option>
                    <option value="lost">Perdido</option>
                  </select>
                  <span className="text-gray-400 text-sm">
                    {new Date(l.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="text-gray-400">{expanded === l.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expanded === l.id && (
                <div className="border-t px-4 py-3 bg-gray-50 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500">Email:</span>{" "}
                      <span className="font-medium">{l.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Serviço:</span>{" "}
                      <span className="font-medium">{l.service_category || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Interesse:</span>{" "}
                      <span className="font-medium">{l.service_interest || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Prioridade:</span>{" "}
                      <span className="font-medium">{l.priority || "—"}</span>
                    </div>
                  </div>

                  {l.qualification_data && Object.keys(l.qualification_data).length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-gray-500 font-medium mb-1">Dados de Qualificação:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(l.qualification_data).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-400">{key}:</span>{" "}
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {l.notes && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="text-gray-500">Notas:</span> {l.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
