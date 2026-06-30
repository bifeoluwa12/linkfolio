
import useSWR from "swr";
import { Profile, ProfileUpdatePayload } from "@/types";
import { apiFetch } from "@/lib/utils";

const fetcher = (url: string) => apiFetch<{ data: Profile }>(url).then((r) => r.data);

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<Profile>(
    "/api/profile",
    fetcher,
    { revalidateOnFocus: false }
  );

  // Optimistic update — updates UI instantly, syncs to server in background
  async function updateProfile(payload: ProfileUpdatePayload) {
    if (!data) return;

    const optimistic = { ...data, ...payload };

    await mutate(
      async () => {
        const updated = await apiFetch<{ data: Profile }>("/api/profile", {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        return updated.data;
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  return {
    profile: data,
    isLoading,
    isError: !!error,
    updateProfile,
  };
}