export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  city: string;
  isParticular: string;
  message: string;
  createdAt: string;
}

const STORAGE_KEY = "lopes_leads";

export function getLeads(): Lead[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLead(lead: Omit<Lead, "id" | "createdAt">): Lead {
  const newLead: Lead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const leads = getLeads();
  leads.unshift(newLead);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  return newLead;
}

export function deleteLead(id: string): void {
  const leads = getLeads().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}
