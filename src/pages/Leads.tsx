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

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("");
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
        <h2 className="text-xl font-bold">Leads</h2>
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
          Nenhum lead {filter ? `com status "${filter}"` : ""}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Telefone</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Servico</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{l.full_name}</td>
                  <td className="p-3 text-gray-600">{l.phone_number}</td>
                  <td className="p-3 text-gray-600">{l.email}</td>
                  <td className="p-3">{l.service_category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[l.status] || "bg-gray-100"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(l.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3">
                    <select
                      value={l.status}
                      onChange={(e) => updateStatus(l.id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      <option value="new">Novo</option>
                      <option value="contacted">Contactado</option>
                      <option value="qualified">Qualificado</option>
                      <option value="converted">Convertido</option>
                      <option value="lost">Perdido</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
