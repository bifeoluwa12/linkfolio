

import useSWR from "swr";
import { Link, LinkCreatePayload, LinkUpdatePayload } from "@/types";
import { apiFetch } from "@/lib/utils";

const fetcher = (url: string) =>
  apiFetch<{ data: Link[] }>(url).then((r) => r.data);

export function useLinks() {
  const { data, error, isLoading, mutate } = useSWR<Link[]>(
    "/api/links",
    fetcher,
    { revalidateOnFocus: false }
  );

  const links = data ?? [];

  // ── Create ──────────────────────────────────────────────────────────────────
  async function addLink(payload: LinkCreatePayload) {
    const tempLink: Link = {
      id: `temp_${Date.now()}`,
      ...payload,
      order: links.length,
      clicks: 0,
      active: true,
      profileId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mutate(
      async () => {
        const res = await apiFetch<{ data: Link }>("/api/links", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return [...links, res.data];
      },
      { optimisticData: [...links, tempLink], rollbackOnError: true, revalidate: false }
    );
  }

  // ── Update ──────────────────────────────────────────────────────────────────
  async function updateLink(id: string, payload: LinkUpdatePayload) {
    const optimistic = links.map((l) => (l.id === id ? { ...l, ...payload } : l));

    await mutate(
      async () => {
        await apiFetch(`/api/links/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        return optimistic;
      },
      { optimisticData: optimistic, rollbackOnError: true, revalidate: false }
    );
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function deleteLink(id: string) {
    const optimistic = links.filter((l) => l.id !== id);

    await mutate(
      async () => {
        await apiFetch(`/api/links/${id}`, { method: "DELETE" });
        return optimistic;
      },
      { optimisticData: optimistic, rollbackOnError: true, revalidate: false }
    );
  }

  // ── Reorder (drag-and-drop) ─────────────────────────────────────────────────
  // Call this after every successful drag drop with the new ordered array.
  // Optimistically updates UI, then persists order integers to DB in one PATCH.
  async function reorderLinks(reordered: Link[]) {
    const withOrder = reordered.map((l, i) => ({ ...l, order: i }));
    const orderedIds = withOrder.map((l) => l.id);

    await mutate(
      async () => {
        await apiFetch("/api/links/reorder", {
          method: "PUT",
          body: JSON.stringify({ orderedIds }),
        });
        return withOrder;
      },
      { optimisticData: withOrder, rollbackOnError: true, revalidate: false }
    );
  }

  return {
    links,
    isLoading,
    isError: !!error,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
  };
}