import { API_URL } from "./client";
import type { ApiPlan } from "./signup";

/**
 * Plans for the Pricing page: the active, public plans of the back office (Subscriptions > Plans),
 * loaded on the server on each request. [] when the API can't be reached.
 */
export async function getPublicPlans(): Promise<ApiPlan[]> {
  if (!API_URL) return [];
  try {
    const response = await fetch(`${API_URL}?action=pjActionGetPlans`, { method: "POST", body: new FormData(), cache: "no-store" });
    if (!response.ok) return [];
    const json = (await response.json()) as { status?: string; data?: { plans?: ApiPlan[] } };
    return json.status === "OK" && Array.isArray(json.data?.plans) ? json.data.plans : [];
  } catch {
    return [];
  }
}
