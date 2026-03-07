import { useEffect, useState } from "react";
import { api } from "../api";

interface AnalyticsData {
  summary: {
    total_conversations: number;
    total_leads: number;
    total_messages: number;
    conversion_rate: number;
  };
  messages_per_day: { day: string; count: string }[];
  leads_by_status: { status: string; count: string }[];
  recent_activity: { day: string; conversations: string; messages: string; leads: string }[];
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-pipa-700 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAnalytics().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-500">Erro: {error}</p>;
  if (!data) return <p className="text-gray-400">Carregando...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Conversas" value={data.summary.total_conversations} />
        <StatCard label="Mensagens" value={data.summary.total_messages} />
        <StatCard label="Leads" value={data.summary.total_leads} />
        <StatCard label="Conversao" value={`${data.summary.conversion_rate}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Messages per day */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold mb-3">Mensagens / Dia (30d)</h3>
          {data.messages_per_day.length === 0 ? (
            <p className="text-gray-400 text-sm">Sem dados</p>
          ) : (
            <div className="space-y-1">
              {data.messages_per_day.slice(0, 10).map((d) => (
                <div key={d.day} className="flex justify-between text-sm">
                  <span className="text-gray-600">{new Date(d.day).toLocaleDateString("pt-BR")}</span>
                  <span className="font-mono text-pipa-700">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leads by status */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold mb-3">Leads por Status</h3>
          {data.leads_by_status.length === 0 ? (
            <p className="text-gray-400 text-sm">Sem leads</p>
          ) : (
            <div className="space-y-2">
              {data.leads_by_status.map((l) => (
                <div key={l.status} className="flex justify-between items-center">
                  <span className="text-sm capitalize px-2 py-1 rounded bg-gray-100">{l.status}</span>
                  <span className="font-bold text-pipa-700">{l.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
