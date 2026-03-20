const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_SECRET = import.meta.env.VITE_API_SECRET || "vivepipa-secret-2026";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_SECRET}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getAnalytics: () => apiFetch("/analytics"),
  getConversations: () => apiFetch("/conversations"),
  getConversation: (phone: string) => apiFetch(`/conversations?phone=${phone}`),
  getConfig: () => apiFetch("/config"),
  updateConfig: (data: Record<string, unknown>) =>
    apiFetch("/config", { method: "PUT", body: JSON.stringify(data) }),
  getLeads: (status?: string) =>
    apiFetch(`/leads${status ? `?status=${status}` : ""}`),
  updateLead: (data: Record<string, unknown>) =>
    apiFetch("/leads", { method: "PUT", body: JSON.stringify(data) }),
  getServicos: (category?: string, all?: boolean) =>
    apiFetch(`/servicos?${category ? `category=${category}&` : ""}${all ? "all=true" : ""}`),
  createServico: (data: Record<string, unknown>) =>
    apiFetch("/servicos", { method: "POST", body: JSON.stringify(data) }),
  updateServico: (data: Record<string, unknown>) =>
    apiFetch("/servicos", { method: "PUT", body: JSON.stringify(data) }),
  deleteServico: (id: string) =>
    apiFetch("/servicos", { method: "DELETE", body: JSON.stringify({ id }) }),
  testBot: (message: string) =>
    apiFetch("/test", { method: "POST", body: JSON.stringify({ message }) }),
  clearTestConversation: () =>
    apiFetch("/test", { method: "DELETE" }),
  submitFeedback: (data: {
    message_id: string;
    rating: "good" | "bad";
    category?: string;
    expected_response?: string;
    comment?: string;
  }) =>
    apiFetch("/test/feedback", { method: "POST", body: JSON.stringify(data) }),
  getFeedbackSummary: () => apiFetch("/test/feedback?summary=true"),
};
