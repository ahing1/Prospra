import api from "@/lib/axios";

export type BillingStatusResponse = {
  status: string | null;
  plan: string | null;
  entitled: boolean;
  entitlement_expires_at: string | null;
  last_event_id: string | null;
};

export async function getBillingStatus(userId: string): Promise<BillingStatusResponse> {
  const { data } = await api.get<BillingStatusResponse>("/billing/status", {
    headers: { "X-User-Id": userId },
  });
  return data;
}
